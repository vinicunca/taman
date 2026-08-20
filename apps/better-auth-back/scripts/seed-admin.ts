/**
 * Seeds a single email/password admin user for local / e2e testing.
 *
 * Usage (from repo root):
 *   nx run better-auth-back:seed
 */
import { accountTable, getDrizzleClient, userTable } from '@taman/db-pg';
import { USER_ROLES } from '@taman/rbac';
import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';

const DEFAULT_EMAIL = 'admin@taman.local';
// eslint-disable-next-line sonar/no-hardcoded-passwords
const DEFAULT_PASSWORD = 'Admin123!';
const DEFAULT_NAME = 'Admin';

async function seedAdmin() {
  const databaseUrl = process.env.NITRO_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'Set NITRO_DATABASE_URL (or DATABASE_URL) before seeding. Use apps/better-auth-back/.env.',
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

  if (existingUser) {
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

    await db.insert(accountTable).values({
      userId: createdUser.id,
      accountId: createdUser.id,
      providerId: 'credential',
      password: hashedPassword,
    });

    console.log(`Created admin user: ${DEFAULT_EMAIL}`);
  }

  console.log('');
  console.log('Login credentials (email verified, role=admin):');
  console.log(`  email:    ${DEFAULT_EMAIL}`);
  console.log(`  password: ${DEFAULT_PASSWORD}`);
  console.log('');
  console.log('For e2e:');
  console.log(`  export E2E_EMAIL='${DEFAULT_EMAIL}'`);
  console.log(`  export E2E_PASSWORD='${DEFAULT_PASSWORD}'`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
