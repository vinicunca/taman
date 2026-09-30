import { client } from '#/api/orpc';

/**
 * Get all menus for the current user
 */
export async function getAllMenusApi() {
  return client.menu.all();
}
