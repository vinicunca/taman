import type { MaybeRefOrGetter } from 'vue';

import { preferences, updatePreferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { computed, inject, toValue } from 'vue';

import { ACCESS_ROLES_KEY } from './directive';
import { matchesAnyRole } from './matches-any-role';

function useAccess() {
  const accessStore = useAccessStore();
  const injectedRoles = inject(ACCESS_ROLES_KEY);
  if (!injectedRoles) {
    throw new Error(
      'useAccess() requires registerAccessDirective(app, roles) to have been called first.',
    );
  }
  const rolesSource: MaybeRefOrGetter<Array<string>> = injectedRoles;

  const accessMode = computed(() => {
    return preferences.app.accessMode;
  });

  /**
   * Check access by user roles.
   * @description Determine whether there is permission; access is granted when any role matches.
   * @param roles
   */
  function hasAccessByRoles(roles: Array<string>) {
    return matchesAnyRole(toValue(rolesSource), roles);
  }

  /**
   * Check access by permission codes.
   * @description Determine whether there is permission; access is granted when any code matches.
   * @param codes
   */
  function hasAccessByCodes(codes: Array<string>) {
    return matchesAnyRole(accessStore.accessCodes, codes);
  }

  async function toggleAccessMode() {
    updatePreferences({
      app: {
        accessMode:
          preferences.app.accessMode === 'frontend' ? 'backend' : 'frontend',
      },
    });
  }

  return {
    accessMode,
    hasAccessByCodes,
    hasAccessByRoles,
    toggleAccessMode,
  };
}

export { useAccess };
