import { eventIterator, oc } from '@orpc/contract';
import {
  todoCreateInput,
  todoEventSchema,
  todoIdInput,
  todoListInput,
  todoPageSchema,
  todoSchema,
  todoUpdateInput,
} from './todo.schema';

const withNotFound = oc.errors({
  NOT_FOUND: { message: 'Todo not found.' },
});

export const todoContract = {
  list: oc.input(todoListInput).output(todoPageSchema),
  get: withNotFound.input(todoIdInput).output(todoSchema),
  create: oc.input(todoCreateInput).output(todoSchema),
  update: withNotFound.input(todoUpdateInput).output(todoSchema),
  remove: withNotFound.input(todoIdInput).output(todoIdInput),
  /** Streams changes in the caller's active organization. */
  live: oc.output(eventIterator(todoEventSchema)),
};
