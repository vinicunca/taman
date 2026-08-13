import type { Recordable } from '@taman/types';

import { requestClient } from '#/api/request';

/**
 * Send request with array query params
 */
async function getParamsData(
  params: Recordable<any>,
  type: 'brackets' | 'comma' | 'indices' | 'repeat',
) {
  return requestClient.get('/status', {
    params,
    paramsSerializer: type,
    responseReturn: 'raw',
  });
}

export { getParamsData };
