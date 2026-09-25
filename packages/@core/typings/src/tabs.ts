import type { RouteLocationNormalized } from 'vue-router';

export interface TamanTabDefinition extends RouteLocationNormalized {
  /**
   * Tab key
   */
  key?: string;
}
