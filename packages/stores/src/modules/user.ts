import { acceptHMRUpdate, defineStore } from 'pinia';

interface BasicUserInfo {
  [key: string]: any;
  /**
   * Avatar URL.
   */
  avatar: string;
  /**
   * User display name.
   */
  realName: string;
  /**
   * User roles.
   */
  roles?: Array<string>;
  /**
   * User ID.
   */
  userId: string;
  /**
   * Username.
   */
  username: string;
}

interface AccessState {
  /**
   * User profile.
   */
  userInfo: BasicUserInfo | null;
  /**
   * User roles.
   */
  userRoles: Array<string>;
}

/**
 * User profile store.
 */
export const useUserStore = defineStore('core-user', {
  actions: {
    setUserInfo(userInfo: BasicUserInfo | null) {
      // Set user profile
      this.userInfo = userInfo;
      // Set role list
      const roles = userInfo?.roles ?? [];
      this.setUserRoles(roles);
    },
    setUserRoles(roles: Array<string>) {
      this.userRoles = roles;
    },
  },
  state: (): AccessState => ({
    userInfo: null,
    userRoles: [],
  }),
});

// Fix HMR issues
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}
