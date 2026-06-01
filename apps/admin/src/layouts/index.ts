const LayoutCore = () => import('./core.vue');
const LayoutAuth = () => import('./auth.vue');

const IFrameView = () => import('@taman/layouts').then((m) => m.IFrameView);

export {
  IFrameView,
  LayoutAuth,
  LayoutCore,
};
