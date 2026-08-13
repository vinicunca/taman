import type { RouteRecordStringComponent } from '@taman/types';

import { requestClient } from '#/api/request';

/**
 * Get all menus for the current user
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}
