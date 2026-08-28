const CoreLayout = () => import('./core.vue');
const AuthPageLayout = () => import('./auth.vue');

const IFrameView = () => import('@taman/layouts').then((m) => m.IFrameView);

export { AuthPageLayout, CoreLayout, IFrameView };
