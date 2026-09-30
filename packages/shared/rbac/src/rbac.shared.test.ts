import { describe, expect, it } from 'vitest';
import { adminRoles } from './rbac.admin';
import { ORGANIZATION_ROLES, USER_ROLES } from './rbac.constants';
import { organizationRoles } from './rbac.organizations';
import { sharedStatements } from './rbac.shared';

describe('shared statements', () => {
  it('declares only the template reference resource', () => {
    expect(Object.keys(sharedStatements)).toEqual(['todo']);
  });

  it('grants roles nothing beyond better-auth defaults and todo', () => {
    const roles = [
      adminRoles[USER_ROLES.ADMIN],
      organizationRoles[ORGANIZATION_ROLES.OWNER],
      organizationRoles[ORGANIZATION_ROLES.MEMBER],
    ];

    for (const role of roles) {
      expect(Object.keys(role.statements)).not.toContain('talent');
      expect(Object.keys(role.statements)).not.toContain('eventCredit');
      expect(Object.keys(role.statements)).not.toContain('bookingTalent');
    }
  });
});
