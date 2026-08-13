import type { Talent, TalentInsert } from '@ngibur/db/validation';

import { useQueryClient } from '@tanstack/vue-query';

import { useBackstageMutation, useBackstageQuery } from '#/api/backstage';

const TALENTS_URL = '/api/talents';

/** Multipart part name director reads freshly picked headshots from. */
const HEADSHOTS_FIELD = 'headshots';

export const talentQueryKeys = {
  all: () => [TALENTS_URL] as const,
};

/**
 * Values as the form holds them: `headshotUrls` mixes already-stored URLs
 * with `File`s the user just picked and hasn't uploaded yet.
 */
export type TalentFormValues = Omit<TalentInsert, 'headshotUrls'> & {
  headshotUrls?: Array<File | string>;
};

/**
 * Splits picked files out of the values and packs the rest as one JSON
 * `payload` part. Always multipart, even with no files, so there is a single
 * request shape to reason about.
 *
 * The fields stay JSON inside `payload` rather than becoming individual form
 * fields because FormData stringifies everything: `portfolio` (array of
 * objects) has no representation, `null` arrives as `"null"`, and an empty
 * array is indistinguishable from an absent one. Keeping them as JSON lets
 * director validate this body with the same zod schema it uses for a plain
 * JSON one.
 */
function toTalentBody(values: TalentFormValues): FormData {
  const items = values.headshotUrls ?? [];
  const urls = items.filter((item): item is string => typeof item === 'string');
  const payload: TalentInsert = { ...values, headshotUrls: urls };

  const form = new FormData();
  form.append('payload', JSON.stringify(payload));
  for (const item of items) {
    if (item instanceof File) {
      form.append(HEADSHOTS_FIELD, item);
    }
  }
  return form;
}

/** GET /api/talents — scoped server-side to the caller's organization. */
export function useTalentsQuery() {
  return useBackstageQuery<Array<Talent>>(TALENTS_URL, {
    queryOptions: {
      key: talentQueryKeys.all(),
    },
  });
}

/**
 * POST /api/talents. Sends one request whether or not there are images:
 * director stores them and writes the row together, so a failed upload never
 * leaves a half-created talent.
 */
export function useCreateTalentMutation() {
  const queryClient = useQueryClient();

  return useBackstageMutation<Talent, TalentFormValues>(TALENTS_URL, {
    fetchOptions: {
      method: 'POST',
    },
    mutationOptions: {
      body: toTalentBody,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: talentQueryKeys.all() });
      },
    },
  });
}
