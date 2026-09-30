import { HealthService } from '#domains/health/health.service';
import { defineHandler } from 'nitro';

// Readiness: verifies the service can reach its dependencies (DB).
export default defineHandler(async (event) => {
  const service = new HealthService();
  const { ok } = await service.readiness();

  event.res.status = ok ? 200 : 503;

  return {
    status: ok ? 'ok' : 'error',
    checks: { db: ok ? 'up' : 'down' },
  };
});
