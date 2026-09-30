import { useBetterAuth } from '#auth';
import { applyCorsToResponse } from '#lib/cors';
import { defineHandler } from 'nitro';

export default defineHandler(async (event) => {
  const auth = useBetterAuth();

  const response = await auth.handler(event.req as Request);

  return applyCorsToResponse(event, response);
});
