interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;
type TabOption = BasicOption;

interface BasicUserInfo {
  /**
   * Avatar URL
   */
  avatar: string;
  /**
   * Display name
   */
  realName: string;
  /**
   * User roles
   */
  roles?: Array<string>;
  /**
   * User ID
   */
  userId: string;
  /**
   * Username
   */
  username: string;
}

type ClassType
  = | Array<ClassType>
    | boolean
    | null
    | object
    | string
    | undefined;

export type { BasicOption, BasicUserInfo, ClassType, SelectOption, TabOption };
