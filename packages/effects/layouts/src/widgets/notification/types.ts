interface NotificationItem {
  id: number | string;
  avatar: string;
  date: string;
  isRead?: boolean;
  message: string;
  title: string;
  /**
   * Navigation target: route path or full URL
   * @example '/dashboard' or 'https://example.com'
   */
  link?: string;
  query?: Record<string, any>;
  state?: Record<string, any>;
  /** Custom business fields */
  [key: string]: any;
}

export type { NotificationItem };
