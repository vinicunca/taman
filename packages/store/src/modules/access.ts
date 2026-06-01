import { acceptHMRUpdate, defineStore } from 'pinia';

export const useAccessStore = defineStore('core-access', {});

const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useAccessStore, hot));
}
