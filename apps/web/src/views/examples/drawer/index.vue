<script lang="ts" setup>
import type { DrawerPlacement, DrawerState } from '@taman/app-ui';

import type { ExplicitDrawerData } from './typed-data-contract';

import { AppCard, AppPage, useTamanDrawer } from '@taman/app-ui';

import AutoHeightDemo from './auto-height-demo.vue';
import BaseDemo from './base-demo.vue';
import DynamicDemo from './dynamic-demo.vue';
import FormDrawerDemo from './form-drawer-demo.vue';
import inContentDemo from './in-content-demo.vue';
import SharedDataDemo from './shared-data-demo.vue';
import TypedDataAutoDemo from './typed-data-auto-demo.vue';
import { useFactoryDrawer } from './typed-data-contract';
import TypedDataExplicitDemo from './typed-data-explicit-demo.vue';
import TypedDataFactoryDemo from './typed-data-factory-demo.vue';

const [BaseDrawer, baseDrawerApi] = useTamanDrawer({ connectedComponent: BaseDemo });
const [InContentDrawer, inContentDrawerApi] = useTamanDrawer({ connectedComponent: inContentDemo });
const [AutoHeightDrawer, autoHeightDrawerApi] = useTamanDrawer({ connectedComponent: AutoHeightDemo });
const [DynamicDrawer, dynamicDrawerApi] = useTamanDrawer({ connectedComponent: DynamicDemo });
const [SharedDataDrawer, sharedDrawerApi] = useTamanDrawer({ connectedComponent: SharedDataDemo });
const [FormDrawer, formDrawerApi] = useTamanDrawer({ connectedComponent: FormDrawerDemo });
const [TypedDataAutoDrawer, typedDataAutoDrawerApi] = useTamanDrawer({ connectedComponent: TypedDataAutoDemo });
const [TypedDataExplicitDrawer, typedDataExplicitDrawerApi] = useTamanDrawer<ExplicitDrawerData>({ connectedComponent: TypedDataExplicitDemo });
const [TypedDataFactoryDrawer, typedDataFactoryDrawerApi] = useFactoryDrawer({ connectedComponent: TypedDataFactoryDemo });

function openBaseDrawer(placement: DrawerPlacement = 'right') {
  baseDrawerApi.setState({ placement }).open();
}

function openBlurDrawer() {
  baseDrawerApi.setState({ overlayBlur: 5 }).open();
}

function openInContentDrawer(placement: DrawerPlacement = 'right') {
  const state: Partial<DrawerState> = { class: '', placement };
  if (placement === 'top') {
    // Top page area z-index is 200; use a lower value so the drawer slides in correctly from the top
    state.zIndex = 199;
  }
  inContentDrawerApi.setState(state).open();
}

function openMaxContentDrawer() {
  // This is just for demonstration purposes. In practice, you can simply write these configuration in the Drawer's properties.
  inContentDrawerApi.setState({ class: 'w-full', placement: 'right' }).open();
}

function openAutoHeightDrawer() {
  autoHeightDrawerApi.open();
}

function openDynamicDrawer() {
  dynamicDrawerApi.open();
}

function handleUpdateTitle() {
  dynamicDrawerApi.setState({ title: 'External dynamic title' }).open();
}

function openSharedDrawer() {
  sharedDrawerApi
    .setData({
      content: 'External passed data content',
      payload: 'External passed data payload',
    })
    .open();
}

function openFormDrawer() {
  formDrawerApi
    .setData({
      // Form values
      values: { field1: 'abc', field2: '123' },
    })
    .open();
}

function openTypedDataAutoDrawer() {
  typedDataAutoDrawerApi
    .setData({
      message: 'External does not need to declare a generic, it is automatically inferred by the connected component.',
      method: 'Automatic inference',
    })
    .open();
}

function openTypedDataExplicitDrawer() {
  typedDataExplicitDrawerApi
    .setData({
      message: 'Parent and child components explicitly reference the same data type.',
      method: 'Explicit generic',
    })
    .open();
}

function openTypedDataFactoryDrawer() {
  typedDataFactoryDrawerApi
    .setData({
      message: 'Parent and child components reuse pre-bound typed composable.',
      method: 'Contract factory',
    })
    .open();
}
</script>

<template>
  <AppPage
    auto-content-height
    description="Drawer components are typically used to display a cover layer on the current page, to display important information or provide user interaction interfaces."
    title="Drawer component examples"
  >
    <BaseDrawer />
    <InContentDrawer />
    <AutoHeightDrawer />
    <DynamicDrawer />
    <SharedDataDrawer />
    <FormDrawer />
    <TypedDataAutoDrawer />
    <TypedDataExplicitDrawer />
    <TypedDataFactoryDrawer />

    <AppCard
      class="mb-4"
      title="Basic usage"
    >
      <p class="mb-3">
        A basic drawer example
      </p>
      <PButton
        class="mb-2"
        @click="openBaseDrawer('right')"
      >
        Open on the right
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openBaseDrawer('bottom')"
      >
        Open on the bottom
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openBaseDrawer('left')"
      >
        Open on the left
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openBaseDrawer('top')"
      >
        Open on the top
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openBlurDrawer"
      >
        Blur effect on the overlay
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Open in content area"
    >
      <p class="mb-3">
        Specify the drawer to open in the content area, without covering the top and left menu areas
      </p>
      <PButton
        class="mb-2"
        @click="openInContentDrawer('right')"
      >
        Open on the right
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openInContentDrawer('bottom')"
      >
        Open on the bottom
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openInContentDrawer('left')"
      >
        Open on the left
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openInContentDrawer('top')"
      >
        Open on the top
      </PButton>
      <PButton
        class="mb-2 ml-2"
        @click="openMaxContentDrawer"
      >
        Open in full screen content area
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Content height adaptive scrolling"
    >
      <p class="mb-3">
        The height is automatically calculated based on the content
      </p>
      <PButton
        @click="openAutoHeightDrawer"
      >
        Open the drawer
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Dynamic configuration example"
    >
      <p class="mb-3">
        Dynamically adjust the drawer data through setState
      </p>
      <PButton
        @click="openDynamicDrawer"
      >
        Open the drawer
      </PButton>
      <PButton
        class="ml-2"
        @click="handleUpdateTitle"
      >
        Modify the title from the outside and open
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Shared data example"
    >
      <p class="mb-3">
        Data interaction through shared sharedData
      </p>
      <PButton
        @click="openSharedDrawer"
      >
        Open the drawer and pass data
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Form drawer example"
    >
      <p class="mb-3">
        Open the drawer and set the form schema and data
      </p>
      <PButton
        @click="openFormDrawer"
      >
        Open the drawer and set the form schema and data
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Shared data: automatic inference"
    >
      <p class="mb-3">
        Child components expose API, parent components infer the type from the connected component
      </p>
      <PButton
        @click="openTypedDataAutoDrawer"
      >
        Open the automatic inference example
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Shared data: explicit generic"
    >
      <p class="mb-3">
        When automatic inference is not possible, parent and child components explicitly reference the same data type
      </p>
      <PButton
        @click="openTypedDataExplicitDrawer"
      >
        Open the explicit generic example
      </PButton>
    </AppCard>

    <AppCard
      class="mb-4"
      title="Shared data: contract factory"
    >
      <p class="mb-3">
        Pre-bind the type and reuse the typed composable through createTamanDrawer
      </p>
      <PButton
        @click="openTypedDataFactoryDrawer"
      >
        Open the contract factory example
      </PButton>
    </AppCard>
  </AppPage>
</template>
