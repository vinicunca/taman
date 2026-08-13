import { relations } from 'drizzle-orm';
import { organizationTable, userTable } from './auth.schema';
import { bookingTalentTable } from './booking-talent.schema';
import { eventTable } from './event.schema';
import { eventCreditTable } from './event-credit.schema';
import { talentTable } from './talent.schema';

export const eventCreditRelations = relations(eventCreditTable, ({ one }) => ({
  event: one(eventTable, {
    fields: [eventCreditTable.eventId],
    references: [eventTable.id],
  }),
  talent: one(talentTable, {
    fields: [eventCreditTable.talentId],
    references: [talentTable.id],
  }),
  user: one(userTable, {
    fields: [eventCreditTable.userId],
    references: [userTable.id],
  }),
}));

export const bookingTalentRelations = relations(bookingTalentTable, ({ one }) => ({
  talent: one(talentTable, {
    fields: [bookingTalentTable.talentId],
    references: [talentTable.id],
  }),
}));

/** `talentTable`'s first declared relations. */
export const talentRelations = relations(talentTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [talentTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [talentTable.userId],
    references: [userTable.id],
  }),
  credits: many(eventCreditTable),
  bookings: many(bookingTalentTable),
}));
