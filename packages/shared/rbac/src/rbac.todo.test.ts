import { describe, expect, it } from 'vitest';
import { adminRoles } from './rbac.admin';
import { ORGANIZATION_ROLES, USER_ROLES } from './rbac.constants';
import { organizationRoles } from './rbac.organizations';

const ALL = { todo: ['create', 'read', 'update', 'delete'] } as const;

describe('todo permissions', () => {
  it('grants every todo action to org owners and members', () => {
    expect(organizationRoles[ORGANIZATION_ROLES.OWNER].authorize({ todo: [...ALL.todo] }).success).toBe(true);
    expect(organizationRoles[ORGANIZATION_ROLES.MEMBER].authorize({ todo: [...ALL.todo] }).success).toBe(true);
  });

  it('grants every todo action to platform admins but not plain users', () => {
    expect(adminRoles[USER_ROLES.ADMIN].authorize({ todo: [...ALL.todo] }).success).toBe(true);
    expect(adminRoles[USER_ROLES.USER].authorize({ todo: ['read'] }).success).toBe(false);
  });
});
