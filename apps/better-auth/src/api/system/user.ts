import type { Recordable } from '@taman/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * Get user list data
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/system/user/list',
    { params },
  );
}

/**
 * Create user
 * @param data User data
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post('/system/user', data);
}

/**
 * Update user
 *
 * @param id User ID
 * @param data User data
 */
async function updateUser(
  id: string,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  return requestClient.put(`/system/user/${id}`, data);
}

/**
 * Delete user
 * @param id User ID
 */
async function deleteUser(id: string) {
  return requestClient.delete(`/system/user/${id}`);
}

export { createUser, deleteUser, getUserList, updateUser };
