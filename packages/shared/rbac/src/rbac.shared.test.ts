import type { PermissionRequest } from './rbac.shared';
import { describe, expect, it } from 'vitest';
import { adminRoles } from './rbac.admin';
import { ORGANIZATION_ROLES, USER_ROLES } from './rbac.constants';
import { organizationRoles } from './rbac.organizations';
import { sharedStatements } from './rbac.shared';

/** Every action of every shared resource, so a newly added resource is covered automatically. */
function everySharedAction(): PermissionRequest {
  return Object.fromEntries(
    Object.entries(sharedStatements).map(([resource, actions]) => [resource, [...actions]]),
  ) as PermissionRequest;
}

describe('shared statements', () => {
  it('lets platform admins and organization owners perform every shared action', () => {
    expect(adminRoles[USER_ROLES.ADMIN].authorize(everySharedAction()).success).toBe(true);
    expect(organizationRoles[ORGANIZATION_ROLES.OWNER].authorize(everySharedAction()).success).toBe(true);
  });

  it('gives plain platform users none of the shared actions', () => {
    for (const [resource, actions] of Object.entries(sharedStatements)) {
      for (const action of actions) {
        expect(adminRoles[USER_ROLES.USER].authorize({ [resource]: [action] } as PermissionRequest).success).toBe(false);
      }
    }
  });
});
