import { TALENT_STATUSES } from '@taman/constants';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { talentTable } from '../schema/talent.schema';

/**
 * Shared talent validation contracts (API body + backstage forms).
 * Derived from `talentTable` via drizzle-zod so the shape can't drift from
 * the DB columns; `.pick()` keeps only input fields (id, organizationId,
 * userId, timestamps are set server-side from auth/context).
 *
 * Messages are plain English — Nitro returns them as-is; the backstage form
 * reuses `.shape.*` so client and server stay in lockstep.
 */
export const TalentPortfolioItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['image', 'video']),
  url: z.string().min(1),
  title: z.string().optional(),
  provider: z.string().optional(),
});

export type TalentPortfolioItem = z.infer<typeof TalentPortfolioItemSchema>;

export const TalentCreateSchema = createInsertSchema(
  talentTable,
  {
    legalName: (schema) => schema.min(1, 'Legal name is required'),
    stageName: (schema) => schema.min(1, 'Stage name is required'),
    status: () => z.enum(TALENT_STATUSES),
    portfolio: () => z.array(TalentPortfolioItemSchema).default([]),
  },
).pick({
  // Settable by org owner/admin and platform admin only — enforced in
  // TalentService.update, not here, because the schema is shared with the
  // backstage form and has no notion of the caller.
  userId: true,
  status: true,
  legalName: true,
  stageName: true,
  bio: true,
  stageIntro: true,
  techRider: true,
  headshotUrls: true,
  portfolio: true,
});

export const TalentUpdateSchema = TalentCreateSchema.partial().extend({
  // `.partial()` keeps the create-side `.default([])`, which would fire on
  // every PATCH that omits `portfolio` and wipe the stored array.
  portfolio: z.array(TalentPortfolioItemSchema).optional(),
});

export type TalentCreateInput = z.infer<typeof TalentCreateSchema>;
export type TalentUpdateInput = z.infer<typeof TalentUpdateSchema>;

/** Empty form seed — strings so blur hits `.min` messages, not Zod type errors. */
export const talentCreateDefaults = {
  legalName: '',
  stageName: '',
  bio: '',
  stageIntro: '',
  techRider: '',
  headshotUrls: [],
  portfolio: [],
} satisfies TalentCreateInput;
