import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { EVENT_CREDIT_ROLES } from '@taman/constants';
import { eventCreditTable } from '../schema/event-credit.schema';

/**
 * Exactly one of talentId/userId/guestName must be set. Mirrors the
 * `event_credit_subject_check` DB constraint so a malformed payload is
 * rejected here — the service is expected to never actually trigger that
 * CHECK.
 */
export const EventCreditCreateSchema = createInsertSchema(
  eventCreditTable,
  {
    guestName: (schema) => schema.min(1, 'Guest name is required'),
    role: () => z.enum(EVENT_CREDIT_ROLES),
  },
).pick({
  eventId: true,
  talentId: true,
  userId: true,
  guestName: true,
  role: true,
  note: true,
}).refine(
  (value) => [value.talentId, value.userId, value.guestName].filter((v) => v != null).length === 1,
  { message: 'Exactly one of talentId, userId, or guestName is required', path: ['talentId'] },
);

export type EventCreditCreateInput = z.infer<typeof EventCreditCreateSchema>;
