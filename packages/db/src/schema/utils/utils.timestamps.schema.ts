import type { AnyPgColumnBuilder } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';

function generateTimestampColumns(
  {
    softDelete = true,
  }:
  {
    softDelete?: boolean;
  },
) {
  const timestampColumns: Record<string, AnyPgColumnBuilder> = {
    createdAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  };

  if (softDelete) {
    timestampColumns.deletedAt = timestamp({ withTimezone: true })
      .defaultNow()
      .notNull();
  }

  return timestampColumns;
}

export { generateTimestampColumns };
