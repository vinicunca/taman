import { defineHandler } from 'nitro';
import { applyCorsToResponse } from '#lib/cors.ts';
import { httpError } from '#lib/http.ts';
import { RPC_PREFIX, rpcHandler } from '#rpc/handler.ts';

/**
 * Single entry for the whole oRPC API. oRPC returns a raw `Response`, and
 * non-2xx raw Responses skip Nitro's merge of the CORS middleware headers —
 * same as the better-auth passthrough — so re-apply them here.
 */
export default defineHandler(async (event) => {
  const { matched, response } = await rpcHandler.handle(event.req as Request, {
    prefix: RPC_PREFIX,
    context: { event },
  });

  if (!matched) {
    throw httpError({ status: 404, message: 'Procedure not found' });
  }

  return applyCorsToResponse(event, response);
});
