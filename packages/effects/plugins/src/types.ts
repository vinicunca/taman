import type { Component } from 'vue';

export interface VbenPluginsFormOptions {
  useTamanForm: (...args: any[]) => any;
}

export interface VbenPluginsModalOptions {
  useTamanDialog?: () => any;
}

export interface VbenPluginsMessageOptions {
  useMessage?: () => any;
}

export interface VbenPluginsComponentsOptions {
  [key: string]: Component;
}

export interface VbenPluginsOptions {
  form?: VbenPluginsFormOptions;
  modal?: VbenPluginsModalOptions;
  message?: VbenPluginsMessageOptions;
  components?: VbenPluginsComponentsOptions;
}
