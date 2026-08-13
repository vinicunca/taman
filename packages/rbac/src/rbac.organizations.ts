import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, memberAc, ownerAc } from 'better-auth/plugins/organization/access';
import { ORGANIZATION_ROLES } from './rbac.constants';
import { sharedStatements } from './rbac.shared';

const statement = {
  ...defaultStatements,
  ...sharedStatements,
} as const;

const organizationAc = createAccessControl(statement);

/**
 * Deliberately only `owner` and `member` — better-auth's default `admin`
 * organization role is dropped. Passing `roles` to the organization plugin
 * *replaces* its defaults rather than merging with them, so any role missing
 * here has no permissions at all. See `resolveMember`, which fails closed on
 * a `member.role` value that is not one of these.
 *
 * Spread order: defaults first, our statements last, so an explicit grant here
 * always wins a collision instead of being silently overwritten by upstream.
 */
const ownerRole = organizationAc.newRole({
  ...ownerAc.statements,
  talent: ['create', 'update', 'delete', 'manage'],
  eventCredit: ['create', 'delete', 'read'],
  bookingTalent: ['create', 'update', 'delete', 'read'],
});

const memberRole = organizationAc.newRole({
  ...memberAc.statements,
  // No `manage`: a member may only edit the talent linked to their own user.
  talent: ['update'],
  // Crediting/booking is an org-management action, not a self-serve one.
  eventCredit: [],
  bookingTalent: [],
});

const organizationRoles = {
  [ORGANIZATION_ROLES.OWNER]: ownerRole,
  [ORGANIZATION_ROLES.MEMBER]: memberRole,
} as const;

export {
  organizationAc,
  organizationRoles,
};
