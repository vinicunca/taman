import { createTamanDrawer } from '@taman/app-ui';

export interface ExplicitDrawerData {
  message: string;
  method: 'Explicit generic';
}

export interface FactoryDrawerData {
  message: string;
  method: 'Contract factory';
}

export const useFactoryDrawer = createTamanDrawer<FactoryDrawerData>();
