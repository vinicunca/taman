import {
  accountTable,
  getDrizzleClient,
  invitationTable,
  memberTable,
  organizationTable,
  sessionTable,
  teamMemberTable,
  teamTable,
  userTable,
  verificationTable,
} from '@taman/db-pg';
import { adminAc, adminRoles, organizationAc, organizationRoles } from '@taman/rbac';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin as adminPlugin,
  organization as organizationPlugin,
} from 'better-auth/plugins';
import { useRuntimeConfig } from 'nitro/runtime-config';
import { v7 as uuidv7 } from 'uuid';
import { resolveActiveOrganizationId } from '#auth/auth.active-organization.ts';
import { resolveTrustedOrigins } from '#lib/cors.ts';

export type DirectorAuth = ReturnType<typeof createBetterAuth>;
export type DirectorAuthPayload = DirectorAuth['$Infer']['Session'];

/**
 * Better auth instance.
 * This is a singleton instance of the better auth library.
 *
 * It is created once and then reused for the lifetime of the application.
 * This is useful because better auth is not thread-safe and we want to avoid
 * creating a new instance for each request.
 */
let authInstance: DirectorAuth | null = null;

export function createBetterAuth() {
  const {
    databaseUrl,
    baseUrl,
    betterAuthSecret,
    googleClientId,
    googleClientSecret,
  } = useRuntimeConfig();

  const db = getDrizzleClient(databaseUrl);

  return betterAuth({
    baseURL: baseUrl,

    secret: betterAuthSecret,

    trustedOrigins: resolveTrustedOrigins(),

    database: drizzleAdapter(
      db,
      {
        provider: 'pg',
        schema: {
          user: userTable,
          session: sessionTable,
          account: accountTable,
          verification: verificationTable,
          organization: organizationTable,
          team: teamTable,
          teamMember: teamMemberTable,
          member: memberTable,
          invitation: invitationTable,
        },
      },
    ),

    advanced: {
      cookiePrefix: 'taman',

      database: {
        generateId: () => {
          return uuidv7();
        },
      },
    },

    databaseHooks: {
      session: {
        create: {
          after: async (session) => {
            const activeOrganizationId = session?.activeOrganizationId;

            if (activeOrganizationId) {
              return;
            }

            await resolveActiveOrganizationId(db, session);
          },
        },
      },
    },

    plugins: [
      adminPlugin({
        ac: adminAc,
        roles: adminRoles,
      }),

      organizationPlugin({
        ac: organizationAc,
        roles: organizationRoles,
        cancelPendingInvitationsOnReInvite: true,
        teams: {
          enabled: true,
          defaultTeam: {
            // We don't need to have a default team when org is created.
            enabled: false,
          },
        },
      }),
    ],

    user: {
      additionalFields: {
        phoneNumber: {
          type: 'string',
          required: false,
          defaultValue: null,
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },

    emailVerification: {
      autoSignInAfterVerification: true,
    },

    socialProviders: {
      google: {
        prompt: 'select_account',
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    },

    account: {
      accountLinking: {
        enabled: true,
      },
    },
  });
}

export function useBetterAuth() {
  // If it already exists, return the cached instance
  if (authInstance) {
    return authInstance;
  }

  // Otherwise, create it once and cache it
  authInstance = createBetterAuth();

  return authInstance;
}
