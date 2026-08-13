import type { TalentPortfolioItem } from '../schemas/talent';
import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { organizationTable, userTable } from './auth.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const talentTable = pgTable('talent', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizationTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'set null' }),

  // Core Identity
  legalName: text('legal_name')
    .notNull(),
  stageName: text('stage_name')
    .notNull(),

  /**
   * Publication state for the public catalog. Defaults to `'draft'` so
   * creating a talent never publishes them.
   */
  status: text('status')
    .notNull()
    .default('draft'),

  // Press Kit (EPK) Fields
  bio: text('bio'),
  stageIntro: text('stage_intro'),
  techRider: text('tech_rider'),

  // Media
  headshotUrls: text('headshot_urls')
    .array()
    .default(sql`ARRAY[]::text[]`),

  // The mixed gallery of performance shots and video links
  portfolio: jsonb('portfolio')
    .$type<Array<TalentPortfolioItem>>()
    .default([]),

  ...generateTimestampColumns({ softDelete: false }),
});
