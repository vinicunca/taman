<script lang="ts" setup>
import {
  AppCard,
  AppCardAction,
  AppPage,
  TamanLoading,
} from '@taman/app-ui';
import { refAutoReset } from '@vueuse/core';

const loading = refAutoReset(false, 3000);

const loadingV = refAutoReset(false, 3000);
</script>

<template>
  <AppPage
    title="Taman Loading"
    description="A loading state component. This component adds a loading overlay to other components acting as containers. When using it, the container requires `relative` positioning."
  >
    <AppCard
      v-loading="{
        spinning: loadingV,
        icon: {
          size: 32,
        },
      }"
      title="Taman Loading"
      class="mt-4"
    >
      <template #trailingHeader>
        <AppCardAction>
          <PButton
            @click="loadingV = true"
          >
            v-loading directive
          </PButton>
        </AppCardAction>
      </template>

      <template #footer>
        The Loading component can set text and also provides an icon slot for replacing the loading icon.
      </template>

      <div class="flex gap-4">
        <div class="size-40">
          <div
            class="flex-center size-full min-h-20 relative"
          >
            <PButton
              @click="loading = true"
            >
              Default animation
            </PButton>

            <TamanLoading
              :spinning="loading"
              text="Loading..."
            />
          </div>
        </div>

        <div class="size-40">
          <div
            class="flex-center size-full min-h-20 relative"
          >
            <PButton
              @click="loading = true"
            >
              Custom animation 1
            </PButton>

            <TamanLoading
              :spinning="loading"
              text="Loading..."
              :icon="{
                name: 'svg-spinners:blocks-wave',
                size: 32,
              }"
            />
          </div>
        </div>

        <div class="size-40">
          <div
            class="flex-center size-full min-h-20 relative"
          >
            <PButton
              @click="loading = true"
            >
              Custom animation 2
            </PButton>

            <TamanLoading
              :spinning="loading"
              text="Loading..."
              :icon="{
                name: 'svg-spinners:bars-scale',
                size: 32,
              }"
            />
          </div>
        </div>
      </div>
    </AppCard>
  </AppPage>
</template>
