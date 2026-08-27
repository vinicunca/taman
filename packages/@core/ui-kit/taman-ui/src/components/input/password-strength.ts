/**
 * Shared password strength checks used by the strength meter and Zod schemas.
 * Keep this list in sync across UI and form validation.
 */
export const PASSWORD_STRENGTH_CHECKS = [
  /.{8,}/, // at least 8 characters
  /\d/, // at least 1 number
  /[a-z]/, // at least 1 lowercase letter
  /[A-Z]/, // at least 1 uppercase letter
  /[^A-Z0-9]/i, // at least 1 symbol
] as const;

export const PASSWORD_STRENGTH_MAX = PASSWORD_STRENGTH_CHECKS.length;

export function passwordStrengthScore(value = ''): number {
  return PASSWORD_STRENGTH_CHECKS.reduce(
    (score, pattern) => score + (pattern.test(value) ? 1 : 0),
    0,
  );
}

export function isPasswordStrong(value = ''): boolean {
  return passwordStrengthScore(value) === PASSWORD_STRENGTH_MAX;
}
