import { createTamanDialog } from '@taman/app-ui';

export interface ExplicitDialogData {
  message: string;
  method: 'Explicit generics';
}

export interface FactoryDialogData {
  message: string;
  method: 'Factory contract';
}

export const useFactoryDialog = createTamanDialog<FactoryDialogData>();
