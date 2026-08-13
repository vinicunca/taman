import { relations } from 'drizzle-orm';
import { eventTable } from './event.schema';
import { eventCreditTable } from './event-credit.schema';
import { orderTable } from './order.schema';
import { ticketCategoryTable } from './ticket-category.schema';
import { ticketTable } from './ticket.schema';
import { transactionTable } from './transaction.schema';
import { venueTable } from './venue.schema';

export const venueRelations = relations(venueTable, ({ many }) => ({
  events: many(eventTable),
}));

export const eventRelations = relations(eventTable, ({ one, many }) => ({
  venue: one(venueTable, {
    fields: [eventTable.venueId],
    references: [venueTable.id],
  }),
  ticketCategories: many(ticketCategoryTable),
  tickets: many(ticketTable),
  credits: many(eventCreditTable),
}));

export const ticketCategoryRelations = relations(ticketCategoryTable, ({ one, many }) => ({
  event: one(eventTable, {
    fields: [ticketCategoryTable.eventId],
    references: [eventTable.id],
  }),
  orders: many(orderTable),
}));

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  ticketCategory: one(ticketCategoryTable, {
    fields: [orderTable.ticketCategoryId],
    references: [ticketCategoryTable.id],
  }),
  transactions: many(transactionTable),
  tickets: many(ticketTable),
}));

export const transactionRelations = relations(transactionTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [transactionTable.orderId],
    references: [orderTable.id],
  }),
}));

export const ticketRelations = relations(ticketTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [ticketTable.orderId],
    references: [orderTable.id],
  }),
  event: one(eventTable, {
    fields: [ticketTable.eventId],
    references: [eventTable.id],
  }),
}));
