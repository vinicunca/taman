/**
 * Resource statements shared by the platform-admin and organization access
 * controls, declared once so the two role sets cannot drift apart.
 *
 * `as const` matters: better-auth infers the allowed action names from these
 * literal tuples, so widening them to `string[]` silently turns every
 * `authorize({ todo: [...] })` call into an unchecked one.
 *
 * Role statements answer "may this role do X" and cannot express "the row
 * belongs to you". Ownership rules stay explicit checks in the calling
 * service; only the role half lives here.
 */
export const sharedStatements = {
  todo: ['create', 'read', 'update', 'delete'],
} as const;

/** Every resource/action pair a caller can be asked about. */
export type PermissionRequest = {
  [Resource in keyof typeof sharedStatements]?: Array<
    (typeof sharedStatements)[Resource][number]
  >;
};
