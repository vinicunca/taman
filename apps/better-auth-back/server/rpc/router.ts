import { os } from './base.ts';
import { menuRouter } from './procedures/menu.ts';
import { todoRouter } from './procedures/todo.ts';

export const router = os.router({
  menu: menuRouter,
  todo: todoRouter,
});

export type Router = typeof router;
