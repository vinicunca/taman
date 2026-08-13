import { sql } from 'drizzle-orm';
import { integer, numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

export const venueTable = pgTable('venue', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  name: text('name')
    .notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 8 })
    .notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 })
    .notNull(),
  capacity: integer('capacity')
    .notNull(),
  address: text('address'),
  ...generateTimestampColumns({ softDelete: false }),
});
