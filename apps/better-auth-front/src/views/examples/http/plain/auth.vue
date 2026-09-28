<script setup lang="ts">
import { AppCard, AppPage, useTamanToast } from '@taman/app-ui';
import { errorMessageInterceptor } from '@vinicunca/request/http';
import { onUnmounted, ref } from 'vue';
import { createAuthDemo } from '../shared/auth-demo';
import HttpEventLog from '../shared/http-event-log.vue';

const { toaster } = useTamanToast();
const demo = createAuthDemo();
const removeErrorInterceptor = demo.client.addResponseInterceptor(
  errorMessageInterceptor({ notify: (message) => toaster.error(message) }),
);
onUnmounted(removeErrorInterceptor);

const busy = ref(false);

async function withBusy(action: () => Promise<void>) {
  busy.value = true;
  try {
    await action();
  } catch {
    // Already surfaced through `errorMessageInterceptor` above.
  } finally {
    busy.value = false;
  }
}

const onLogin = () => withBusy(() => demo.login());
const onFetchMe = () => withBusy(() => demo.fetchMe());
</script>

<template>
  <AppPage
    title="HTTP client · plain request · auth &amp; interceptors"
    description="A request interceptor attaches the bearer token; `refreshTokenInterceptor` refreshes it once on a 401 and retries."
  >
    <div class="gap-4 grid lg:grid-cols-[22rem_1fr]">
      <AppCard title="Session">
        <div class="flex flex-col gap-3">
          <div
            v-if="demo.session.user"
            class="text-sm flex gap-3 items-center"
          >
            <img
              :src="demo.session.user.image"
              :alt="demo.session.user.username"
              class="rounded-full size-10"
            >
            <div>
              <p class="font-medium">
                {{ demo.session.user.firstName }} {{ demo.session.user.lastName }}
              </p>
              <p class="text-muted">
                {{ demo.session.user.email }}
              </p>
            </div>
          </div>
          <p
            v-else
            class="text-muted text-sm"
          >
            Not signed in.
          </p>
          <div class="flex flex-wrap gap-2">
            <PButton
              :loading="busy"
              @click="onLogin"
            >
              Log in (emilys)
            </PButton>
            <PButton
              variant="outline"
              :disabled="!demo.session.accessToken"
              :loading="busy"
              @click="onFetchMe"
            >
              Fetch /auth/me
            </PButton>
            <PButton
              variant="outline"
              :disabled="!demo.session.accessToken"
              @click="demo.expireAccessToken"
            >
              Expire access token
            </PButton>
            <PButton
              variant="outline"
              :disabled="!demo.session.refreshToken"
              @click="demo.breakRefreshToken"
            >
              Break refresh token
            </PButton>
            <PButton
              color="neutral"
              variant="ghost"
              :disabled="!demo.session.accessToken"
              @click="demo.logout"
            >
              Log out
            </PButton>
          </div>
        </div>
      </AppCard>
      <AppCard title="Event log">
        <HttpEventLog :entries="demo.log.value" />
      </AppCard>
    </div>
  </AppPage>
</template>
