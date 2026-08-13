import type { AxiosInstance, AxiosResponse } from 'axios';

import type { RequestClientConfig, RequestClientOptions } from './types';

import { bindMethods, defu, isString } from '@taman/utils';
import axios from 'axios';
import qs from 'qs';

import { FileDownloader } from './modules/downloader';
import { InterceptorManager } from './modules/interceptor';
import { SSE } from './modules/sse';
import { FileUploader } from './modules/uploader';

function getParamsSerializer(
  paramsSerializer: RequestClientOptions['paramsSerializer'],
) {
  if (isString(paramsSerializer)) {
    switch (paramsSerializer) {
      case 'brackets': {
        return (params: any) =>
          qs.stringify(params, { arrayFormat: 'brackets' });
      }
      case 'comma': {
        return (params: any) => qs.stringify(params, { arrayFormat: 'comma' });
      }
      case 'indices': {
        return (params: any) =>
          qs.stringify(params, { arrayFormat: 'indices' });
      }
      case 'repeat': {
        return (params: any) => qs.stringify(params, { arrayFormat: 'repeat' });
      }
    }
  }
  return paramsSerializer;
}

class RequestClient {
  public addRequestInterceptor: InterceptorManager['addRequestInterceptor'];

  public addResponseInterceptor: InterceptorManager['addResponseInterceptor'];
  public download: FileDownloader['download'];

  public readonly instance: AxiosInstance;
  // Whether a token refresh is in progress
  public isRefreshing = false;
  public postSSE: SSE['postSSE'];
  // Queue of requests waiting for token refresh
  public refreshTokenQueue: Array<(token: string) => void> = [];
  public requestSSE: SSE['requestSSE'];
  public upload: FileUploader['upload'];

  /**
   * Creates an Axios-backed request client.
   * @param options - Optional Axios request config
   */
  constructor(options: RequestClientOptions = {}) {
    // Merge defaults with caller options
    const defaultConfig: RequestClientOptions = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      responseReturn: 'raw',
      // Default timeout
      timeout: 10_000,
    };
    const { ...axiosConfig } = options;
    const requestConfig = defu(axiosConfig, defaultConfig);
    requestConfig.paramsSerializer = getParamsSerializer(
      requestConfig.paramsSerializer,
    );
    this.instance = axios.create(requestConfig);

    bindMethods(this);

    // Interceptor manager
    const interceptorManager = new InterceptorManager(this.instance);
    this.addRequestInterceptor
      = interceptorManager.addRequestInterceptor.bind(interceptorManager);
    this.addResponseInterceptor
      = interceptorManager.addResponseInterceptor.bind(interceptorManager);

    // File uploader
    const fileUploader = new FileUploader(this);
    this.upload = fileUploader.upload.bind(fileUploader);
    // File downloader
    const fileDownloader = new FileDownloader(this);
    this.download = fileDownloader.download.bind(fileDownloader);
    // SSE module
    const sse = new SSE(this);
    this.postSSE = sse.postSSE.bind(sse);
    this.requestSSE = sse.requestSSE.bind(sse);
  }

  /**
   * DELETE request
   */
  public delete<T = any>(
    url: string,
    config?: RequestClientConfig,
  ): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * GET request
   */
  public get<T = any>(url: string, config?: RequestClientConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * Returns the configured base URL
   */
  public getBaseUrl() {
    return this.instance.defaults.baseURL;
  }

  /**
   * POST request
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: RequestClientConfig,
  ): Promise<T> {
    return this.request<T>(url, { ...config, data, method: 'POST' });
  }

  /**
   * PUT request
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: RequestClientConfig,
  ): Promise<T> {
    return this.request<T>(url, { ...config, data, method: 'PUT' });
  }

  /**
   * Generic request method
   */
  public async request<T>(
    url: string,
    config: RequestClientConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance({
        url,
        ...config,
        ...(config.paramsSerializer
          ? { paramsSerializer: getParamsSerializer(config.paramsSerializer) }
          : {}),
      });
      return response as T;
    } catch (error: any) {
      throw error.response ? error.response.data : error;
    }
  }
}

export { RequestClient };
