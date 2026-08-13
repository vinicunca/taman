import type { CubicBezierPoints, EasingFunction } from '@vueuse/core';

import type { StyleValue } from 'vue';

import { TransitionPresets as TransitionPresetsData } from '@vueuse/core';

export type TransitionPresets = keyof typeof TransitionPresetsData;

export const TransitionPresetsKeys = Object.keys(
  TransitionPresetsData,
) as TransitionPresets[];

export interface CountToProps {
  /** Start value */
  startVal?: number;
  /** End value */
  endVal: number;
  /** Disable animation */
  disabled?: boolean;
  /** Delay before animation starts */
  delay?: number;
  /** Duration */
  duration?: number;
  /** Decimal places */
  decimals?: number;
  /** Decimal separator */
  decimal?: string;
  /** Thousands separator */
  separator?: string;
  /** Prefix */
  prefix?: string;
  /** Suffix */
  suffix?: string;
  /** Transition easing */
  transition?: CubicBezierPoints | EasingFunction | TransitionPresets;
  /** Class for the integer part */
  mainClass?: string;
  /** Class for the decimal part */
  decimalClass?: string;
  /** Class for the prefix */
  prefixClass?: string;
  /** Class for the suffix */
  suffixClass?: string;

  /** Style for the integer part */
  mainStyle?: StyleValue;
  /** Style for the decimal part */
  decimalStyle?: StyleValue;
  /** Style for the prefix */
  prefixStyle?: StyleValue;
  /** Style for the suffix */
  suffixStyle?: StyleValue;
}
