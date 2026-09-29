const CoreLayout = () => import('./core.vue');
const AuthPageLayout = () => import('./auth.vue');

const IFrameView = () => import('@taman/layouts').then((m) => m.LayoutIFrameView);

export { AuthPageLayout, CoreLayout, IFrameView };
