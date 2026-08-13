import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { EVENT_CREDIT_ROLES } from '@taman/constants';
import { bookingTalentTable } from '../schema/booking-talent.schema';

export const BookingTalentCreateSchema = createInsertSchema(
  bookingTalentTable,
  {
    role: () => z.enum(EVENT_CREDIT_ROLES),
    performedAt: () => z.coerce.date(),
  },
).pick({
  talentId: true,
  role: true,
  clientName: true,
  location: true,
  performedAt: true,
  note: true,
});

export const BookingTalentUpdateSchema = BookingTalentCreateSchema.omit({ talentId: true }).partial();

export type BookingTalentCreateInput = z.infer<typeof BookingTalentCreateSchema>;
export type BookingTalentUpdateInput = z.infer<typeof BookingTalentUpdateSchema>;
