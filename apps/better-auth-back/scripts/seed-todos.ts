/**
 * Seeds ~100 todos into one organization so the pagination and realtime
 * examples have data.
 *
 * Usage (from repo root):
 *   nx run better-auth-back:seed:todos
 *   SEED_ORG_SLUG=acme nx run better-auth-back:seed:todos
 */
import { getDrizzleClient, memberTable, organizationTable, todoTable } from '@taman/db-pg';
import { asc, eq } from 'drizzle-orm';

const COUNT = 100;
const VERBS = ['Write', 'Review', 'Ship', 'Fix', 'Plan', 'Test', 'Refactor', 'Document'];
const NOUNS = ['login flow', 'invoice export', 'search filters', 'onboarding email', 'billing page', 'audit log'];

async function seedTodos() {
  const databaseUrl = process.env.NITRO_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Set NITRO_DATABASE_URL (or DATABASE_URL) before seeding. Use apps/better-auth-back/.env.');
  }

  const db = getDrizzleClient(databaseUrl);
  const slug = process.env.SEED_ORG_SLUG;

  const organizations = await db
    .select({ id: organizationTable.id, slug: organizationTable.slug })
    .from(organizationTable)
    .where(slug ? eq(organizationTable.slug, slug) : undefined)
    .orderBy(asc(organizationTable.createdAt))
    .limit(1);

  const organization = organizations[0];
  if (!organization) {
    throw new Error(slug ? `No organization with slug "${slug}".` : 'No organization exists yet. Create one first.');
  }

  const members = await db
    .select({ userId: memberTable.userId })
    .from(memberTable)
    .where(eq(memberTable.organizationId, organization.id))
    .limit(1);

  const now = Date.now();
  const rows = Array.from({ length: COUNT }, (_, index) => {
    // Distinct timestamps so "newest first" is meaningful across pages.
    const createdAt = new Date(now - (COUNT - index) * 60_000);
    return {
      organizationId: organization.id,
      title: `${VERBS[index % VERBS.length]} ${NOUNS[index % NOUNS.length]} #${index + 1}`,
      completed: index % 3 === 0,
      createdBy: members[0]?.userId ?? null,
      createdAt,
      updatedAt: createdAt,
    };
  });

  await db.insert(todoTable).values(rows);
  console.log(`Seeded ${COUNT} todos into organization "${organization.slug}".`);
  process.exit(0);
}

seedTodos().catch((error) => {
  console.error(error);
  process.exit(1);
});
