import type { NgiburEnv } from '@taman/constants';
import type { H3Event } from 'nitro';
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
import { v7 as uuidv7 } from 'uuid';
import { resolveActiveOrganizationId } from '#auth/auth.active-organization.ts';

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

export function createBetterAuth(env: Cloudflare.Env) {
  const {
    DATABASE_URL,
    BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    BASE_URL,
    APP_ENV,
    COOKIE_DOMAIN,
  } = env;

  const db = getDrizzleClient({
    databaseUrl: DATABASE_URL,
    ngiburEnv: APP_ENV as NgiburEnv,
  });

  return betterAuth({
    baseURL: BASE_URL,

    secret: BETTER_AUTH_SECRET,

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
      cookiePrefix: 'ngibur',

      database: {
        generateId: () => {
          return uuidv7();
        },
      },

      crossSubDomainCookies: {
        domain: COOKIE_DOMAIN,
        enabled: APP_ENV !== 'development',
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
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      },
    },

    account: {
      accountLinking: {
        enabled: true,
      },
    },
  });
}

export function useBetterAuth(event: H3Event) {
  // If it already exists, return the cached instance
  if (authInstance) {
    return authInstance;
  }

  const cloudflareEnv = getCloudflareEnv(event);

  // Otherwise, create it once and cache it
  authInstance = createBetterAuth(cloudflareEnv);

  return authInstance;
}
