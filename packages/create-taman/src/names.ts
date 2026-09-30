import type { GenerateNames } from './types';

const NPM_NAME = /^[a-z0-9][\w.-]*$/;

/** Returns an error message, or undefined when `value` is a valid npm name part. */
export function validateName(value: string, label: string): string | undefined {
  if (!value) {
    return `${label} is required`;
  }
  if (value.length > 214) {
    return `${label} must be at most 214 characters`;
  }
  if (!NPM_NAME.test(value) || /[A-Z]/.test(value)) {
    return `${label} may only use lowercase letters, digits, "-", "." and "_", and must start with a letter or digit`;
  }
  return undefined;
}

/** Accepts `acme`, `@acme` or `@acme/` and returns `acme`. */
export function normalizeScope(value: string): string {
  return value.trim().replace(/^@/, '').replace(/\/$/, '');
}

export function toNames(name: string, scope: string): GenerateNames {
  return { name, nameSnake: name.replace(/[^a-z0-9]+/g, '_'), scope };
}
