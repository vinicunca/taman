import { CoreRepo } from '#domains/core/core.repo';

export class HealthRepo extends CoreRepo {
  async healthCheck() {
    const result = await this.db.execute('select 1 as ok');

    return result.rows?.[0];
  }
}
