import type { AuthRoleNames } from '@taman/rbac';

// Narrow route `authority` and menu role checks to this app's roles
declare module '@vinicunca/taman-core/typings' {
  interface TamanRoleRegistry {
    role: AuthRoleNames;
  }
}
