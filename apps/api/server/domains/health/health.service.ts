import type { DrizzleClient } from '@taman/db-pg';
import { getDrizzleClient } from '@taman/db-pg';
import { useRuntimeConfig } from 'nitro/runtime-config';
import { HealthRepo } from './health.repo';

export class HealthService {
  protected readonly db: DrizzleClient;

  constructor() {
    this.db = getDrizzleClient(useRuntimeConfig().databaseUrl);
  }

  async readiness() {
    try {
      await new HealthRepo(this.db)
        .healthCheck();
      return { ok: true };
    } catch (err) {
      // DrizzleQueryError wraps the real driver error in `.cause`; log it
      // explicitly so the underlying reason (auth/host/fetch) is visible.
      const cause = (err as { cause?: unknown }).cause;
      console.error('[readiness] db check failed', err, '\ncause:', cause ?? '(none)');
      return { ok: false };
    }
  }
}
