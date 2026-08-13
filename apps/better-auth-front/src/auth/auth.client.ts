import { useAppTamanConfig } from '@taman/composables';
import { adminAc, adminRoles } from '@taman/rbac';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/vue';

const { directorUrl } = useAppTamanConfig(import.meta.env, import.meta.env.PROD);

/**
 * Better Auth client singleton.
 *
 * Plugins mirror the backend (`apps/better-auth-back`) so that
 * `session.user.role` and admin helpers are available and typed.
 */
export const authClient = createAuthClient({
  baseURL: directorUrl,

  plugins: [
    adminClient({
      ac: adminAc,
      roles: adminRoles,
    }),
  ],
});

export type AppSession = typeof authClient.$Infer.Session;
export type AppSessionUser = AppSession['user'];
