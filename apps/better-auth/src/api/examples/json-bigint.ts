import { requestClient } from '#/api/request';

/**
 * Send request
 */
async function getBigIntData() {
  return requestClient.get('/demo/bigint');
}

export { getBigIntData };
