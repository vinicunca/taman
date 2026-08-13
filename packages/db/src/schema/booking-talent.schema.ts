import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizationTable } from './auth.schema';
import { talentTable } from './talent.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const bookingTalentTable = pgTable(
  'booking_talent',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    talentId: uuid('talent_id')
      .notNull()
      .references(() => talentTable.id, { onDelete: 'cascade' }),
    role: text('role')
      .notNull(),
    clientName: text('client_name'),
    location: text('location'),
    performedAt: timestamp('performed_at', { withTimezone: true })
      .notNull(),
    note: text('note'),
    ...generateTimestampColumns({ softDelete: false }),
  },
  (table) => [
    index('bookingTalent_organizationId_idx').on(table.organizationId),
    index('bookingTalent_talentId_idx').on(table.talentId),
  ],
);
