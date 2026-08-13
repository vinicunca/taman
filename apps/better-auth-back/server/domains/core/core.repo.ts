import type { DrizzleClient } from '@taman/db-pg';

export class CoreRepo {
  constructor(protected readonly db: DrizzleClient) {
    this.db = db;
  }
}
