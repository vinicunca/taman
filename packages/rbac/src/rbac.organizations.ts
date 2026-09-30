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
 * here *replaces* its defaults rather than merging with them, so any role
 * missing here has no permissions at all. See `resolveMember`, which fails
 * closed on a `member.role` value that is not one of these.
 *
 * Spread order: defaults first, our statements last, so an explicit grant here
 * always wins a collision instead of being silently overwritten by upstream.
 */
const ownerRole = organizationAc.newRole({
  ...ownerAc.statements,
  todo: ['create', 'read', 'update', 'delete'],
});

const memberRole = organizationAc.newRole({
  ...memberAc.statements,
  // Todos are collaborative: every member may manage them.
  todo: ['create', 'read', 'update', 'delete'],
});

const organizationRoles = {
  [ORGANIZATION_ROLES.OWNER]: ownerRole,
  [ORGANIZATION_ROLES.MEMBER]: memberRole,
} as const;

export {
  organizationAc,
  organizationRoles,
};
