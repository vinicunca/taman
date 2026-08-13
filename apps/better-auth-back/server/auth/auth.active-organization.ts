import type { DrizzleClient } from '@taman/db-pg';
import type { DirectorAuthPayload } from '#auth/better-auth.instance.ts';
import { memberTable, sessionTable } from '@taman/db-pg';
import { eq } from 'drizzle-orm';

export async function resolveActiveOrganizationId(
  db: DrizzleClient,
  session: DirectorAuthPayload['session'],
) {
  const memberships = await db
    .select({ organizationId: memberTable.organizationId })
    .from(memberTable)
    .where(
      eq(memberTable.userId, session.userId),
    );

  const organizationId = memberships[0]?.organizationId;

  if (!organizationId) {
    return;
  }

  await db
    .update(sessionTable)
    .set({ activeOrganizationId: organizationId })
    .where(
      eq(sessionTable.token, session.token),
    );
}
