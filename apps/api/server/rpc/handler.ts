import type { RpcInitialContext } from './base.ts';
import { RPCHandler } from '@orpc/server/fetch';
import { router } from './router.ts';

export const RPC_PREFIX = '/api/rpc';

export const rpcHandler = new RPCHandler<RpcInitialContext>(router);
