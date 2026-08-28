export interface LayoutWidgetNotificationItem {
  id: number | string;
  avatar: string;
  date: string;
  isRead?: boolean;
  message: string;
  title: string;
  /**
   * Redirect link, can be a route path or full URL
   * @example '/dashboard' or 'https://example.com'
   */
  link?: string;
  query?: Record<string, any>;
  state?: Record<string, any>;
  [key: string]: any;
}
