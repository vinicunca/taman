import { z } from '@taman-core/form-ui';
import { isPasswordStrong } from '@taman-core/taman-ui';

export interface StrongPasswordMessages {
  required: string;
  strength: string;
}

/**
 * Zod password schema aligned with {@link passwordStrengthScore}.
 * Empty → required; otherwise must meet all strength checks.
 */
export function createStrongPasswordSchema(messages: StrongPasswordMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .refine(isPasswordStrong, { message: messages.strength });
}
