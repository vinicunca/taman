import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { generateTimestampColumns } from './utils/utils.timestamps.schema';

const userTable = pgTable(
  'user',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    role: text('role'),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    phoneNumber: text('phone_number'),

    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
);

const sessionTable = pgTable(
  'session',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    activeOrganizationId: text('active_organization_id'),

    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

const accountTable = pgTable(
  'account',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

const verificationTable = pgTable(
  'verification',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

const organizationTable = pgTable(
  'organization',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    metadata: text('metadata'),
    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [uniqueIndex('organization_slug_uidx').on(table.slug)],
);

const teamTable = pgTable(
  'team',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    name: text('name').notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [index('team_organizationId_idx').on(table.organizationId)],
);

const teamMemberTable = pgTable(
  'team_member',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teamTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [
    index('teamMember_teamId_idx').on(table.teamId),
    index('teamMember_userId_idx').on(table.userId),
  ],
);

const memberTable = pgTable(
  'member',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [
    index('member_organizationId_idx').on(table.organizationId),
    index('member_userId_idx').on(table.userId),
  ],
);

const invitationTable = pgTable(
  'invitation',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    inviterId: uuid('inviter_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id').references(() => teamTable.id, { onDelete: 'cascade' }),
    ...generateTimestampColumns({
      softDelete: false,
    }),
  },
  (table) => [
    index('invitation_organizationId_idx').on(table.organizationId),
    index('invitation_email_idx').on(table.email),
  ],
);

const userRelations = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
  accounts: many(accountTable),
  teamMembers: many(teamMemberTable),
  members: many(memberTable),
  invitations: many(invitationTable),
}));

const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

const organizationRelations = relations(organizationTable, ({ many }) => ({
  teams: many(teamTable),
  members: many(memberTable),
  invitations: many(invitationTable),
}));

const teamRelations = relations(teamTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [teamTable.organizationId],
    references: [organizationTable.id],
  }),
  teamMembers: many(teamMemberTable),
}));

const teamMemberRelations = relations(teamMemberTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamMemberTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [teamMemberTable.userId],
    references: [userTable.id],
  }),
}));

const memberRelations = relations(memberTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [memberTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [memberTable.userId],
    references: [userTable.id],
  }),
}));

const invitationRelations = relations(invitationTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [invitationTable.organizationId],
    references: [organizationTable.id],
  }),
  team: one(teamTable, {
    fields: [invitationTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [invitationTable.inviterId],
    references: [userTable.id],
  }),
}));

export {
  accountRelations,
  accountTable,
  invitationRelations,
  invitationTable,
  memberRelations,
  memberTable,
  organizationRelations,
  organizationTable,
  sessionRelations,
  sessionTable,
  teamMemberRelations,
  teamMemberTable,
  teamRelations,
  teamTable,
  userRelations,
  userTable,
  verificationTable,
};
