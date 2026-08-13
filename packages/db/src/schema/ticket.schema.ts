import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { organizationTable, userTable } from './auth.schema';
import { eventTable } from './event.schema';
import { orderTable } from './order.schema';
import { ticketCategoryTable } from './ticket-category.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const ticketTable = pgTable(
  'ticket',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    code: text('code').notNull().unique(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => eventTable.id, { onDelete: 'cascade' }),
    ticketCategoryId: uuid('ticket_category_id')
      .notNull()
      .references(() => ticketCategoryTable.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orderTable.id, { onDelete: 'cascade' }),
    attendeeName: text('attendee_name')
      .notNull(),
    checkedInBy: uuid('checked_in_by')
      .references(() => userTable.id, { onDelete: 'set null' }),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    ...generateTimestampColumns({ softDelete: false }),
  },
  (table) => [
    index('ticket_organizationId_idx').on(table.organizationId),
    index('ticket_eventId_idx').on(table.eventId),
    index('ticket_orderId_idx').on(table.orderId),
    uniqueIndex('ticket_code_uidx').on(table.code),
  ],
);
