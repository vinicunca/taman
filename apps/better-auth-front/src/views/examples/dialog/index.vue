<script lang="ts" setup>
import type { ExplicitDialogData } from './typed-data-contract';
import {
  AppCard,
  AppCardAction,
  AppPage,
  tamanAlert,
  tamanConfirm,
  tamanPrompt,
  useTamanDialog,
  useTamanToast,
} from '@taman/app-ui';
import AutoHeightDemo from './auto-height-demo.vue';
import BasicDemo from './basic-demo.vue';
import BlurDemo from './blur-demo.vue';
import DragDemo from './drag-demo.vue';
import DynamicDemo from './dynamic-demo.vue';
import FormDemo from './form-dialog-demo.vue';
import InContentDemo from './in-content-demo.vue';
import NestedDemo from './nested-demo.vue';
import SharedDataDemo from './shared-data-demo.vue';
import TypedDataAutoDemo from './typed-data-auto-demo.vue';
import { useFactoryDialog } from './typed-data-contract';
import TypedDataExplicitDemo from './typed-data-explicit-demo.vue';
import TypedDataFactoryDemo from './typed-data-factory-demo.vue';

const { toaster } = useTamanToast();

const [BaseDialog, baseDialogApi] = useTamanDialog({ connectedComponent: BasicDemo });
const [InContentDialog, inContentDialogApi] = useTamanDialog({ connectedComponent: InContentDemo });
const [AutoHeightDialog, autoHeightDialogApi] = useTamanDialog({ connectedComponent: AutoHeightDemo });
const [DragDialog, dragDialogApi] = useTamanDialog({ connectedComponent: DragDemo });
const [DynamicDialog, dynamicDialogApi] = useTamanDialog({ connectedComponent: DynamicDemo });
const [SharedDataDialog, sharedDialogApi] = useTamanDialog({ connectedComponent: SharedDataDemo });
const [FormDialog, formDialogApi] = useTamanDialog({ connectedComponent: FormDemo });
const [TypedDataAutoDialog, typedDataAutoDialogApi] = useTamanDialog({ connectedComponent: TypedDataAutoDemo });
const [TypedDataExplicitDialog, typedDataExplicitDialogApi] = useTamanDialog<ExplicitDialogData>({ connectedComponent: TypedDataExplicitDemo });
const [TypedDataFactoryDialog, typedDataFactoryDialogApi] = useFactoryDialog({ connectedComponent: TypedDataFactoryDemo });
const [NestedDialog, nestedDialogApi] = useTamanDialog({ connectedComponent: NestedDemo });
const [BlurDialog, blurDialogApi] = useTamanDialog({ connectedComponent: BlurDemo });

function openBaseDialog() {
  baseDialogApi.open();
}

function openInContentDialog() {
  inContentDialogApi.open();
}

function openAutoHeightDialog() {
  autoHeightDialogApi.open();
}

function openDragDialog() {
  dragDialogApi.open();
}

function openDynamicDialog() {
  dynamicDialogApi.open();
}

function openSharedDialog() {
  sharedDialogApi
    .setData({
      content: 'Data passed from an external source content',
      payload: 'Data passed from an external source payload',
    })
    .open();
}

function openNestedDialog() {
  nestedDialogApi.open();
}

function openBlurDialog() {
  blurDialogApi.open();
}

function handleUpdateTitle() {
  dynamicDialogApi.setState({ title: 'External dynamic title' }).open();
}

function openFormDialog() {
  formDialogApi
    .setData({
      // Form values
      values: { field1: 'abc', field2: '123', field3: '1' },
    })
    .open();
}

function openTypedDataAutoDialog() {
  typedDataAutoDialogApi
    .setData({
      message: 'External without declaring generics, automatically inferred by connected component.',
      method: 'Automatic inference',
    })
    .open();
}

function openTypedDataExplicitDialog() {
  typedDataExplicitDialogApi
    .setData({
      message: 'Parent and child components explicitly reference the same data type.',
      method: 'Explicit generics',
    })
    .open();
}

function openTypedDataFactoryDialog() {
  typedDataFactoryDialogApi
    .setData({
      message: 'Parent and child components reuse pre-bound typed composable.',
      method: 'Factory contract',
    })
    .open();
}

function openAlert() {
  tamanAlert({
    content: 'This is a dialog',
    icon: 'success',
  }).then(() => {
    toaster.info('User closed the dialog');
  }).catch(() => {
    // Dismissal preserves the alert API's cancellation rejection.
  });
}

function openConfirm() {
  tamanConfirm({
    beforeClose({ isConfirm }) {
      if (!isConfirm) {
        return;
      }
      // Here you can do some asynchronous operations
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    },
    centered: false,
    content: 'This is a confirmation dialog',
    icon: 'question',
  })
    .then(() => {
      toaster.success('User confirmed the operation');
    })
    .catch(() => {
      toaster.error('User cancelled the operation');
    });
}

async function openPrompt() {
  tamanPrompt<string>({
    async beforeClose({ isConfirm, value }) {
      if (isConfirm && value === 'cheese') {
        toaster.error('You cannot eat cheese');
        return false;
      }
    },
    componentProps: { placeholder: 'You cannot eat cheese...' },
    content: 'What did you eat for lunch?',
    icon: 'question',
    overlayBlur: 3,
  })
    .then((res) => {
      toaster.success(`User input: ${res}`);
    })
    .catch(() => {
      toaster.error('User cancelled the input');
    });
}
</script>

<template>
  <AppPage
    auto-content-height
    title="Dialog component example"
    description="Dialog components are often used to display additional information, forms, or operation prompts without leaving the current page. For more API information, please refer to the component documentation."
  >
    <BaseDialog />
    <InContentDialog />
    <AutoHeightDialog />
    <DragDialog />
    <DynamicDialog />
    <SharedDataDialog />
    <FormDialog />
    <TypedDataAutoDialog />
    <TypedDataExplicitDialog />
    <TypedDataFactoryDialog />
    <NestedDialog />
    <BlurDialog />

    <div class="gap-4 grid grid-cols-3">
      <AppCard title="Basic usage">
        <p>A basic dialog example</p>

        <template #footer>
          <PButton
            class="mx-auto"
            @click="openBaseDialog"
          >
            Open Dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Specify container + do not destroy after closing">
        <p>Example of opening a pop-up window in the content area</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openInContentDialog"
          >
            Open Dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Content height adaptive">
        <p>It can automatically adjust the height based on the content.</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openAutoHeightDialog"
          >
            Open Dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Drag-and-drop example">
        <p>Configure draggable to enable drag-and-drop functionality.</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openDragDialog"
          >
            Open Dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Dynamic configuration example">
        <p>Dynamically adjust pop-up data using setState</p>
        <template #trailingHeader>
          <AppCardAction>
            <PButton
              @click="openDynamicDialog"
            >
              Open Dialog
            </PButton>
          </AppCardAction>
        </template>

        <template #footer>
          <PButton
            class="mx-auto"
            @click="handleUpdateTitle"
          >
            External title modification and opening
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Example of internal and external data sharing">
        <p>Data interaction through shared sharedData</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openSharedDialog"
          >
            Open Dialog and pass data
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Form dialog example">
        <p>Dialog combined with form</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openFormDialog"
          >
            Open form dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Shared Data: Automatic Derivation">
        <p>Child component exposes API, parent component derives type from connected component</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openTypedDataAutoDialog"
          >
            Open automatic derivation example
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Shared Data: Explicit Generics">
        <p>When automatic derivation is not possible, parent and child components explicitly reference the same data type</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openTypedDataExplicitDialog"
          >
            Open explicit generics example
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Shared Data: Factory Contract">
        <p>Pre-bind type and reuse typed composable through createTamanDialog</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openTypedDataFactoryDialog"
          >
            Open factory contract example
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Nested dialog example">
        <p>Open Dialog again in the already opened dialog</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openNestedDialog"
          >
            Open nested dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Mask blur example">
        <p>The mask layer applies a similar frosted glass effect</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openBlurDialog"
          >
            Open Dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Lightweight prompt pop-up">
        <p>Create dynamic prompt pop-ups through quick methods, suitable for some lightweight prompts and confirmations, inputs, etc.</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="openAlert"
          >
            Alert
          </PButton>
          <PButton
            class="mx-auto"
            @click="openConfirm"
          >
            Confirm
          </PButton>
          <PButton
            class="mx-auto"
            @click="openPrompt"
          >
            Prompt
          </PButton>
        </template>
      </AppCard>
    </div>
  </AppPage>
</template>
