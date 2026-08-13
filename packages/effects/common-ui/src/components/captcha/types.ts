import type { CSSProperties } from 'vue';

import type { ClassType } from '@taman/types';

export interface CaptchaData {
  /**
   * X coordinate
   */
  x: number;
  /**
   * Y coordinate
   */
  y: number;
  /**
   * Timestamp
   */
  t: number;
}
export interface CaptchaPoint extends CaptchaData {
  /**
   * Data index
   */
  i: number;
}
export interface PointSelectionCaptchaCardProps {
  /**
   * Captcha image
   */
  captchaImage: string;
  /**
   * Captcha image height
   * @default '220px'
   */
  height?: number | string;
  /**
   * Horizontal padding
   * @default '12px'
   */
  paddingX?: number | string;
  /**
   * Vertical padding
   * @default '16px'
   */
  paddingY?: number | string;
  /**
   * Title
   * @default '请按图依次点击'
   */
  title?: string;
  /**
   * Captcha image width
   * @default '300px'
   */
  width?: number | string;
}

export interface PointSelectionCaptchaProps extends PointSelectionCaptchaCardProps {
  /**
   * Whether to show the confirm button
   * @default false
   */
  showConfirm?: boolean;
  /**
   * Hint image
   * @default ''
   */
  hintImage?: string;
  /**
   * Hint text
   * @default ''
   */
  hintText?: string;
}

export interface SliderCaptchaProps {
  class?: ClassType;
  /**
   * @description Slider thumb style
   * @default {}
   */
  actionStyle?: CSSProperties;

  /**
   * @description Slider track style
   * @default {}
   */
  barStyle?: CSSProperties;

  /**
   * @description Content area style
   * @default {}
   */
  contentStyle?: CSSProperties;

  /**
   * @description Wrapper style
   * @default {}
   */
  wrapperStyle?: CSSProperties;

  /**
   * @description Use as a slot for linked components; see rotate captcha
   * @default false
   */
  isSlot?: boolean;

  /**
   * @description Success message
   * @default '验证通过'
   */
  successText?: string;

  /**
   * @description Hint text
   * @default '请按住滑块拖动'
   */
  text?: string;
}

export interface SliderRotateCaptchaProps {
  /**
   * @description Rotation angle tolerance
   * @default 20
   */
  diffDegree?: number;

  /**
   * @description Image width
   * @default 260
   */
  imageSize?: number;

  /**
   * @description Image wrapper style
   * @default {}
   */
  imageWrapperStyle?: CSSProperties;

  /**
   * @description Maximum rotation angle
   * @default 270
   */
  maxDegree?: number;

  /**
   * @description Minimum rotation angle
   * @default 90
   */
  minDegree?: number;

  /**
   * @description Image URL
   */
  src?: string;
  /**
   * @description Default hint text
   */
  defaultTip?: string;
}

export interface SliderTranslateCaptchaProps {
  /**
   * @description Puzzle canvas width
   * @default 420
   */
  canvasWidth?: number;
  /**
   * @description Puzzle canvas height
   * @default 280
   */
  canvasHeight?: number;
  /**
   * @description Square side length on the puzzle piece
   * @default 42
   */
  squareLength?: number;
  /**
   * @description Circle radius on the puzzle piece
   * @default 10
   */
  circleRadius?: number;
  /**
   * @description Image URL
   */
  src?: string;
  /**
   * @description Maximum allowed offset
   * @default 3
   */
  diffDistance?: number;
  /**
   * @description Default hint text
   */
  defaultTip?: string;
}

export interface CaptchaVerifyPassingData {
  isPassing: boolean;
  time: number | string;
}

export interface SliderCaptchaActionType {
  resume: () => void;
}

export interface SliderRotateVerifyPassingData {
  event: MouseEvent | TouchEvent;
  moveDistance: number;
  moveX: number;
}
