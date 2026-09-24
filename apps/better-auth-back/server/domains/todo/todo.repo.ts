import { todoTable } from '@taman/db-pg';
import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { CoreRepo } from '#domains/core/core.repo.ts';

export type TodoRow = typeof todoTable.$inferSelect;

export interface TodoListQuery {
  organizationId: string;
  limit: number;
  offset: number;
  search?: string;
  completed?: boolean;
}

export interface TodoInsert {
  organizationId: string;
  title: string;
  completed: boolean;
  createdBy: string;
}

export interface TodoPatch {
  title?: string;
  completed?: boolean;
}

export interface TodoRepoPort {
  list: (query: TodoListQuery) => Promise<{ rows: Array<TodoRow>; total: number }>;
  findById: (organizationId: string, id: string) => Promise<TodoRow | null>;
  insert: (values: TodoInsert) => Promise<TodoRow>;
  update: (organizationId: string, id: string, patch: TodoPatch) => Promise<TodoRow | null>;
  remove: (organizationId: string, id: string) => Promise<boolean>;
}

/**
 * Postgres treats `%`, `_` and `\` specially in LIKE patterns. Escaping them
 * makes a user's search literal ("100%" finds "100%", not "100 anything").
 */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export class TodoRepo extends CoreRepo implements TodoRepoPort {
  async list({ organizationId, limit, offset, search, completed }: TodoListQuery) {
    const where = and(
      eq(todoTable.organizationId, organizationId),
      search ? ilike(todoTable.title, `%${escapeLike(search)}%`) : undefined,
      completed === undefined ? undefined : eq(todoTable.completed, completed),
    );

    const [rows, totals] = await Promise.all([
      this.db
        .select()
        .from(todoTable)
        .where(where)
        // `id` breaks ties: bulk inserts share one `createdAt`, and without a
        // unique tiebreaker rows can repeat or vanish between pages.
        .orderBy(desc(todoTable.createdAt), desc(todoTable.id))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(todoTable)
        .where(where),
    ]);

    return { rows, total: totals[0]?.total ?? 0 };
  }

  async findById(organizationId: string, id: string) {
    const rows = await this.db
      .select()
      .from(todoTable)
      .where(and(eq(todoTable.organizationId, organizationId), eq(todoTable.id, id)))
      .limit(1);

    return rows[0] ?? null;
  }

  async insert(values: TodoInsert) {
    const rows = await this.db.insert(todoTable).values(values).returning();
    const row = rows[0];

    if (!row) {
      throw new Error('Insert into todo returned no row');
    }

    return row;
  }

  async update(organizationId: string, id: string, patch: TodoPatch) {
    const rows = await this.db
      .update(todoTable)
      .set(patch)
      .where(and(eq(todoTable.organizationId, organizationId), eq(todoTable.id, id)))
      .returning();

    return rows[0] ?? null;
  }

  async remove(organizationId: string, id: string) {
    const rows = await this.db
      .delete(todoTable)
      .where(and(eq(todoTable.organizationId, organizationId), eq(todoTable.id, id)))
      .returning({ id: todoTable.id });

    return rows.length > 0;
  }
}
