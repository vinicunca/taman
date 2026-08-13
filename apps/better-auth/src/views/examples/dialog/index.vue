<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';
import { clearAllAlerts, tamanAlert, tamanConfirm, tamanPrompt, useTamanDialog, useTamanToast } from '@taman/common-ui';
import { onBeforeUnmount } from 'vue';
import AutoHeightDemo from './auto-height-demo.vue';
import BasicDemo from './basic-demo.vue';
import BlurDemo from './blur-demo.vue';
import DragDemo from './drag-demo.vue';
import DynamicDemo from './dynamic-demo.vue';
import FormDemo from './form-dialog-demo.vue';
import InContentDemo from './in-content-demo.vue';
import NestedDemo from './nested-demo.vue';
import SharedDataDemo from './shared-data-demo.vue';

const { toaster } = useTamanToast();

const dialogBasicApi = useTamanDialog({ connectedComponent: BasicDemo });
const dialogInContentApi = useTamanDialog({ connectedComponent: InContentDemo });
const dialogAutoHeightApi = useTamanDialog({ connectedComponent: AutoHeightDemo });
const dialogDragApi = useTamanDialog({ connectedComponent: DragDemo });
const dialogDynamicApi = useTamanDialog({ connectedComponent: DynamicDemo });
const dialogSharedDataApi = useTamanDialog({ connectedComponent: SharedDataDemo });
const dialogNestedApi = useTamanDialog({ connectedComponent: NestedDemo });
const dialogBlurApi = useTamanDialog({ connectedComponent: BlurDemo });
const dialogFormApi = useTamanDialog({ connectedComponent: FormDemo });

function handleUpdateTitle() {
  dialogDynamicApi.setState({ title: 'External dynamic title' }).open();
}

function openSharedModal() {
  dialogSharedDataApi
    .setData({
      content: 'External passed data content',
      payload: 'External passed data payload',
    })
    .open();
}

function openAlert() {
  tamanAlert({
    content: 'This is a pop-up window.',
    icon: 'success',
  }).then(() => {
    toaster.info('The user closed the popup.');
  });
}

onBeforeUnmount(() => {
  // Clear all pop-ups
  clearAllAlerts();
});

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
    content: 'This is a confirmation pop-up.',
    icon: 'question',
  })
    .then(() => {
      toaster.success('The user confirmed the operation.');
    })
    .catch(() => {
      toaster.error('The user cancelled the operation.');
    });
}

async function openPrompt() {
  tamanPrompt<string>({
    async beforeClose({ isConfirm, value }) {
      if (isConfirm && value === 'cheese') {
        toaster.error('You cannot eat cheese.');
        return false;
      }
    },
    componentProps: { placeholder: 'You cannot eat cheese...' },
    content: 'What did you eat for lunch?',
    icon: 'question',
    overlayBlur: 3,
  })
    .then((res) => {
      toaster.success(`The user entered: ${res}`);
    })
    .catch(() => {
      toaster.error('The user cancelled the input.');
    });
}

function openFormModal() {
  dialogFormApi
    .setData({
      values: { field1: 'abc', field2: '123', field3: '1' },
    })
    .open();
}
</script>

<template>
  <AppPage
    auto-content-height
    title="Dialog component example"
    description="Dialog components are often used to display additional information, forms, or operation prompts without leaving the current page. For more API information, please refer to the component documentation."
  >
    <div class="gap-4 grid grid-cols-3">
      <AppCard title="Basic usage">
        <p>A basic dialog example</p>

        <template #footer>
          <PButton
            class="mx-auto"
            @click="dialogBasicApi.open()"
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
            @click="dialogInContentApi.open()"
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
            @click="dialogAutoHeightApi.open()"
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
            @click="dialogDragApi.open()"
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
              @click="dialogDynamicApi.open()"
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
            @click="openSharedModal"
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
            @click="openFormModal"
          >
            Open form dialog
          </PButton>
        </template>
      </AppCard>

      <AppCard title="Nested dialog example">
        <p>Open Dialog again in the already opened dialog</p>
        <template #footer>
          <PButton
            class="mx-auto"
            @click="dialogNestedApi.open()"
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
            @click="dialogBlurApi.open()"
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
