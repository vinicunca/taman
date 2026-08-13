import type { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { z as zod } from 'zod';

import { TALENT_STATUSES } from '@taman/constants';
import { talentTable } from '../schema/talent.schema';
import { TalentPortfolioItemSchema } from '../schemas/talent';

export const talentInsertSchema = createInsertSchema(
  talentTable,
  {
    legalName: (schema) => schema.min(1, 'Legal name is required'),
    stageName: (schema) => schema.min(1, 'Stage name is required'),
    portfolio: () => zod.array(TalentPortfolioItemSchema).default([]),
    status: () => zod.enum(TALENT_STATUSES),
  },
).pick({
  // Allow-list, not `.omit()`. A deny-list silently admits every column added
  // to the table later — that is how `id`, `status`, and the timestamps became
  // client-settable.
  userId: true,
  legalName: true,
  stageName: true,
  bio: true,
  stageIntro: true,
  techRider: true,
  headshotUrls: true,
  portfolio: true,
  status: true,
});

/** Request body accepted by POST /api/talents. */
export type TalentInsert = z.infer<typeof talentInsertSchema>;

/** A talent row as returned by the API (type-only — no runtime cost). */
export type Talent = typeof talentTable.$inferSelect;
