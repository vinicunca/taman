import type {
  Todo,
  TodoCreateInput,
  TodoEvent,
  TodoListInput,
  TodoPage,
  TodoUpdateInput,
} from '@vinicunca/taman-api-contract';
import type { TamanContext } from '#lib/context.ts';
import type { TodoPublisher } from '#realtime/publisher.ts';
import type { TodoRepoPort, TodoRow } from './todo.repo.ts';
import { ORPCError } from '@orpc/server';
import { ORG_REQUIRED, toOffset, toTotalPages } from '@vinicunca/taman-api-contract';
import { CoreService } from '#domains/core/core.service.ts';
import { todoChannel } from '#realtime/publisher.ts';
import { TodoRepo } from './todo.repo.ts';

type TodoAction = 'create' | 'read' | 'update' | 'delete';

export interface TodoServiceDeps {
  publisher: TodoPublisher;
  repo?: TodoRepoPort;
}

export function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Transport-agnostic: a missing row is `null`, never a thrown NOT_FOUND — the
 * procedure owns turning that into the contract's typed error.
 */
export class TodoService extends CoreService {
  private readonly repo: TodoRepoPort;
  private readonly publisher: TodoPublisher;

  constructor(ctx: TamanContext, deps: TodoServiceDeps) {
    super(ctx);
    this.repo = deps.repo ?? new TodoRepo(ctx.db);
    this.publisher = deps.publisher;
  }

  async list(input: TodoListInput): Promise<TodoPage> {
    const organizationId = this.authorize('read');
    const { rows, total } = await this.repo.list({
      organizationId,
      limit: input.pageSize,
      offset: toOffset(input),
      search: input.search || undefined,
      completed: input.completed,
    });

    return {
      items: rows.map(toTodo),
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: toTotalPages(total, input.pageSize),
    };
  }

  async get(id: string): Promise<Todo | null> {
    const row = await this.repo.findById(this.authorize('read'), id);
    return row ? toTodo(row) : null;
  }

  async create(input: TodoCreateInput): Promise<Todo> {
    const organizationId = this.authorize('create');
    const todo = toTodo(await this.repo.insert({
      organizationId,
      title: input.title,
      completed: input.completed ?? false,
      createdBy: this.auth.user.id,
    }));

    await this.publish(organizationId, { type: 'created', todo });
    return todo;
  }

  async update({ id, ...patch }: TodoUpdateInput): Promise<Todo | null> {
    const organizationId = this.authorize('update');
    const row = await this.repo.update(organizationId, id, patch);

    if (!row) {
      return null;
    }

    const todo = toTodo(row);
    await this.publish(organizationId, { type: 'updated', todo });
    return todo;
  }

  async remove(id: string): Promise<{ id: string } | null> {
    const organizationId = this.authorize('delete');

    if (!(await this.repo.remove(organizationId, id))) {
      return null;
    }

    await this.publish(organizationId, { type: 'removed', id });
    return { id };
  }

  subscribe(options: { signal?: AbortSignal; lastEventId?: string }) {
    return this.publisher.subscribe(todoChannel(this.authorize('read')), options);
  }

  /** Checks the role, then returns the org every query must be scoped to. */
  private authorize(action: TodoAction): string {
    if (!this.member) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Organization required',
        data: { code: ORG_REQUIRED },
      });
    }

    if (!this.can({ todo: [action] })) {
      throw new ORPCError('FORBIDDEN', { message: `You may not ${action} todos.` });
    }

    return this.member.organizationId;
  }

  /**
   * The write is already committed; a failed fan-out must not turn it into an
   * error, or the client retries and creates a duplicate.
   */
  private async publish(organizationId: string, event: TodoEvent) {
    try {
      await this.publisher.publish(todoChannel(organizationId), event);
    } catch (error) {
      console.error('[todo] realtime publish failed', error);
    }
  }
}
