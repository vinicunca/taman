import type { RouteRecordStringComponent } from '@taman/types';

import { requestClient } from '#/api/request';
import { useRequest } from '#/api/use-request';

/**
 * Get all menus for the current user
 */
export async function getAllMenusApi() {
  const { doRequest } = useRequest();
  console.log('🚀 ~ getAllMenusApi ~ doRequest:', doRequest);

  return doRequest('/menu/all');
  // return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}
