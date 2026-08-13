import { requestClient } from '#/api/request';

export namespace DemoTableApi {
  export interface PageFetchParams {
    [key: string]: any;
    page: number;
    pageSize: number;
  }
}

/**
 * Get example table data
 */
async function getExampleTableApi(params: DemoTableApi.PageFetchParams) {
  return requestClient.get('/table/list', { params });
}

export { getExampleTableApi };
