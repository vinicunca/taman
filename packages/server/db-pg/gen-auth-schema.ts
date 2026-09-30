/**
 * Based from this docs: https://www.better-auth.com/docs/concepts/cli#common-issues
 *
 * We need to use relative path in order to get the better auth instance.
 */
import { createBetterAuth } from '../../../apps/better-auth-back/server/auth';

/**
 * The better-auth cli needs to the `auth` variable to be exported in order to generate the schema.
 */
const auth = createBetterAuth();

export default auth;
