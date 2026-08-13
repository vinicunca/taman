/**
 * Resource statements shared by the platform-admin and organization access
 * controls, declared once so the two role sets cannot drift apart.
 *
 * `as const` matters: better-auth infers the allowed action names from these
 * literal tuples, so widening them to `string[]` silently turns every
 * `authorize({ talent: [...] })` call into an unchecked one.
 *
 * On `manage` — role statements answer "may this role do X", and cannot
 * express "the row belongs to you". So `update` means *edit a talent you are
 * linked to*, while `manage` means *act on any talent in scope*, and is also
 * what permits reassigning a talent's owner. The ownership half of that rule
 * stays an explicit check in `TalentService`; only the role half lives here.
 */
export const sharedStatements = {
  talent: ['create', 'update', 'delete', 'manage'],
  eventCredit: ['create', 'delete', 'read'],
  bookingTalent: ['create', 'update', 'delete', 'read'],
} as const;

/** Every resource/action pair a caller can be asked about. */
export type PermissionRequest = {
  [Resource in keyof typeof sharedStatements]?: Array<
    (typeof sharedStatements)[Resource][number]
  >;
};
