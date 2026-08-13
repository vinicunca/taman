import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizationTable } from './auth.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';
import { venueTable } from './venue.schema';

export const eventTable = pgTable(
  'event',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    venueId: uuid('venue_id')
      .notNull()
      .references(() => venueTable.id, { onDelete: 'restrict' }),
    name: text('name')
      .notNull(),
    description: text('description'),
    status: text('status')
      .notNull()
      .default('draft'),
    type: text('type')
      .notNull()
      .default('showcase'),
    productionRole: text('production_role')
      .notNull()
      .default('own'),
    externalHost: text('external_host'),
    startAt: timestamp('start_at', { withTimezone: true })
      .notNull(),
    endAt: timestamp('end_at', { withTimezone: true })
      .notNull(),
    posterUrl: text('poster_url'),
    ...generateTimestampColumns({ softDelete: false }),
  },
  (table) => [
    index('event_organizationId_idx').on(table.organizationId),
    index('event_venueId_idx').on(table.venueId),
    index('event_status_idx').on(table.status),
    index('event_type_idx').on(table.type),
    index('event_productionRole_idx').on(table.productionRole),
  ],
);
