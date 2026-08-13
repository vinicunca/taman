import { requestClient } from '#/api/request';

/**
 * Mock arbitrary HTTP status codes
 */
async function getMockStatusApi(status: string) {
  return requestClient.get('/status', { params: { status } });
}

export { getMockStatusApi };
