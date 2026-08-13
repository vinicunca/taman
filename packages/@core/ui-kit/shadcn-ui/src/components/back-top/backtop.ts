export const backtopProps = {
  /**
   * Bottom distance.
   */
  bottom: {
    default: 40,
    type: Number,
  },
  /**
   * Right distance.
   */
  right: {
    default: 40,
    type: Number,
  },
  /**
   * The target to trigger scroll.
   */
  target: {
    default: '',
    type: String,
  },
  /**
   * The button will not show until the scroll height reaches this value.
   */
  visibilityHeight: {
    default: 200,
    type: Number,
  },
} as const;

export interface BacktopProps {
  bottom?: number;
  isGroup?: boolean;
  right?: number;
  target?: string;
  visibilityHeight?: number;
}
