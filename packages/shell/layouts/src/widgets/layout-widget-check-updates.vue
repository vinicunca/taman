<script lang="ts" setup>
import { useTamanDialog } from '@taman-core/popup-ui';
import { $t } from '@taman/locales';
import { onMounted, onUnmounted, ref } from 'vue';

defineOptions({ name: 'LayoutWidgetCheckUpdates' });

const props = withDefaults(
  defineProps<{
    checkUpdatesInterval?: number;
    checkUpdateUrl?: string;
  }>(),
  {
    checkUpdatesInterval: 1,
    checkUpdateUrl: import.meta.env.BASE_URL || '/',
  },
);

let isCheckingUpdates = false;
const currentVersionTag = ref('');
const lastVersionTag = ref('');
const timer = ref<ReturnType<typeof setInterval>>();

const [DialogUpdate, dialogUpdateApi] = useTamanDialog({
  closable: false,
  closeOnPressEscape: false,
  closeOnClickModal: false,
  onConfirm() {
    lastVersionTag.value = currentVersionTag.value;
    window.location.reload();
  },
});

async function getVersionTag() {
  try {
    if (
      location.hostname === 'localhost'
      || location.hostname === '127.0.0.1'
    ) {
      return null;
    }
    const response = await fetch(props.checkUpdateUrl, {
      cache: 'no-cache',
      method: 'HEAD',
      redirect: 'manual',
    });

    return (
      response.headers.get('etag') || response.headers.get('last-modified')
    );
  } catch {
    console.error('Failed to fetch version tag');
    return null;
  }
}

async function checkForUpdates() {
  const versionTag = await getVersionTag();
  if (!versionTag) {
    return;
  }

  // Skip notice on first run (establish baseline version)
  if (!lastVersionTag.value) {
    lastVersionTag.value = versionTag;
    return;
  }

  if (lastVersionTag.value !== versionTag && versionTag) {
    clearInterval(timer.value);
    handleNotice(versionTag);
  }
}
function handleNotice(versionTag: string) {
  currentVersionTag.value = versionTag;
  dialogUpdateApi.open();
}

function start() {
  if (props.checkUpdatesInterval <= 0) {
    return;
  }

  // Poll every checkUpdatesInterval minutes (default: 1)
  timer.value = setInterval(
    checkForUpdates,
    props.checkUpdatesInterval * 60 * 1000,
  );
}

function handleVisibilitychange() {
  if (document.hidden) {
    stop();
  } else {
    if (!isCheckingUpdates) {
      isCheckingUpdates = true;
      checkForUpdates().finally(() => {
        isCheckingUpdates = false;
        start();
      });
    }
  }
}

function stop() {
  clearInterval(timer.value);
}

onMounted(() => {
  start();
  document.addEventListener('visibilitychange', handleVisibilitychange);
});

onUnmounted(() => {
  stop();
  document.removeEventListener('visibilitychange', handleVisibilitychange);
});
</script>

<template>
  <DialogUpdate
    :cancel-text="$t('common.cancel')"
    :confirm-text="$t('common.refresh')"
    :fullscreen-button="false"
    :title="$t('ui.widgets.checkUpdatesTitle')"
    centered
    content-class="px-8 min-h-10"
    footer-class="border-none mb-3 mr-3"
    header-class="border-none"
  >
    {{ $t('ui.widgets.checkUpdatesDescription') }}
  </DialogUpdate>
</template>
