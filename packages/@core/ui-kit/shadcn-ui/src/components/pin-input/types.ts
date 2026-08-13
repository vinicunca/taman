interface PinInputProps {
  class?: any;
  /**
   * Verification code length
   */
  codeLength?: number;
  /**
   * Send-code button label factory
   */
  createText?: (countdown: number) => string;
  /**
   * Whether disabled
   */
  disabled?: boolean;
  /**
   * Custom send-code handler
   * @returns
   */
  handleSendCode?: () => Promise<void>;
  /**
   * Send-code button loading state
   */
  loading?: boolean;
  /**
   * Max countdown seconds
   */
  maxTime?: number;
}

export type { PinInputProps };
