interface AuthenticationProps {
  /**
   * Code login route path
   */
  codeLoginPath?: string;
  /**
   * Forgot password route path
   */
  forgetPasswordPath?: string;

  /**
   * Whether a loading state is active
   */
  loading?: boolean;

  /**
   * QR code login route path
   */
  qrCodeLoginPath?: string;

  /**
   * Registration route path
   */
  registerPath?: string;

  /**
   * Whether to show code login
   */
  showCodeLogin?: boolean;
  /**
   * Whether to show forgot password
   */
  showForgetPassword?: boolean;

  /**
   * Whether to show QR code login
   */
  showQrcodeLogin?: boolean;

  /**
   * Whether to show the register button
   */
  showRegister?: boolean;

  /**
   * Whether to show remember me
   */
  showRememberMe?: boolean;

  /**
   * Whether to show third-party login
   */
  showThirdPartyLogin?: boolean;

  /**
   * Login panel subtitle
   */
  subtitle?: string;

  /**
   * Login panel title
   */
  title?: string;
  /**
   * Submit button text
   */
  submitButtonText?: string;
}

export type { AuthenticationProps };
