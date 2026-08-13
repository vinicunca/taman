import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizationTable } from './auth.schema';
import { ticketCategoryTable } from './ticket-category.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const orderTable = pgTable(
  'order',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    ticketCategoryId: uuid('ticket_category_id')
      .notNull()
      .references(() => ticketCategoryTable.id, { onDelete: 'restrict' }),
    status: text('status')
      .notNull()
      .default('pending'),
    quantity: integer('quantity')
      .notNull()
      .default(1),
    totalPrice: integer('total_price')
      .notNull(),
    discount: integer('discount')
      .notNull()
      .default(0),
    finalPrice: integer('final_price')
      .notNull(),
    buyerName: text('buyer_name')
      .notNull(),
    buyerEmail: text('buyer_email')
      .notNull(),
    buyerPhone: text('buyer_phone')
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true })
      .notNull(),
    emailedAt: timestamp('emailed_at', { withTimezone: true }),
    ...generateTimestampColumns({ softDelete: false }),
  },
  (table) => [
    index('order_organizationId_idx').on(table.organizationId),
    index('order_ticketCategoryId_idx').on(table.ticketCategoryId),
    index('order_status_idx').on(table.status),
    check('order_quantity_positive', sql`${table.quantity} > 0`),
  ],
);
