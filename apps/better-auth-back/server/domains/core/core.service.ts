import type { DrizzleClient } from '@taman/db-pg';
import type { PermissionRequest } from '@taman/rbac';
import type { DirectorMember, TamanContext } from '#lib/context';
import { adminRoles, organizationRoles, USER_ROLES } from '@taman/rbac';

export class CoreService {
  protected readonly auth: TamanContext['auth'];
  protected readonly db: DrizzleClient;
  protected readonly member: DirectorMember | null;

  constructor(ctx: TamanContext) {
    this.auth = ctx.auth;
    this.db = ctx.db;
    this.member = ctx.member ?? null;
  }

  /** Platform-wide admin from better-auth's admin plugin — not an org role. */
  protected get isPlatformAdmin(): boolean {
    return this.auth.user.role === USER_ROLES.ADMIN;
  }

  /**
   * Whether the caller's roles grant every requested action.
   *
   * Synchronous and pure — `authorize` is a lookup against statements already
   * held in memory, so this costs nothing per call and needs no database round
   * trip, which matters on a Worker.
   *
   * The two role axes are independent, so this is a union: a platform admin is
   * authorized by their platform role whether or not they have a membership,
   * and everyone else falls through to their organization role. A `null`
   * member — revoked, or a role the access control does not define — denies by
   * omission.
   *
   * Answers "may this role do X" and nothing else. Row-level questions (is
   * this talent linked to me, is it inside my organization) cannot be
   * expressed as role statements; they stay in the calling service and in the
   * repo's scope filter.
   */
  protected can(permission: PermissionRequest): boolean {
    const resultAdmin = adminRoles[USER_ROLES.ADMIN]
      .authorize(permission);

    if (this.isPlatformAdmin && resultAdmin.success) {
      return true;
    }

    if (!this.member) {
      return false;
    }

    const resultOrganization = organizationRoles[this.member.role]
      .authorize(permission);

    return resultOrganization.success;
  }
}
