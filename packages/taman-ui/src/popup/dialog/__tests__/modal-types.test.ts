import type { ExtendedDialogApi, InferDialogData } from '../dialog.types';
import type { createTamanDialog, useTamanDialog } from '../use-taman-dialog';
import type TypedDialog from './fixtures/typed-dialog.vue';

import { describe, expectTypeOf, it } from 'vitest';

interface TypedDialogData {
  id: number;
  mode: 'edit' | 'view';
}

type DialogData = null | TypedDialogData;

declare const createDialog: typeof createTamanDialog;
declare const useDialog: typeof useTamanDialog;

describe('dialog public data types', () => {
  it('infers data from the connected component exposed api', () => {
    function assertInferredData(connectedComponent: typeof TypedDialog) {
      const [, dialogApi] = useDialog({ connectedComponent });

      expectTypeOf(dialogApi).toEqualTypeOf<ExtendedDialogApi<DialogData>>();
      expectTypeOf(dialogApi.getData()).toEqualTypeOf<DialogData | undefined>();
      expectTypeOf(dialogApi.setData).parameter(0).toEqualTypeOf<DialogData>();
      expectTypeOf(dialogApi.setData(null).open()).toBeVoid();
      dialogApi.setData({ id: 1, mode: 'edit' });
    }

    expectTypeOf<
      InferDialogData<typeof TypedDialog>
    >().toEqualTypeOf<DialogData>();
    expectTypeOf(assertInferredData).toBeFunction();
  });

  it('supports explicit and pre-bound data contracts', () => {
    function assertExplicitData() {
      const [, explicitApi] = useDialog<DialogData>();
      const useTypedDialog = createDialog<DialogData>();
      const [, preBoundApi] = useTypedDialog();

      expectTypeOf(explicitApi).toEqualTypeOf<ExtendedDialogApi<DialogData>>();
      expectTypeOf(preBoundApi).toEqualTypeOf<ExtendedDialogApi<DialogData>>();
    }

    expectTypeOf(assertExplicitData).toBeFunction();
  });

  it('falls back to unknown without a data contract', () => {
    function assertUnknownData() {
      const [, dialogApi] = useDialog();

      expectTypeOf(dialogApi).toEqualTypeOf<ExtendedDialogApi<unknown>>();
      expectTypeOf(dialogApi.getData()).toBeUnknown();
    }

    expectTypeOf(assertUnknownData).toBeFunction();
  });
});
