import { defaultStatements as adminDefaults } from 'better-auth/plugins/admin/access';
import { defaultStatements as organizationDefaults } from 'better-auth/plugins/organization/access';
import { describe, expect, it } from 'vitest';
import { adminRoles } from './rbac.admin';
import { ORGANIZATION_ROLES, USER_ROLES } from './rbac.constants';
import { organizationRoles } from './rbac.organizations';
import { sharedStatements } from './rbac.shared';

describe('shared statements', () => {
  it('declares only the template reference resource', () => {
    expect(Object.keys(sharedStatements)).toEqual(['todo']);
  });

  it('grants roles only better-auth defaults plus todo', () => {
    const cases = [
      [adminRoles[USER_ROLES.ADMIN], adminDefaults],
      [organizationRoles[ORGANIZATION_ROLES.OWNER], organizationDefaults],
      [organizationRoles[ORGANIZATION_ROLES.MEMBER], organizationDefaults],
    ] as const;

    for (const [role, defaults] of cases) {
      expect(Object.keys(role.statements).filter((key) => !(key in defaults))).toEqual(['todo']);
    }
  });
});
