import { defineApiHandler } from '#lib/api.ts';
import { MOCK_MENUS } from '#utils/mock-data.ts';

export default defineApiHandler(() => {
  const entry = MOCK_MENUS.find((menu) => menu.email === 'taman');

  return entry?.menus ?? [];
});
