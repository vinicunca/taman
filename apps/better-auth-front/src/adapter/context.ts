import { globalShareState } from '@taman/common-ui';
import { getCurrentInstance } from 'vue';

// Imperatively-mounted popups (tamanAlert/tamanConfirm/tamanPrompt) render via a
// bare `render(vnode, container)` outside this component tree, so without the
// real app's context they can't resolve injections from installed plugins
// (e.g. Vue Router). Capture it once here and assign it to those vnodes.
export function initAppContext() {
  const appContext = getCurrentInstance()?.appContext;
  if (appContext) {
    globalShareState.setAppContext(appContext);
  }
}
