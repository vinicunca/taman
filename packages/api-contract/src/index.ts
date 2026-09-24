import type {
  ContractRouterClient,
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from '@orpc/contract';
import { menuContract } from './menu/menu.contract';
import { todoContract } from './todo/todo.contract';

export const contract = {
  menu: menuContract,
  todo: todoContract,
};

export type TamanContract = typeof contract;
export type TamanInputs = InferContractRouterInputs<TamanContract>;
export type TamanOutputs = InferContractRouterOutputs<TamanContract>;
/** `TClientContext` is the client's per-call context (e.g. retry options); same shape as oRPC's `ClientContext`. */
export type TamanClient<TClientContext extends Record<PropertyKey, any> = Record<never, never>>
  = ContractRouterClient<TamanContract, TClientContext>;

export * from './menu/menu.contract';
export * from './shared/errors';
export * from './shared/pagination';
export * from './todo/todo.contract';
export * from './todo/todo.schema';
