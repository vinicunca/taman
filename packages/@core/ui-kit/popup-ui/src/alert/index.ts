export type {
  AlertProps,
  BeforeCloseScope,
  IconType,
  PromptProps,
} from './alert';
export { useAlertContext } from './alert';
export {
  clearAllAlerts,
  tamanAlert,
  tamanConfirm,
  tamanPrompt,
} from './alert-builder';
export { default as TamanAlert } from './alert.vue';
