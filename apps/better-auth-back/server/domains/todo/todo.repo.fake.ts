import type { TodoInsert, TodoListQuery, TodoPatch, TodoRepoPort, TodoRow } from './todo.repo.ts';

/**
 * In-memory stand-in for `TodoRepo`, shared by tests. State is static so a
 * module-level `vi.mock` of `TodoRepo` sees the same rows; call `reset()` in
 * `beforeEach`.
 */
export class FakeTodoRepo implements TodoRepoPort {
  static rows: Array<TodoRow> = [];
  static sequence = 0;
  lastListQuery: TodoListQuery | undefined;

  constructor(_db?: unknown) {}

  static reset() {
    FakeTodoRepo.rows = [];
    FakeTodoRepo.sequence = 0;
  }

  async list(query: TodoListQuery) {
    this.lastListQuery = query;
    const matching = FakeTodoRepo.rows
      .filter((row) => row.organizationId === query.organizationId)
      .filter((row) => !query.search || row.title.toLowerCase().includes(query.search.toLowerCase()))
      .filter((row) => query.completed === undefined || row.completed === query.completed)
      .toReversed();

    return {
      rows: matching.slice(query.offset, query.offset + query.limit),
      total: matching.length,
    };
  }

  async findById(organizationId: string, id: string) {
    return FakeTodoRepo.rows.find((row) => row.organizationId === organizationId && row.id === id) ?? null;
  }

  async insert(values: TodoInsert) {
    FakeTodoRepo.sequence += 1;
    const now = new Date(Date.UTC(2026, 0, 1, 0, 0, FakeTodoRepo.sequence));
    const row: TodoRow = {
      id: `01920000-0000-7000-8000-${String(FakeTodoRepo.sequence).padStart(12, '0')}`,
      ...values,
      createdAt: now,
      updatedAt: now,
    };
    FakeTodoRepo.rows.push(row);
    return row;
  }

  async update(organizationId: string, id: string, patch: TodoPatch) {
    const row = await this.findById(organizationId, id);
    if (!row) {
      return null;
    }
    Object.assign(row, patch, { updatedAt: new Date() });
    return row;
  }

  async remove(organizationId: string, id: string) {
    const before = FakeTodoRepo.rows.length;
    FakeTodoRepo.rows = FakeTodoRepo.rows.filter((row) => !(row.organizationId === organizationId && row.id === id));
    return FakeTodoRepo.rows.length < before;
  }
}
