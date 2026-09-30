import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { organizationTable, userTable } from './auth.schema';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

/**
 * Example resource for the oRPC CRUD / pagination / realtime demos.
 * Rows are always read and written within one organization.
 */
const todoTable = pgTable(
  'todo',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: boolean('completed').default(false).notNull(),
    createdBy: uuid('created_by')
      .references(() => userTable.id, { onDelete: 'set null' }),
    ...generateTimestampColumns(),
  },
  (table) => [
    index('todo_organizationId_createdAt_idx').on(table.organizationId, table.createdAt),
  ],
);

export { todoTable };
