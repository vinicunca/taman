import { organizationTable } from '@taman/db-pg';
import { eq } from 'drizzle-orm';
import { CoreRepo } from '#domains/core/core.repo.ts';

export class OrganizationRepo extends CoreRepo {
  /**
   * Resolves a public slug to an internal id. `organizationTable.slug` is
   * `notNull().unique()` with a unique index, so this is a single indexed
   * lookup.
   */
  async findIdBySlug(slug: string): Promise<string | null> {
    const rows = await this.db
      .select({ id: organizationTable.id })
      .from(organizationTable)
      .where(
        eq(organizationTable.slug, slug),
      )
      .limit(1);

    return rows[0]?.id ?? null;
  }
}
