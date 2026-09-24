import { requestClient } from '#/api/request';

/**
 * Get supported timezone options
 */
export async function getTamanTimezoneOptionsApi() {
  return await requestClient.get<
    {
      label: string;
      value: string;
    }[]
  >('/timezone/getTamanTimezoneOptions');
}
/**
 * Get user timezone
 */
export async function getTimezoneApi(): Promise<null | string | undefined> {
  return requestClient.get<null | string | undefined>('/timezone/getTimezone');
}
/**
 * Set user timezone
 * @param timezone Timezone
 */
export async function setTimezoneApi(timezone: string): Promise<void> {
  return requestClient.post('/timezone/setTimezone', { timezone });
}
