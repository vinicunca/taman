import { defineErrorHandler } from 'nitro';
import { ZodError } from 'zod';
import { jsonError } from './error.utils';

/**
 * Converts a thrown ZodError into a clean 400. h3 wraps unhandled errors as
 * HTTPError({ cause: original }), so the ZodError is reachable via the cause
 * chain. Returns void for anything else so the chain falls through.
 */
export default defineErrorHandler((error, event) => {
  const zodError = findZodError(error);

  if (!zodError) {
    return;
  }

  return jsonError(event, 400, {
    error: true,
    status: 400,
    message: 'Validation failed',
    detail: zodError.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  });
});

function findZodError(error: unknown, depth = 0): ZodError | undefined {
  if (!error || typeof error !== 'object' || depth > 5) {
    return undefined;
  }
  if (error instanceof ZodError) {
    return error;
  }
  return findZodError((error as { cause?: unknown }).cause, depth + 1);
}
