import type { AppContext } from 'vue';

/**
 * Globally shared variables, components, and configuration used across modules.
 * Implemented as a singleton. Keep request-scoped data (such as user info) out of this store.
 * Safe for future SSR usage.
 */

interface ComponentsState {
  [key: string]: any;
}

interface MessageState {
  copyPreferencesSuccess?: (title: string, content?: string) => void;
}

export interface IGlobalSharedState {
  appContext?: AppContext;
  components: ComponentsState;
  message: MessageState;
}

class GlobalShareState {
  #appContext?: AppContext;
  #components: ComponentsState = {};
  #message: MessageState = {};

  public getAppContext(): AppContext | undefined {
    return this.#appContext;
  }

  public setAppContext(value: AppContext) {
    this.#appContext = value;
  }

  public getComponents(): ComponentsState {
    return this.#components;
  }

  public setComponents(value: ComponentsState) {
    this.#components = value;
  }

  /**
   * Define framework message handlers for internal scenarios
   */
  public defineMessage({ copyPreferencesSuccess }: MessageState) {
    this.#message = {
      copyPreferencesSuccess,
    };
  }

  public getMessage(): MessageState {
    return this.#message;
  }
}

export const globalShareState = new GlobalShareState();
