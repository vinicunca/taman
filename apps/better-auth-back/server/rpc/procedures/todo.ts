import type { TamanContext } from '#lib/context.ts';
import { TodoService } from '#domains/todo/todo.service.ts';
import { getTodoPublisher } from '#realtime/publisher.ts';
import { authed, os } from '#rpc/base.ts';

async function todoService(taman: TamanContext) {
  return new TodoService(taman, { publisher: await getTodoPublisher() });
}

const todo = os.todo.use(authed);

export const todoRouter = {
  list: todo.list.handler(async ({ context, input }) =>
    (await todoService(context.taman)).list(input)),

  get: todo.get.handler(async ({ context, input, errors }) => {
    const found = await (await todoService(context.taman)).get(input.id);
    if (!found) {
      throw errors.NOT_FOUND();
    }
    return found;
  }),

  create: todo.create.handler(async ({ context, input }) =>
    (await todoService(context.taman)).create(input)),

  update: todo.update.handler(async ({ context, input, errors }) => {
    const updated = await (await todoService(context.taman)).update(input);
    if (!updated) {
      throw errors.NOT_FOUND();
    }
    return updated;
  }),

  remove: todo.remove.handler(async ({ context, input, errors }) => {
    const removed = await (await todoService(context.taman)).remove(input.id);
    if (!removed) {
      throw errors.NOT_FOUND();
    }
    return removed;
  }),

  live: todo.live.handler(async function* ({ context, signal, lastEventId }) {
    const service = await todoService(context.taman);
    yield* service.subscribe({ signal, lastEventId });
  }),
};
