import type { IconProps } from 'pohon-ui';
import type { HTMLAttributes } from 'vue';

/** Icon binding for TamanLoading — IconProps plus fallthrough attrs like `class`. */
export interface TamanLoadingIconProps {
  name?: IconProps['name'];
  mode?: IconProps['mode'];
  size?: IconProps['size'];
  customize?: IconProps['customize'];
  class?: HTMLAttributes['class'];
}

export type TamanLoadingIcon = string | TamanLoadingIconProps;
