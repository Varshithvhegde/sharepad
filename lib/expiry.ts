export const DEFAULT_EXPIRY_DAYS = 10;

export const EXPIRY_OPTIONS: { days: number | null; label: string }[] = [
  { days: 1, label: "1 day" },
  { days: 7, label: "7 days" },
  { days: DEFAULT_EXPIRY_DAYS, label: "10 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
  { days: null, label: "Never" },
];

export function daysUntil(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

/** Short human label for a notebook's remaining life, e.g. "3 days left". */
export function expiryLabel(expiresAt: string | null): string {
  const days = daysUntil(expiresAt);
  if (days === null) return "Kept forever";
  if (days <= 0) return "Expired";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/** True when the notebook is close enough to expiry to warrant a warning. */
export function expiringSoon(expiresAt: string | null): boolean {
  const days = daysUntil(expiresAt);
  return days !== null && days <= 3;
}
