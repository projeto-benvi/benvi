export const DEFAULT_NOTIFICATION_TARGET = '/notificacoes';

const NOTIFICATION_ROUTES = [
  '/notificacoes',
  '/mensagens',
  '/perfil',
  '/agendaPrestador',
  '/pedidos',
  '/servicoPrestador',
  '/ajuda',
  '/alerta',
  '/buscar',
] as const;

export function normalizeInternalNavigationTarget(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;

  const normalized = value.trim();

  if (!normalized) return null;
  if (normalized.length > 255) return null;
  if (/[<>\u0000-\u001F]/.test(normalized)) return null;
  if (normalized === '#' || normalized.startsWith('javascript:')) return null;
  if (!normalized.startsWith('/') || normalized.startsWith('//')) return null;

  return normalized;
}

export function resolveNotificationTarget(value: unknown) {
  const target = normalizeInternalNavigationTarget(value);
  if (!target) return DEFAULT_NOTIFICATION_TARGET;

  let pathname: string;
  try {
    pathname = new URL(target, 'https://benvi.local').pathname.replace(/\/+$/, '') || '/';
  } catch {
    return DEFAULT_NOTIFICATION_TARGET;
  }

  const permitido = NOTIFICATION_ROUTES.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  return permitido ? target : DEFAULT_NOTIFICATION_TARGET;
}
