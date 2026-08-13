import type { AppSession } from './auth.client';

import { authClient } from './auth.client';

/**
 * Ensure the Better Auth session has an active organization when the user
 * belongs to at least one. Called after login / session refresh.
 */
export async function ensureActiveOrganization(
  incomingSession: AppSession | null,
): Promise<AppSession | null> {
  try {
    if (!incomingSession?.user) {
      return incomingSession;
    }

    if (incomingSession.session?.activeOrganizationId) {
      return incomingSession;
    }

    const {
      data: organizations,
    } = await authClient.organization.list();

    if (!organizations?.length) {
      return incomingSession;
    }

    const organizationId = organizations[0]!.id;

    const { error: setError } = await authClient.organization.setActive({
      organizationId,
    });

    if (setError) {
      return incomingSession;
    }

    const { data: refreshed } = await authClient.getSession();

    return refreshed ?? incomingSession;
  } catch (error) {
    console.error('Error while ensuring active organization: ', error);
    return incomingSession;
  }
}
