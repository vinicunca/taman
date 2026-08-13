import type { NgiburEnv } from '@taman/constants';
import type { DrizzleClient } from '@taman/db-pg';
import type { OrganizationRoleNames } from '@taman/rbac';
import type { H3Event } from 'nitro';
import type { DirectorAuthPayload } from '#auth/better-auth.instance.ts';
import { getDrizzleClient, memberTable } from '@taman/db-pg';
import { ORGANIZATION_ROLES } from '@taman/rbac';
import { and, eq } from 'drizzle-orm';
import { getAuthAccess } from '#auth/auth.access.ts';

export interface DirectorMember {
  role: OrganizationRoleNames;
  organizationId: string;
}

const KNOWN_ORGANIZATION_ROLES = new Set<string>(Object.values(ORGANIZATION_ROLES));

/**
 * Narrows the raw `member.role` string to a role the access control actually
 * defines. This is the only place a database value becomes a typed role, which
 * is what lets `CoreService.can` index `organizationRoles` without a fallback.
 *
 * Unknown values fail closed rather than throwing — notably the legacy `admin`
 * organization role, which was dropped from the access control. A stale row
 * therefore loses permissions loudly in the log instead of crashing the request
 * on an undefined role lookup.
 */
export function toOrganizationRole(role: string | null | undefined): OrganizationRoleNames | null {
  if (!role || !KNOWN_ORGANIZATION_ROLES.has(role)) {
    if (role) {
      console.warn(`[context] ignoring unknown organization role "${role}"`);
    }
    return null;
  }

  return role as OrganizationRoleNames;
}

export interface TamanContext {
  db: DrizzleClient;
  auth: DirectorAuthPayload;
  /**
   * The caller's membership in their active organization. `null` when the
   * session has no active org — which `middleware/2.context.ts` only permits
   * for platform admins — or when no matching `member` row exists. Consumers
   * must fail closed on `null`.
   */
  member: DirectorMember | null;
}

async function resolveMember(
  db: DrizzleClient,
  session: DirectorAuthPayload['session'],
): Promise<DirectorMember | null> {
  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return null;
  }

  const rows = await db
    .select({ role: memberTable.role })
    .from(memberTable)
    .where(
      and(
        eq(memberTable.userId, session.userId),
        eq(memberTable.organizationId, organizationId),
      ),
    )
    .limit(1);

  const role = toOrganizationRole(rows[0]?.role);

  if (!role) {
    return null;
  }

  return { role, organizationId };
}

export async function resolveContext(event: H3Event): Promise<TamanContext> {
  /**
   * First, we need to check if the user have access
   * and returns the auth object.
   */
  const auth = await getAuthAccess(event);

  /**
   * Second, we need to get the database client.
   */
  const db = getDrizzleClient();

  /**
   * Third, resolve the caller's role in their active organization. The session
   * carries `activeOrganizationId` but not the role.
   */
  const member = await resolveMember(db, auth.session);

  return {
    db,
    auth,
    member,
  };
}
