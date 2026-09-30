import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';

export function getDrizzleClient(databaseUrl: string) {
  return drizzleNode({
    connection: databaseUrl,
  });
}

export type DrizzleClient = ReturnType<typeof getDrizzleClient>;
