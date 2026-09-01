import type { RouteRecordStringComponent } from '@taman/types';

import { doRequest } from '#/api/use-request';

/**
 * Get all menus for the current user
 */
export async function getAllMenusApi() {
  return doRequest<Array<RouteRecordStringComponent>>('/menu/all');
}
