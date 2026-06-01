import { TAMAN_ACCESS_MODE_TYPE } from '@taman-core/typings';
import { preferences, updatePreferences } from '@taman/preferences';
import { useAccessStore, useUserStore } from '@taman/stores';
import { computed } from 'vue';

function useAccess() {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const accessMode = computed(() => {
    return preferences.app.accessMode;
  });

  /**
   * Determine permission based on role.
   * @description: Determine whether there is permission，The role is judged by the user's role
   * @param roles
   */
  function hasAccessByRoles(roles: Array<string>) {
    const userRoleSet = new Set(userStore.userRoles);
    const intersection = roles.filter((item) => userRoleSet.has(item));
    return intersection.length > 0;
  }

  /**
   * Determine whether there is permission based on permission code
   * @description: Determine whether there is permission，The permission code is judged by the user's permission code
   * @param codes
   */
  function hasAccessByCodes(codes: Array<string>) {
    const userCodesSet = new Set(accessStore.accessCodes);

    const intersection = codes.filter((item) => userCodesSet.has(item));
    return intersection.length > 0;
  }

  async function toggleAccessMode() {
    updatePreferences({
      app: {
        accessMode:
          preferences.app.accessMode === TAMAN_ACCESS_MODE_TYPE.FRONTEND ? TAMAN_ACCESS_MODE_TYPE.BACKEND : TAMAN_ACCESS_MODE_TYPE.FRONTEND,
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
