import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { eventTable } from './event.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const ticketCategoryTable = pgTable(
  'ticket_category',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    eventId: uuid('event_id')
      .notNull()
      .references(() => eventTable.id, { onDelete: 'cascade' }),
    name: text('name')
      .notNull(),
    price: integer('price')
      .notNull(),
    salesStartAt: timestamp('sales_start_at', { withTimezone: true })
      .notNull(),
    salesEndAt: timestamp('sales_end_at', { withTimezone: true })
      .notNull(),
    totalTickets: integer('total_tickets')
      .notNull()
      .default(0),
    soldTickets: integer('sold_tickets')
      .notNull()
      .default(0),
    ...generateTimestampColumns({ softDelete: false }),
  },
  (table) => [
    index('ticketCategory_eventId_idx').on(table.eventId),
    check('ticketCategory_sold_within_total', sql`${table.soldTickets} >= 0 AND ${table.soldTickets} <= ${table.totalTickets}`),
  ],
);
