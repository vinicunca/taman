import { useAppTamanConfig } from '@taman/composables';
import { adminAc, adminRoles, organizationAc, organizationRoles } from '@taman/rbac';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/vue';

const { directorUrl } = useAppTamanConfig(import.meta.env, import.meta.env.PROD);

/**
 * Better Auth client singleton.
 *
 * Plugins mirror the director backend (`apps/director/lib/auth.ts`) so that
 * `session.user.role` and organization helpers are available and typed.
 */
export const authClient = createAuthClient({
  baseURL: directorUrl,

  plugins: [
    adminClient({
      ac: adminAc,
      roles: adminRoles,
    }),

    organizationClient({
      ac: organizationAc,
      roles: organizationRoles,
    }),
  ],
});

export type AppSession = typeof authClient.$Infer.Session;
export type AppSessionUser = AppSession['user'];
