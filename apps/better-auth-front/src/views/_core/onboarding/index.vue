<script lang="ts" setup>
import type { AuthFormField, FormSubmitEvent } from 'pohon-ui';
import { z } from '@taman/common-ui';
import { preferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getErrors } from '#/api/errors';
import { authClient, refreshSession } from '#/auth';
import { $t } from '#/locales';

defineOptions({ name: 'OnboardingIndex' });

interface PendingInvitation {
  id: string;
  organizationName: string;
}

interface RawInvitation {
  id: string;
  organizationId: string;
  organizationName?: string;
  expiresAt: string;
}

const router = useRouter();
const accessStore = useAccessStore();
const toast = useToast();

const errorMessage = ref('');
const creating = ref(false);

const invitations = ref<Array<PendingInvitation>>([]);
const invitationsLoading = ref(true);
const acceptingId = ref<null | string>(null);

onMounted(async () => {
  try {
    const { data } = await authClient.organization.listUserInvitations();
    const now = new Date();
    invitations.value = ((data ?? []) as Array<RawInvitation>)
      .filter((invitation) => new Date(invitation.expiresAt) > now)
      .map((invitation) => ({
        id: invitation.id,
        organizationName: invitation.organizationName ?? invitation.organizationId,
      }));
  } catch {
    invitations.value = [];
  } finally {
    invitationsLoading.value = false;
  }
});

/**
 * Both acceptInvitation and createOrganization already activate the org on
 * the server side (see better-auth's organization plugin) — this only needs
 * to force a fresh session fetch and re-run route/menu generation before
 * leaving the page.
 */
async function goHome() {
  accessStore.setIsAccessChecked(false);
  await refreshSession();
  const redirect = router.currentRoute.value.query.redirect as string | undefined;
  await router.replace(redirect ? decodeURIComponent(redirect) : preferences.app.defaultHomePath);
}

async function acceptInvitation(invitation: PendingInvitation) {
  acceptingId.value = invitation.id;
  try {
    const { error } = await authClient.organization.acceptInvitation({
      invitationId: invitation.id,
    });

    if (error) {
      toast.add({
        title: $t('onboarding.invitations.acceptError'),
        description: getErrors(error),
        color: 'error',
      });
      // Stale/expired/already-handled — drop it from the list rather than
      // leaving a dead entry the user can just retry into the same error.
      invitations.value = invitations.value.filter((item) => item.id !== invitation.id);
      return;
    }

    await goHome();
  } finally {
    acceptingId.value = null;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const fields = computed<Array<AuthFormField>>(() => {
  return [
    {
      label: $t('onboarding.create.name.label'),
      placeholder: $t('onboarding.create.name.placeholder'),
      name: 'name',
      type: 'text',
      required: true,
      size: 'lg',
    },
    {
      label: $t('onboarding.create.slug.label'),
      placeholder: $t('onboarding.create.slug.placeholder'),
      hint: $t('onboarding.create.slug.hint'),
      name: 'slug',
      type: 'text',
      size: 'lg',
    },
  ];
});

const schema = computed(() => {
  return z.object({
    name: z
      .string($t('onboarding.create.name.invalid'))
      .trim()
      .min(1, $t('onboarding.create.name.invalid')),
    slug: z
      .string()
      .trim()
      .optional(),
  });
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = '';
  creating.value = true;
  try {
    const slug = payload.data.slug || slugify(payload.data.name);

    const { error } = await authClient.organization.create({
      name: payload.data.name,
      slug,
    });

    if (error) {
      errorMessage.value = error.code === authClient.$ERROR_CODES.ORGANIZATION_ALREADY_EXISTS
        ? $t('onboarding.create.slugTaken')
        : getErrors(error);
      return;
    }

    await goHome();
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <div class="text-center">
      <h1 class="text-xl font-medium">
        {{ $t('onboarding.title') }}
      </h1>
      <p class="text-muted mt-2 text-sm">
        {{ $t('onboarding.description') }}
      </p>
    </div>

    <div
      v-if="!invitationsLoading && invitations.length > 0"
      class="space-y-3"
    >
      <h2 class="text-sm font-medium">
        {{ $t('onboarding.invitations.heading') }}
      </h2>

      <PCard
        v-for="invitation in invitations"
        :key="invitation.id"
        :title="invitation.organizationName"
      >
        <template #footer>
          <PButton
            :label="$t('onboarding.invitations.accept')"
            :loading="acceptingId === invitation.id"
            block
            @click="acceptInvitation(invitation)"
          />
        </template>
      </PCard>
    </div>

    <PAuthForm
      :fields="fields"
      :schema="schema"
      :loading="creating"
      :title="$t('onboarding.create.heading')"
      :submit="{ label: $t('onboarding.create.submit') }"
      @submit="onSubmit"
    >
      <template
        v-if="errorMessage"
        #validation
      >
        <span class="text-destructive text-sm">{{ errorMessage }}</span>
      </template>
    </PAuthForm>
  </div>
</template>
