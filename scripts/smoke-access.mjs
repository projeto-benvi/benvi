const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';

const scenarios = [
  {
    name: 'guest',
    cookie: '',
    tests: [
      { name: 'guest missing page returns 404', path: '/rota-inexistente-smoke', statuses: [404] },
      { name: 'guest page private redirects to login', path: '/notificacoes', statuses: [302, 303, 307, 308], locationIncludes: '/login' },
      { name: 'guest admin page redirects to login', path: '/admin/usuarios', statuses: [302, 303, 307, 308], locationIncludes: '/login' },
      { name: 'guest invalid provider id returns 400', path: '/api/prestador/abc', statuses: [400] },
      { name: 'guest missing provider returns 404', path: '/api/prestador/999999', statuses: [404] },
      { name: 'guest invalid signup payload returns 400', path: '/api/usuario', method: 'POST', statuses: [400], body: {} },
      { name: 'guest notifications api returns 401', path: '/api/notificacao?id_usuario=1', statuses: [401] },
      { name: 'guest admin alerts api returns 401', path: '/api/admin/alertas?publicoAlvo=todos', statuses: [401] },
    ],
  },
  {
    name: 'user',
    cookie: process.env.SMOKE_COOKIE_USER || '',
    optional: true,
    tests: [
      { name: 'user page private opens', path: '/notificacoes', statuses: [200] },
      { name: 'user admin page redirects away', path: '/admin/usuarios', statuses: [302, 303, 307, 308], locationEquals: '/' },
      { name: 'user admin alerts api returns 403', path: '/api/admin/alertas?publicoAlvo=todos', statuses: [403] },
    ],
  },
  {
    name: 'prestador',
    cookie: process.env.SMOKE_COOKIE_PRESTADOR || '',
    optional: true,
    tests: [
      { name: 'prestador page opens', path: '/agendaPrestador', statuses: [200] },
      { name: 'prestador admin page redirects away', path: '/admin/usuarios', statuses: [302, 303, 307, 308], locationEquals: '/' },
    ],
  },
  {
    name: 'admin',
    cookie: process.env.SMOKE_COOKIE_ADMIN || '',
    optional: true,
    tests: [
      { name: 'admin page opens', path: '/admin/usuarios', statuses: [200] },
      { name: 'admin alerts api opens', path: '/api/admin/alertas?publicoAlvo=todos', statuses: [200] },
    ],
  },
];

async function executarRequisicao(test, cookie) {
  const headers = {};

  if (cookie) {
    headers.cookie = cookie;
  }

  if (test.body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(new URL(test.path, baseUrl), {
    method: test.method || 'GET',
    redirect: 'manual',
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: test.body !== undefined ? JSON.stringify(test.body) : undefined,
  });

  return {
    status: response.status,
    location: response.headers.get('location') || '',
  };
}

function locationCorresponde(location, expected) {
  if (!location) return false;
  try {
    const url = new URL(location, baseUrl);
    return url.pathname === expected;
  } catch {
    return location === expected;
  }
}

async function main() {
  let hasFailure = false;

  console.log(`Base URL: ${baseUrl}`);

  for (const scenario of scenarios) {
    if (scenario.optional && !scenario.cookie) {
      console.log(`SKIP ${scenario.name}: defina a variavel de ambiente de cookie correspondente.`);
      continue;
    }

    for (const test of scenario.tests) {
      try {
        const result = await executarRequisicao(test, scenario.cookie);
        const statusOk = test.statuses.includes(result.status);
        const locationIncludesOk = !test.locationIncludes || result.location.includes(test.locationIncludes);
        const locationEqualsOk = !test.locationEquals || locationCorresponde(result.location, test.locationEquals);
        const passed = statusOk && locationIncludesOk && locationEqualsOk;

        if (passed) {
          console.log(`PASS ${scenario.name}: ${test.name} -> ${result.status}${result.location ? ` ${result.location}` : ''}`);
          continue;
        }

        hasFailure = true;
        console.error(`FAIL ${scenario.name}: ${test.name} -> status=${result.status} location=${result.location || '-'} expected=${test.statuses.join(',')}`);
      } catch (error) {
        hasFailure = true;
        console.error(`FAIL ${scenario.name}: ${test.name} -> ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main();