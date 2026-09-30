import { authed, os } from '#rpc/base.ts';
import { MOCK_MENUS } from '#utils/mock-data.ts';

export const menuRouter = {
  // Moved from the old unauthenticated `/menu/all` route; now requires a session.
  all: os.menu.all.use(authed).handler(() => {
    const entry = MOCK_MENUS.find((menu) => menu.email === 'taman');
    return entry?.menus ?? [];
  }),
};
