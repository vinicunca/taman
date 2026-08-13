import type { NgiburEnv } from '@taman/constants';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';

/**
 * Returns a Drizzle client wired to the correct driver.
 *
 * - development  → node-postgres (pg) — works against local Docker Postgres
 * - uat/production → `@neondatabase/serverless` HTTP driver — required for
 *   Cloudflare Workers (no TCP, only fetch/WebSocket)
 */
export function getDrizzleClient(
  {
    databaseUrl,
    ngiburEnv,
  }: {
    databaseUrl: string;
    ngiburEnv: NgiburEnv;
  },
) {
  if (ngiburEnv === 'development') {
    return drizzleNode({
      connection: databaseUrl,
    });
  }

  return drizzleNeon({
    client: neon(databaseUrl),
  });
}

export type DrizzleClient = ReturnType<typeof getDrizzleClient>;
