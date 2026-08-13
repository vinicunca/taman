import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './auth.schema';
import { eventTable } from './event.schema';
import { talentTable } from './talent.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const eventCreditTable = pgTable(
  'event_credit',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    eventId: uuid('event_id')
      .notNull()
      .references(() => eventTable.id, { onDelete: 'cascade' }),
    talentId: uuid('talent_id')
      .references(() => talentTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .references(() => userTable.id, { onDelete: 'cascade' }),
    guestName: text('guest_name'),
    role: text('role')
      .notNull(),
    note: text('note'),
    ...generateTimestampColumns({ softDelete: false }),
  },
  (table) => [
    check(
      'event_credit_subject_check',
      sql`num_nonnulls(${table.talentId}, ${table.userId}, ${table.guestName}) = 1`,
    ),
    uniqueIndex('event_credit_talent_uidx')
      .on(table.eventId, table.talentId, table.role)
      .where(sql`${table.talentId} IS NOT NULL`),
    uniqueIndex('event_credit_user_uidx')
      .on(table.eventId, table.userId, table.role)
      .where(sql`${table.userId} IS NOT NULL`),
    index('event_credit_eventId_idx').on(table.eventId),
    index('event_credit_talentId_idx').on(table.talentId),
    index('event_credit_userId_idx').on(table.userId),
  ],
);
