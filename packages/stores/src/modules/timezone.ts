import { DEFAULT_TIME_ZONE_OPTIONS } from '@taman-core/preferences';
import {
  getCurrentTimezone,
  setCurrentTimezone,
} from '@taman-core/shared/utils';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref, unref } from 'vue';

interface TimezoneHandler {
  getTimezone?: () => Promise<null | string | undefined>;
  getTamanTimezoneOptions?: () => Promise<
    Array<{
      label: string;
      value: string;
    }>
  >;
  setTimezone?: (timezone: string) => Promise<void>;
}

/**
 * Default timezone handler.
 * Timezone state is persisted via the Pinia persistence plugin.
 */
function getDefaultTimezoneHandler(): TimezoneHandler {
  return {
    getTamanTimezoneOptions: () => {
      return Promise.resolve(
        DEFAULT_TIME_ZONE_OPTIONS.map((item) => {
          return {
            label: item.label,
            value: item.timezone,
          };
        }),
      );
    },
  };
}

/**
 * Custom timezone handler.
 */
let customTimezoneHandler: null | Partial<TimezoneHandler> = null;
function setTimezoneHandler(handler: Partial<TimezoneHandler>) {
  customTimezoneHandler = handler;
}

/**
 * Get the active timezone handler (default merged with custom overrides).
 */
function getTimezoneHandler() {
  return {
    ...getDefaultTimezoneHandler(),
    ...customTimezoneHandler,
  };
}

/**
 * Timezone store.
 */
const useTimezoneStore = defineStore(
  'core-timezone',
  () => {
    const timezoneRef = ref(getCurrentTimezone());

    /**
     * Initialize the timezone.
     */
    async function initTimezone() {
      const timezoneHandler = getTimezoneHandler();
      const timezone = await timezoneHandler.getTimezone?.();
      if (timezone) {
        timezoneRef.value = timezone;
      }
      // Set dayjs default timezone
      setCurrentTimezone(unref(timezoneRef));
    }

    /**
     * Set the timezone.
     * @param timezone Timezone string.
     */
    async function setTimezone(timezone: string) {
      const timezoneHandler = getTimezoneHandler();
      await timezoneHandler.setTimezone?.(timezone);
      timezoneRef.value = timezone;
      // Set dayjs default timezone
      setCurrentTimezone(timezone);
    }

    /**
     * Get timezone options.
     */
    async function getTamanTimezoneOptions() {
      const timezoneHandler = getTimezoneHandler();
      return (await timezoneHandler.getTamanTimezoneOptions?.()) || [];
    }

    initTimezone().catch((error) => {
      console.error('Failed to initialize timezone during store setup:', error);
    });

    function $reset() {
      timezoneRef.value = getCurrentTimezone();
    }

    return {
      timezone: timezoneRef,
      setTimezone,
      getTamanTimezoneOptions,
      $reset,
    };
  },
  {
    persist: {
      // Persist selected fields
      pick: ['timezone'],
    },
  },
);

export { setTimezoneHandler, useTimezoneStore };

// Fix HMR issues
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useTimezoneStore, hot));
}
