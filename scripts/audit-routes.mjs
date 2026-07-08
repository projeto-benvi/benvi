import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const repoRoot = process.cwd();
const appDir = path.join(repoRoot, 'app');
const sourceRoots = ['app', 'components', 'view', 'controller', 'service', 'hooks', 'proxy.ts'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const navMethods = new Set(['router.push', 'router.replace', 'redirect', 'permanentRedirect', 'NextResponse.redirect']);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function shouldIgnoreSegment(segment) {
  return (segment.startsWith('(') && segment.endsWith(')')) || segment.startsWith('@');
}

function normalizeRoutePath(route) {
  if (!route) return '/';
  const normalized = route.replace(/\/+/g, '/').replace(/\/+$/, '');
  return normalized || '/';
}

function routeSegmentToRegex(segment) {
  if (/^\[\[\.\.\..+\]\]$/.test(segment)) return '(?:/.+)?';
  if (/^\[\.\.\..+\]$/.test(segment)) return '/.+';
  if (/^\[.+\]$/.test(segment)) return '/[^/]+';
  return `/${segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
}

function buildRouteDefinition(pageFile) {
  const relativeDir = path.relative(appDir, path.dirname(pageFile));
  const rawSegments = relativeDir === '' ? [] : toPosix(relativeDir).split('/');
  const segments = rawSegments.filter((segment) => segment && !shouldIgnoreSegment(segment));
  const route = normalizeRoutePath(`/${segments.join('/')}`);
  const regexSource = segments.length === 0
    ? '^/$'
    : `^${segments.map(routeSegmentToRegex).join('')}/?$`;

  return {
    route,
    regex: new RegExp(regexSource),
    source: toPosix(path.relative(repoRoot, pageFile)),
  };
}

function walkFiles(target, callback) {
  if (!fs.existsSync(target)) return;
  const stats = fs.statSync(target);

  if (stats.isFile()) {
    callback(target);
    return;
  }

  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    walkFiles(path.join(target, entry.name), callback);
  }
}

function loadRoutes() {
  const routes = [];

  walkFiles(appDir, (filePath) => {
    if (path.basename(filePath) !== 'page.tsx') return;
    routes.push(buildRouteDefinition(filePath));
  });

  return routes.sort((left, right) => left.route.localeCompare(right.route));
}

function readSourceFiles() {
  const files = [];

  for (const entry of sourceRoots) {
    const fullPath = path.join(repoRoot, entry);
    walkFiles(fullPath, (filePath) => {
      if (!sourceExtensions.has(path.extname(filePath))) return;
      files.push(filePath);
    });
  }

  return files;
}

function normalizeCandidate(rawValue) {
  const value = rawValue.trim();

  if (!value) return { status: 'empty' };
  if (value === '#') return { status: 'hash' };
  if (value.startsWith('javascript:')) return { status: 'unsafe' };
  if (/^(https?:|mailto:|tel:)/i.test(value)) return { status: 'external' };
  if (!value.startsWith('/')) return { status: 'relative' };
  if (value.startsWith('/api/')) return { status: 'api' };

  const withoutInterpolations = value.replace(/\$\{[^}]+\}/g, '__DYNAMIC__');
  const pathname = withoutInterpolations.split(/[?#]/, 1)[0];
  return { status: 'internal', route: normalizeRoutePath(pathname) };
}

function getJsxAttributeNameText(nameNode) {
  return ts.isIdentifier(nameNode) ? nameNode.text : nameNode.getText();
}

function textFromInitializer(initializer) {
  if (!initializer) return '';
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (!ts.isJsxExpression(initializer) || !initializer.expression) return null;

  const expression = initializer.expression;
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }

  if (ts.isTemplateExpression(expression)) {
    let text = expression.head.text;
    for (const span of expression.templateSpans) {
      text += '${expr}';
      text += span.literal.text;
    }
    return text;
  }

  return null;
}

function textFromArgument(argument) {
  if (!argument) return null;
  if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) return argument.text;

  if (ts.isTemplateExpression(argument)) {
    let text = argument.head.text;
    for (const span of argument.templateSpans) {
      text += '${expr}';
      text += span.literal.text;
    }
    return text;
  }

  if (
    ts.isNewExpression(argument)
    && ts.isIdentifier(argument.expression)
    && argument.expression.text === 'URL'
    && argument.arguments?.length
  ) {
    return textFromArgument(argument.arguments[0]);
  }

  return null;
}

function addFinding(findings, sourceFile, node, kind, source, details) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  findings.push({
    kind,
    file: toPosix(path.relative(repoRoot, sourceFile.fileName)),
    line: position.line + 1,
    column: position.character + 1,
    source,
    details,
  });
}

function matchesKnownRoute(route, routes) {
  return routes.some((entry) => entry.regex.test(route));
}

function inspectCandidate(findings, sourceFile, node, rawValue, source, routes) {
  const candidate = normalizeCandidate(rawValue);

  if (candidate.status === 'empty') {
    addFinding(findings, sourceFile, node, 'empty-href', source, 'Link vazio.');
    return;
  }

  if (candidate.status === 'hash') {
    addFinding(findings, sourceFile, node, 'hash-href', source, 'Evite href="#"; use rota real ou botao com handler.');
    return;
  }

  if (candidate.status === 'unsafe') {
    addFinding(findings, sourceFile, node, 'unsafe-href', source, 'Evite javascript: em navegacao.');
    return;
  }

  if (candidate.status !== 'internal') return;

  if (!matchesKnownRoute(candidate.route, routes)) {
    addFinding(findings, sourceFile, node, 'missing-route', source, `Rota interna inexistente: ${candidate.route}`);
  }
}

function hasAttribute(node, name) {
  return node.properties.some((property) => ts.isJsxAttribute(property) && getJsxAttributeNameText(property.name) === name);
}

function inspectSourceFile(filePath, routes) {
  const content = fs.readFileSync(filePath, 'utf8');
  const scriptKind = filePath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);
  const findings = [];

  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      const attributes = node.attributes;

      if (tagName === 'Link' || tagName === 'a') {
        const hrefAttribute = attributes.properties.find(
          (property) => ts.isJsxAttribute(property) && getJsxAttributeNameText(property.name) === 'href'
        );

        if (hrefAttribute && ts.isJsxAttribute(hrefAttribute)) {
          const rawValue = textFromInitializer(hrefAttribute.initializer);
          if (rawValue !== null) {
            inspectCandidate(findings, sourceFile, hrefAttribute, rawValue, `${tagName} href`, routes);
          }
        }
      }

      if (tagName === 'button') {
        const hasOnClick = hasAttribute(attributes, 'onClick');
        const hasSubmitType = attributes.properties.some((property) => {
          if (!ts.isJsxAttribute(property) || getJsxAttributeNameText(property.name) !== 'type') return false;
          const value = textFromInitializer(property.initializer);
          return value === 'submit' || value === 'reset';
        });
        const hasDialogSemantics = hasAttribute(attributes, 'aria-controls') || hasAttribute(attributes, 'aria-expanded');

        if (!hasOnClick && !hasSubmitType && !hasDialogSemantics) {
          addFinding(
            findings,
            sourceFile,
            node,
            'button-without-handler',
            'button',
            'Botao sem handler aparente; confirme se deveria ser submit/reset ou receber onClick.'
          );
        }
      }
    }

    if (ts.isCallExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);

      if (navMethods.has(expressionText)) {
        const rawValue = textFromArgument(node.arguments[0]);
        if (rawValue !== null) {
          inspectCandidate(findings, sourceFile, node, rawValue, expressionText, routes);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

function printRouteInventory(routes) {
  console.log(`Rotas de pagina detectadas: ${routes.length}`);
  for (const route of routes) {
    console.log(`  ${route.route} <- ${route.source}`);
  }
}

function printFindings(findings) {
  if (findings.length === 0) {
    console.log('Nenhum problema critico de links/rotas encontrado.');
    return;
  }

  const critical = findings.filter((finding) => finding.kind !== 'button-without-handler');
  const warnings = findings.filter((finding) => finding.kind === 'button-without-handler');

  if (critical.length) {
    console.log('\nProblemas criticos:');
    for (const finding of critical) {
      console.log(`  [${finding.kind}] ${finding.file}:${finding.line}:${finding.column} - ${finding.details} (${finding.source})`);
    }
  }

  if (warnings.length) {
    console.log('\nAvisos de acessibilidade/interacao:');
    for (const finding of warnings) {
      console.log(`  [${finding.kind}] ${finding.file}:${finding.line}:${finding.column} - ${finding.details}`);
    }
  }
}

function main() {
  const routes = loadRoutes();
  const files = readSourceFiles();
  const findings = files.flatMap((filePath) => inspectSourceFile(filePath, routes));
  const criticalCount = findings.filter((finding) => finding.kind !== 'button-without-handler').length;

  printRouteInventory(routes);
  printFindings(findings);

  if (criticalCount > 0) {
    process.exitCode = 1;
  }
}

main();