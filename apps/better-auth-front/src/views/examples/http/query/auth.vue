<script setup lang="ts">
import type { DummyUser } from '../shared/auth-demo';
import { AppCard, AppPage, useTamanToast } from '@taman/app-ui';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { errorMessageInterceptor } from '@vinicunca/request/http';
import { createHttpQueryUtils } from '@vinicunca/request/http-query';
import { computed, onUnmounted, ref, watch } from 'vue';
import { createAuthDemo } from '../shared/auth-demo';
import HttpEventLog from '../shared/http-event-log.vue';

const { toaster } = useTamanToast();
const queryClient = useQueryClient();
const demo = createAuthDemo();
const removeErrorInterceptor = demo.client.addResponseInterceptor(
  errorMessageInterceptor({ notify: (message) => toaster.error(message) }),
);
onUnmounted(removeErrorInterceptor);

const meApi = createHttpQueryUtils(demo.client, { key: ['dummyjson-auth'] });

const me = useQuery(computed(() => ({
  ...meApi.get<DummyUser>('/auth/me').queryOptions(),
  enabled: Boolean(demo.session.accessToken),
  retry: false,
})));

// A disabled query keeps its last `data` around, so without the session
// check a stale user would keep showing after `logout()` or a failed
// refresh (`onAuthFailure` clears the session but doesn't touch this
// cache). Drop the cached `/auth/me` entry too, so a later login can't
// briefly flash the previous session's user before its own fetch lands.
const user = computed(() => (demo.session.accessToken ? (me.data.value ?? demo.session.user) : undefined));

watch(() => demo.session.accessToken, (token) => {
  if (!token) {
    queryClient.removeQueries({ queryKey: meApi.key() });
  }
});

const busy = ref(false);
async function onLogin() {
  busy.value = true;
  try {
    await demo.login();
  } catch {
    // Already surfaced through `errorMessageInterceptor` above.
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <AppPage
    title="HTTP client · Vue Query · auth &amp; interceptors"
    description="`/auth/me` as a query (`enabled` on a token, `retry: false`) using the same request + refresh interceptors as the plain demo."
  >
    <div class="gap-4 grid lg:grid-cols-[22rem_1fr]">
      <AppCard title="Session">
        <div class="flex flex-col gap-3">
          <div
            v-if="user"
            class="text-sm flex gap-3 items-center"
          >
            <img
              :src="user.image"
              :alt="user.username"
              class="rounded-full size-10"
            >
            <div>
              <p class="font-medium">
                {{ user.firstName }} {{ user.lastName }}
              </p>
              <p class="text-muted">
                {{ user.email }}
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
              :loading="me.isFetching.value"
              @click="me.refetch()"
            >
              Refetch /auth/me
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
