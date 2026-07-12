export const DEFAULT_NOTIFICATION_TARGET = '/notificacoes';

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
  return normalizeInternalNavigationTarget(value) ?? DEFAULT_NOTIFICATION_TARGET;
}