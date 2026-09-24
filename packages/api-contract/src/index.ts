import type {
  ClientContext,
  InferRouterContractInputs,
  InferRouterContractOutputs,
  RouterContractClient,
} from '@orpc/contract';
import { menuContract } from './menu/menu.contract';
import { todoContract } from './todo/todo.contract';

export const contract = {
  menu: menuContract,
  todo: todoContract,
};

export type TamanContract = typeof contract;
export type TamanInputs = InferRouterContractInputs<TamanContract>;
export type TamanOutputs = InferRouterContractOutputs<TamanContract>;
export type TamanClient<TClientContext extends ClientContext = Record<never, never>>
  = RouterContractClient<TamanContract, TClientContext>;

export * from './menu/menu.contract';
export * from './shared/errors';
export * from './shared/pagination';
export * from './todo/todo.contract';
export * from './todo/todo.schema';
