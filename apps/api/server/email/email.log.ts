/** `john.doe@example.com` → `j***@example.com`. Keeps logs useful without full addresses. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) {
    return '***';
  }
  return `${email[0]}***${email.slice(at)}`;
}

export function logDeliveryError(template: string, to: string, error: unknown): void {
  console.error(`[EMAIL] delivery failed template=${template} to=${maskEmail(to)}`, error);
}
