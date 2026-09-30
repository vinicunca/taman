import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc as defaultAdminAc, defaultStatements, userAc as defaultUserAc } from 'better-auth/plugins/admin/access';
import { USER_ROLES } from './rbac.constants';
import { sharedStatements } from './rbac.shared';

const statement = {
  ...defaultStatements,
  ...sharedStatements,
} as const;

const adminAc = createAccessControl(statement);

const adminRole = adminAc.newRole({
  ...defaultAdminAc.statements,
  todo: ['create', 'read', 'update', 'delete'],
});

const userRole = adminAc.newRole({
  ...defaultUserAc.statements,
});

const adminRoles = {
  [USER_ROLES.ADMIN]: adminRole,
  [USER_ROLES.USER]: userRole,
} as const;

export {
  adminAc,
  adminRoles,
};
