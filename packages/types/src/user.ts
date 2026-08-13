import type { BasicUserInfo } from '@taman-core/typings';

/** User profile */
interface UserInfo extends BasicUserInfo {
  /**
   * User description
   */
  desc: string;
  /**
   * Home page path
   */
  homePath: string;
}

export type { UserInfo };
