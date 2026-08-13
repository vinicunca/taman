import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { orderTable } from './order.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const transactionTable = pgTable(
  'transaction',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orderTable.id, { onDelete: 'cascade' }),
    provider: text('provider')
      .notNull(),
    providerRef: text('provider_ref'),
    amount: integer('amount')
      .notNull(),
    status: text('status')
      .notNull(),
    rawPayload: jsonb('raw_payload'),
    ...generateTimestampColumns({ softDelete: false }),
  },
  (table) => [
    index('transaction_orderId_idx').on(table.orderId),
    index('transaction_status_idx').on(table.status),
    uniqueIndex('transaction_providerRef_status_uidx')
      .on(table.providerRef, table.status)
      .where(sql`${table.providerRef} IS NOT NULL`),
  ],
);
