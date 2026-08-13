import { defineHandler } from 'nitro';
import { useBetterAuth } from '#auth';
import { applyCorsToResponse } from '#lib/cors';

export default defineHandler(async (event) => {
  const auth = useBetterAuth();

  const response = await auth.handler(event.req as Request);

  return applyCorsToResponse(event, response);
});
