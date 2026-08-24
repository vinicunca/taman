import { createFormBuilder, defineFieldComponents, defineTamanForm } from '@taman/common-ui';
import PInput from 'pohon-ui/components/Input.vue';
import PTextarea from 'pohon-ui/components/Textarea.vue';
import CoreUploadImages from '#/domains/core/components/core-upload-images.vue';

export {
  useTamanForm,
  type VbenFormProps,
  type VbenFormSchema,
  z,
} from '@taman-core/form-ui';

const fieldComponents = defineFieldComponents({
  Input: PInput,
  Textarea: PTextarea,
  UploadImages: CoreUploadImages,
});

export function TamanFormBuilderApp() {
  return createFormBuilder({
    components: fieldComponents,
  });
}

export type FormFieldComponents = typeof fieldComponents;

/**
 * `useTamanForm` with this app's field registry bound, so call sites name only
 * their values type: `useAppForm<TalentFormValues>({ fields })`.
 */
export const useAppForm = defineTamanForm<FormFieldComponents>();
