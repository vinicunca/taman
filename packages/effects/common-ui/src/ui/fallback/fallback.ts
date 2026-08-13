interface FallbackProps {
  /**
   * Description
   */
  description?: string;
  /**
   * Home route path
   * @default /
   */
  homePath?: string;
  /**
   * Default image to display
   * @default pageNotFoundSvg
   */
  image?: string;
  /**
   * Built-in status type
   */
  status?: '403' | '404' | '500' | 'coming-soon' | 'offline';
  /**
   * Page message
   */
  title?: string;
}
export type { FallbackProps };
