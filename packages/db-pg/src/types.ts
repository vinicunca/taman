import type {
  userTable,
} from './schema';

/**
 * Based from this docs:
 * https://nuxt.com/docs/4.x/getting-started/data-fetching#serializing-data-from-api-routes.
 *
 * This is used to serialize the data from the database to the client,
 * since the response from the nitro routes only serializes primitive types
 * we need to serialize the Date type to string so it's easier to handle the typings
 * when passing data around.
 */
export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

export type DbUser = Serialized<typeof userTable.$inferSelect>;
