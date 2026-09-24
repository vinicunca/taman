import { z } from 'zod';
import { paginated, paginationInput } from '../shared/pagination';

export const TODO_TITLE_MAX = 200;

const title = z.string().trim().min(1, 'Title is required.').max(TODO_TITLE_MAX);

/** `organizationId` is deliberately absent: scope is implicit from the session. */
export const todoSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  completed: z.boolean(),
  createdBy: z.uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Todo = z.infer<typeof todoSchema>;

export const todoIdInput = z.object({ id: z.uuid() });

export const todoCreateInput = z.object({
  title,
  completed: z.boolean().optional(),
});
export type TodoCreateInput = z.infer<typeof todoCreateInput>;

export const todoUpdateInput = z
  .object({
    id: z.uuid(),
    title: title.optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (value) => value.title !== undefined || value.completed !== undefined,
    { message: 'Provide a title or completed value to update.' },
  );
export type TodoUpdateInput = z.infer<typeof todoUpdateInput>;

export const todoListInput = paginationInput.extend({
  search: z.string().trim().max(TODO_TITLE_MAX).optional(),
  completed: z.boolean().optional(),
});
export type TodoListInput = z.infer<typeof todoListInput>;

export const todoPageSchema = paginated(todoSchema);
export type TodoPage = z.infer<typeof todoPageSchema>;

export const todoEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('created'), todo: todoSchema }),
  z.object({ type: z.literal('updated'), todo: todoSchema }),
  z.object({ type: z.literal('removed'), id: z.uuid() }),
]);
export type TodoEvent = z.infer<typeof todoEventSchema>;
