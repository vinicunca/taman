/**
 * Seeds a single email/password admin user for local / e2e testing, plus a
 * demo organization the admin owns. Services scope every query to the
 * caller's organization, so the admin role alone cannot use the todo pages.
 *
 * Usage (from repo root):
 *   nx run api:seed
 */
import type { DrizzleClient } from '@taman/db-pg';
import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';
import { accountTable, getDrizzleClient, memberTable, organizationTable, userTable } from '@taman/db-pg';
import { ORGANIZATION_ROLES, USER_ROLES } from '@taman/rbac';

const DEFAULT_EMAIL = 'admin@taman.local';
const DEFAULT_PASSWORD = 'Admin123!';
const DEFAULT_NAME = 'Admin';
const DEFAULT_ORG_NAME = 'Demo';
const DEFAULT_ORG_SLUG = 'demo';

async function seedAdmin() {
  const databaseUrl = process.env.NITRO_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'Set NITRO_DATABASE_URL (or DATABASE_URL) before seeding. Use apps/api/.env.',
    );
  }

  const db = getDrizzleClient(databaseUrl);
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  const existing = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, DEFAULT_EMAIL))
    .limit(1);

  const existingUser = existing[0];
  let userId: string;

  if (existingUser) {
    userId = existingUser.id;

    await db
      .update(userTable)
      .set({
        name: DEFAULT_NAME,
        role: USER_ROLES.ADMIN,
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(userTable.id, existingUser.id));

    const accounts = await db
      .select({ id: accountTable.id })
      .from(accountTable)
      .where(
        and(
          eq(accountTable.userId, existingUser.id),
          eq(accountTable.providerId, 'credential'),
        ),
      )
      .limit(1);

    const credentialAccount = accounts[0];
    if (credentialAccount) {
      await db
        .update(accountTable)
        .set({ password: hashedPassword })
        .where(eq(accountTable.id, credentialAccount.id));
    } else {
      await db.insert(accountTable).values({
        userId: existingUser.id,
        accountId: existingUser.id,
        providerId: 'credential',
        password: hashedPassword,
      });
    }

    console.log(`Updated existing admin user: ${DEFAULT_EMAIL}`);
  } else {
    const [createdUser] = await db
      .insert(userTable)
      .values({
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        emailVerified: true,
        role: USER_ROLES.ADMIN,
        banned: false,
      })
      .returning({ id: userTable.id });

    if (!createdUser) {
      throw new Error('Failed to insert admin user.');
    }

    userId = createdUser.id;

    await db.insert(accountTable).values({
      userId: createdUser.id,
      accountId: createdUser.id,
      providerId: 'credential',
      password: hashedPassword,
    });

    console.log(`Created admin user: ${DEFAULT_EMAIL}`);
  }

  await ensureOwnerMembership(db, userId);

  console.log('');
  console.log('Login credentials (email verified, role=admin):');
  console.log(`  email:    ${DEFAULT_EMAIL}`);
  console.log(`  password: ${DEFAULT_PASSWORD}`);
  console.log(`  org:      ${DEFAULT_ORG_SLUG} (owner)`);
  console.log('');
  console.log('Sign out and back in if you were already logged in: the active');
  console.log('organization is only set when a session starts.');
  console.log('');
  console.log('For e2e:');
  console.log(`  export E2E_EMAIL='${DEFAULT_EMAIL}'`);
  console.log(`  export E2E_PASSWORD='${DEFAULT_PASSWORD}'`);
}

async function ensureOwnerMembership(db: DrizzleClient, userId: string) {
  const organizations = await db
    .select({ id: organizationTable.id })
    .from(organizationTable)
    .where(eq(organizationTable.slug, DEFAULT_ORG_SLUG))
    .limit(1);

  let organizationId = organizations[0]?.id;

  if (!organizationId) {
    const [createdOrganization] = await db
      .insert(organizationTable)
      .values({ name: DEFAULT_ORG_NAME, slug: DEFAULT_ORG_SLUG })
      .returning({ id: organizationTable.id });

    if (!createdOrganization) {
      throw new Error('Failed to insert demo organization.');
    }

    organizationId = createdOrganization.id;
    console.log(`Created organization: ${DEFAULT_ORG_SLUG}`);
  }

  const memberships = await db
    .select({ id: memberTable.id })
    .from(memberTable)
    .where(
      and(
        eq(memberTable.organizationId, organizationId),
        eq(memberTable.userId, userId),
      ),
    )
    .limit(1);

  const membership = memberships[0];

  if (membership) {
    await db
      .update(memberTable)
      .set({ role: ORGANIZATION_ROLES.OWNER })
      .where(eq(memberTable.id, membership.id));
  } else {
    await db.insert(memberTable).values({
      organizationId,
      userId,
      role: ORGANIZATION_ROLES.OWNER,
    });
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
