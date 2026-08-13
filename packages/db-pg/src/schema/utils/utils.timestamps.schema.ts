import { timestamp } from 'drizzle-orm/pg-core';

export function generateTimestampColumns(
  {
    softDelete = true,
  }:
  {
    softDelete?: boolean;
  },
) {
  return {
    createdAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ...(softDelete
      ? {
          deletedAt: timestamp({ withTimezone: true })
            .defaultNow()
            .notNull(),
        }
      : {}),
  };
}
