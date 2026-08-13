/**
 * Shared base components for forms, modals, drawers, etc.
 * Extracted from adapter/form so they can be reused elsewhere.
 */

/* eslint-disable vue/one-component-per-file */

import type {
  AutoCompleteProps,
  ButtonProps,
  CascaderProps,
  CheckboxGroupProps,
  CheckboxProps,
  DatePickerProps,
  DividerProps,
  InputNumberProps,
  InputProps,
  MentionsProps,
  RadioGroupProps,
  RadioProps,
  RangePickerProps,
  RateProps,
  SelectProps,
  SpaceProps,
  SwitchProps,
  TextAreaProps,
  TimePickerProps,
  TreeSelectProps,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from 'antdv-next';

import type { Component, Ref } from 'vue';

import type {
  ApiComponentSharedProps,
  BaseFormComponentType,
  CollapsibleParamsProps,
  IconPickerProps,
} from '@taman/common-ui';
import type { Sortable } from '@taman/composables';
import type { TipTapProps } from '@vben/plugins/tiptap';
import type { Recordable } from '@taman/types';

import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  render,
  unref,
  watch,
} from 'vue';

import {
  ApiComponent,
  globalShareState,
  IconPicker,
  VbenCollapsibleParams,
  VCropper,
} from '@taman/common-ui';
import { useSortable } from '@taman/composables';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@taman/locales';
import { VbenTiptap } from '@vben/plugins/tiptap';
import { isEmpty } from '@taman/utils';

import { message, Modal, notification } from 'antdv-next';

import { upload_file } from '#/api/examples/upload';
type AdapterUploadProps = UploadProps & {
  aspectRatio?: string;
  crop?: boolean;
  draggable?: boolean;
  handleChange?: (event: UploadChangeParam) => void;
  maxSize?: number;
  onDragSort?: (oldIndex: number, newIndex: number) => void;
  onHandleChange?: (event: UploadChangeParam) => void;
};

const AutoComplete = defineAsyncComponent(
  () => import('antdv-next/dist/auto-complete/index'),
);
const Button = defineAsyncComponent(
  () => import('antdv-next/dist/button/index'),
);
const Checkbox = defineAsyncComponent(
  () => import('antdv-next/dist/checkbox/index'),
);
const CheckboxGroup = defineAsyncComponent(() =>
  import('antdv-next/dist/checkbox/index').then((res) => res.CheckboxGroup),
);
const DatePicker = defineAsyncComponent(
  () => import('antdv-next/dist/date-picker/index'),
);
const Divider = defineAsyncComponent(
  () => import('antdv-next/dist/divider/index'),
);
const Input = defineAsyncComponent(() => import('antdv-next/dist/input/index'));
const InputNumber = defineAsyncComponent(
  () => import('antdv-next/dist/input-number/index'),
);
const InputPassword = defineAsyncComponent(() =>
  import('antdv-next/dist/input/index').then((res) => res.InputPassword),
);
const Mentions = defineAsyncComponent(
  () => import('antdv-next/dist/mentions/index'),
);
const Radio = defineAsyncComponent(() => import('antdv-next/dist/radio/index'));
const RadioGroup = defineAsyncComponent(() =>
  import('antdv-next/dist/radio/index').then((res) => res.RadioGroup),
);
const RangePicker = defineAsyncComponent(() =>
  import('antdv-next/dist/date-picker/index').then(
    (res) => res.DateRangePicker,
  ),
);
const Rate = defineAsyncComponent(() => import('antdv-next/dist/rate/index'));
const Select = defineAsyncComponent(
  () => import('antdv-next/dist/select/index'),
);
const Space = defineAsyncComponent(() => import('antdv-next/dist/space/index'));
const Switch = defineAsyncComponent(
  () => import('antdv-next/dist/switch/index'),
);
const Textarea = defineAsyncComponent(
  () => import('antdv-next/dist/input/TextArea'),
);
const TimePicker = defineAsyncComponent(
  () => import('antdv-next/dist/time-picker/index'),
);
const TreeSelect = defineAsyncComponent(
  () => import('antdv-next/dist/tree-select/index'),
);
const Cascader = defineAsyncComponent(
  () => import('antdv-next/dist/cascader/index'),
);
const Upload = defineAsyncComponent(
  () => import('antdv-next/dist/upload/index'),
);
const Image = defineAsyncComponent(() => import('antdv-next/dist/image/index'));
const PreviewGroup = defineAsyncComponent(() =>
  import('antdv-next/dist/image/index').then((res) => res.ImagePreviewGroup),
);

const withDefaultPlaceholder = (
  component: Component,
  type: 'input' | 'select',
  componentProps: Recordable<any> = {},
) => {
  return defineComponent({
    name: component.name,
    inheritAttrs: false,
    setup: (props: any, { attrs, expose, slots }) => {
      const placeholder =
        props?.placeholder ||
        attrs?.placeholder ||
        $t(`ui.placeholder.${type}`);
      // Expose inner component methods
      const innerRef = ref();
      expose(
        new Proxy(
          {},
          {
            get: (_target, key) => innerRef.value?.[key],
            has: (_target, key) => key in (innerRef.value || {}),
          },
        ),
      );
      return () =>
        h(
          component,
          { ...componentProps, placeholder, ...props, ...attrs, ref: innerRef },
          slots,
        );
    },
  });
};

const IMAGE_EXTENSIONS = new Set([
  'bmp',
  'gif',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
]);

/**
 * Whether the upload file is an image.
 */
function isImageFile(file: UploadFile): boolean {
  if (file.url) {
    try {
      const pathname = new URL(file.url, 'http://localhost').pathname;
      const ext = pathname.split('.').pop()?.toLowerCase();
      return ext ? IMAGE_EXTENSIONS.has(ext) : false;
    } catch {
      const ext = file.url?.split('.').pop()?.toLowerCase();
      return ext ? IMAGE_EXTENSIONS.has(ext) : false;
    }
  }
  if (!file.type) {
    const ext = file.name?.split('.').pop()?.toLowerCase();
    return ext ? IMAGE_EXTENSIONS.has(ext) : false;
  }
  return file.type.startsWith('image/');
}

/**
 * Default upload button slot.
 */
function createDefaultUploadSlots(listType: string, placeholder: string) {
  if (listType === 'picture-card') {
    return { default: () => placeholder };
  }
  return {
    default: () =>
      h(
        Button,
        {
          icon: h(IconifyIcon, {
            icon: 'ant-design:upload-outlined',
            class: 'mb-1 size-4',
          }),
        },
        () => placeholder,
      ),
  };
}

/**
 * Read a file as Base64.
 */
function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', reject);
  });
}

/**
 * Preview an uploaded image.
 */
async function previewImage(
  file: UploadFile,
  open: Ref<boolean>,
  fileList: Ref<UploadProps['fileList']>,
) {
  // Non-images: open URL directly
  if (!isImageFile(file)) {
    const url = file.url || file.preview;
    if (url) {
      window.open(url, '_blank');
    } else if (file.preview) {
      window.open(file.preview, '_blank');
    } else {
      message.error($t('ui.formRules.previewWarning'));
    }
    return;
  }

  const [ImageComponent, PreviewGroupComponent] = await Promise.all([
    Image,
    PreviewGroup,
  ]);

  // Collect image files for preview
  const imageFiles = (unref(fileList) || []).filter((f) => isImageFile(f));

  for (const imgFile of imageFiles) {
    if (!imgFile.url && !imgFile.preview && imgFile.originFileObj) {
      imgFile.preview = await getBase64(imgFile.originFileObj);
    }
  }

  const container = document.createElement('div');
  document.body.append(container);
  let isUnmounted = false;

  const currentIndex = imageFiles.findIndex((f) => f.uid === file.uid);

  const PreviewWrapper = {
    setup() {
      return () => {
        if (isUnmounted) return null;
        return h(
          PreviewGroupComponent,
          {
            class: 'hidden',
            preview: {
              open: open.value,
              current: currentIndex,
              onOpenChange: (value: boolean) => {
                open.value = value;
                if (!value) {
                  setTimeout(() => {
                    if (!isUnmounted && container) {
                      isUnmounted = true;
                      render(null, container);
                      container.remove();
                    }
                  }, 300);
                }
              },
            },
          },
          () =>
            imageFiles.map((imgFile) =>
              h(ImageComponent, {
                key: imgFile.uid,
                src: imgFile.url || imgFile.preview,
              }),
            ),
        );
      };
    },
  };

  render(h(PreviewWrapper), container);
}

/**
 * Crop an image before upload.
 */
function cropImage(file: File, aspectRatio: string | undefined) {
  return new Promise<Blob | string | undefined>((resolve, reject) => {
    const container = document.createElement('div');
    document.body.append(container);

    let isUnmounted = false;
    let objectUrl: null | string = null;

    const open = ref<boolean>(true);
    const cropperRef = ref<InstanceType<typeof VCropper> | null>(null);

    function closeModal() {
      open.value = false;
      setTimeout(() => {
        if (!isUnmounted && container) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          isUnmounted = true;
          render(null, container);
          container.remove();
        }
      }, 300);
    }

    const CropperWrapper = {
      setup() {
        return () => {
          if (isUnmounted) return null;
          if (!objectUrl) {
            objectUrl = URL.createObjectURL(file);
          }
          return h(
            Modal,
            {
              open: open.value,
              title: h('div', {}, [
                $t('ui.crop.title'),
                h(
                  'span',
                  {
                    class: `${aspectRatio ? '' : 'hidden'} ml-2 text-sm text-gray-400 font-normal`,
                  },
                  $t('ui.crop.titleTip', [aspectRatio]),
                ),
              ]),
              centered: true,
              width: 548,
              keyboard: false,
              maskClosable: false,
              closable: false,
              cancelText: $t('common.cancel'),
              okText: $t('ui.crop.confirm'),
              destroyOnHidden: true,
              onOk: async () => {
                const cropper = cropperRef.value;
                if (!cropper) {
                  reject(new Error('Cropper not found'));
                  closeModal();
                  return;
                }
                try {
                  const dataUrl = await cropper.getCropImage();
                  if (dataUrl) {
                    resolve(dataUrl);
                  } else {
                    reject(new Error($t('ui.crop.errorTip')));
                  }
                } catch {
                  reject(new Error($t('ui.crop.errorTip')));
                } finally {
                  closeModal();
                }
              },
              onCancel() {
                resolve('');
                closeModal();
              },
            },
            () =>
              h(VCropper, {
                ref: (ref: any) => (cropperRef.value = ref),
                img: objectUrl as string,
                aspectRatio,
              }),
          );
        };
      },
    };

    render(h(CropperWrapper), container);
  });
}

/**
 * Upload component with preview support.
 */
function withPreviewUpload() {
  return defineComponent({
    name: Upload.name,
    emits: ['update:modelValue'],
    setup(
      props: any,
      { attrs, slots, emit }: { attrs: any; emit: any; slots: any },
    ) {
      const previewVisible = ref<boolean>(false);
      const placeholder = attrs?.placeholder || $t('ui.placeholder.upload');
      const listType = attrs?.listType || attrs?.['list-type'] || 'text';
      const fileList = ref<UploadProps['fileList']>(
        attrs?.fileList || attrs?.['file-list'] || [],
      );

      const maxSize = computed(() => attrs?.maxSize ?? attrs?.['max-size']);
      const aspectRatio = computed(
        () => attrs?.aspectRatio ?? attrs?.['aspect-ratio'],
      );

      async function handleBeforeUpload(
        file: UploadFile,
        originFileList: Array<File>,
      ) {
        // File size limit
        if (maxSize.value && (file.size || 0) / 1024 / 1024 > maxSize.value) {
          message.error($t('ui.formRules.sizeLimit', [maxSize.value]));
          file.status = 'removed';
          return false;
        }

        // Image crop before upload
        if (
          attrs.crop &&
          !attrs.multiple &&
          originFileList[0] &&
          isImageFile(file)
        ) {
          file.status = 'removed';
          const blob = await cropImage(originFileList[0], aspectRatio.value);
          if (!blob) {
            throw new Error($t('ui.crop.errorTip'));
          }
          return blob;
        }

        return attrs.beforeUpload?.(file) ?? true;
      }

      function handleChange(event: UploadChangeParam) {
        try {
          attrs.handleChange?.(event);
          attrs.onHandleChange?.(event);
        } catch (error) {
          console.error(error);
        }
        fileList.value = event.fileList.filter(
          (file) => file.status !== 'removed',
        );
        emit(
          'update:modelValue',
          event.fileList?.length ? fileList.value : undefined,
        );
      }

      function handlePreview(file: UploadFile) {
        previewVisible.value = true;
        return previewImage(file, previewVisible, fileList);
      }

      function renderUploadButton() {
        if (attrs.disabled) return null;
        return isEmpty(slots)
          ? createDefaultUploadSlots(listType, placeholder)
          : slots;
      }

      // Drag-and-drop reorder
      const draggable = computed(
        () => (attrs.draggable ?? false) && !attrs.disabled,
      );
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const sortableInstance = ref<null | Sortable>(null);

      const styleId = `upload-drag-style-${uploadId}`;

      function injectDragStyle() {
        if (!document.querySelector(`[id="${styleId}"]`)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            [data-upload-id="${uploadId}"] .ant-upload-list-item { cursor: move; }
            [data-upload-id="${uploadId}"] .ant-upload-list-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
          `;
          document.head.append(style);
        }
      }

      function removeDragStyle() {
        document.querySelector(`[id="${styleId}"]`)?.remove();
      }

      async function initSortable(retryCount = 0) {
        if (!draggable.value) return;

        injectDragStyle();
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const container = document.querySelector(
          `[data-upload-id="${uploadId}"] .ant-upload-list`,
        ) as HTMLElement;

        if (!container) {
          if (retryCount < 5) {
            setTimeout(() => initSortable(retryCount + 1), 200);
          }
          return;
        }

        const { initializeSortable } = useSortable(container, {
          animation: 300,
          delay: 400,
          delayOnTouchOnly: true,
          filter:
            '.ant-upload-select, .ant-upload-list-item-error, .ant-upload-list-item-uploading',
          onEnd: (evt) => {
            const { oldIndex, newIndex } = evt;
            if (
              oldIndex === undefined ||
              newIndex === undefined ||
              oldIndex === newIndex
            ) {
              return;
            }

            const list = [...(fileList.value || [])];
            const [movedItem] = list.splice(oldIndex, 1);
            if (movedItem) {
              list.splice(newIndex, 0, movedItem);
              fileList.value = list;
            }

            attrs.onDragSort?.(oldIndex, newIndex);
            emit('update:modelValue', fileList.value);
          },
        });

        sortableInstance.value = await initializeSortable();
      }

      // Sync with external modelValue
      watch(
        () => attrs.modelValue,
        (res) => {
          fileList.value = res;
        },
      );

      onMounted(initSortable);
      onUnmounted(() => {
        sortableInstance.value?.destroy();
        removeDragStyle();
      });

      return () =>
        h(
          'div',
          { 'data-upload-id': uploadId, class: 'w-full' },
          h(
            Upload,
            {
              ...props,
              ...attrs,
              fileList: fileList.value,
              beforeUpload: handleBeforeUpload,
              onChange: handleChange,
              onPreview: handlePreview,
            },
            renderUploadButton() as any,
          ),
        );
    },
  });
}

// Register components used by the form schema; extend per your UI library
export type ComponentType =
  | 'ApiCascader'
  | 'ApiSelect'
  | 'ApiTreeSelect'
  | 'AutoComplete'
  | 'Cascader'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'CollapsibleParams'
  | 'DatePicker'
  | 'DefaultButton'
  | 'Divider'
  | 'IconPicker'
  | 'Input'
  | 'InputNumber'
  | 'InputPassword'
  | 'Mentions'
  | 'PrimaryButton'
  | 'Radio'
  | 'RadioGroup'
  | 'RangePicker'
  | 'Rate'
  | 'RichEditor'
  | 'Select'
  | 'Space'
  | 'Switch'
  | 'Textarea'
  | 'TimePicker'
  | 'TreeSelect'
  | 'Upload'
  | BaseFormComponentType;

/**
 * Maps to {@link ComponentType} for schema `component` + `componentProps` typing.
 */
export interface ComponentPropsMap {
  ApiCascader: ApiComponentSharedProps & CascaderProps;
  ApiSelect: ApiComponentSharedProps & SelectProps;
  ApiTreeSelect: ApiComponentSharedProps & TreeSelectProps;
  AutoComplete: AutoCompleteProps;
  Cascader: CascaderProps;
  Checkbox: CheckboxProps;
  CheckboxGroup: CheckboxGroupProps;
  CollapsibleParams: CollapsibleParamsProps;
  DatePicker: DatePickerProps;
  DefaultButton: ButtonProps;
  Divider: DividerProps;
  IconPicker: IconPickerProps;
  Input: InputProps;
  InputNumber: InputNumberProps;
  InputPassword: InputProps;
  Mentions: MentionsProps;
  PrimaryButton: ButtonProps;
  Radio: RadioProps;
  RadioGroup: RadioGroupProps;
  RangePicker: RangePickerProps;
  Rate: RateProps;
  RichEditor: TipTapProps;
  Select: SelectProps;
  Space: SpaceProps;
  Switch: SwitchProps;
  Textarea: TextAreaProps;
  TimePicker: TimePickerProps;
  TreeSelect: TreeSelectProps;
  Upload: AdapterUploadProps;
}

async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    // Use async import for large components
    // Button: () =>
    // import('xxx').then((res) => res.Button),

    ApiCascader: withDefaultPlaceholder(ApiComponent, 'select', {
      component: Cascader,
      fieldNames: { label: 'label', value: 'value', children: 'children' },
      loadingSlot: 'suffixIcon',
      modelPropName: 'value',
      visibleEvent: 'onOpenChange',
    }),
    ApiSelect: withDefaultPlaceholder(ApiComponent, 'select', {
      component: Select,
      loadingSlot: 'suffixIcon',
      modelPropName: 'value',
      visibleEvent: 'onOpenChange',
    }),
    ApiTreeSelect: withDefaultPlaceholder(ApiComponent, 'select', {
      component: TreeSelect,
      fieldNames: { label: 'label', value: 'value', children: 'children' },
      loadingSlot: 'suffixIcon',
      modelPropName: 'value',
      optionsPropName: 'treeData',
      visibleEvent: 'onOpenChange',
    }),
    AutoComplete,
    Cascader,
    Checkbox,
    CheckboxGroup,
    DatePicker,
    // Custom default button
    DefaultButton: (props, { attrs, slots }) => {
      return h(Button, { ...props, attrs, type: 'default' }, slots);
    },
    Divider,
    IconPicker: withDefaultPlaceholder(IconPicker, 'select', {
      iconSlot: 'addonAfter',
      inputComponent: Input,
      modelValueProp: 'value',
    }),
    Input: withDefaultPlaceholder(Input, 'input'),
    InputNumber: withDefaultPlaceholder(InputNumber, 'input', {
      style: { width: '100%' },
    }),
    InputPassword: withDefaultPlaceholder(InputPassword, 'input'),
    Mentions: withDefaultPlaceholder(Mentions, 'input'),
    // Custom primary button
    PrimaryButton: (props, { attrs, slots }) => {
      return h(Button, { ...props, attrs, type: 'primary' }, slots);
    },
    Radio,
    RadioGroup,
    RangePicker,
    Rate,
    RichEditor: withDefaultPlaceholder(VbenTiptap, 'input', {
      imageUpload: {
        upload: (file: any, onProgress: any) => {
          return new Promise((resolve, reject) => {
            upload_file({
              file,
              onProgress({ percent }) {
                onProgress?.(percent);
              },
              onSuccess(response) {
                // Extract image URL from upload response
                resolve(response?.data?.url ?? response?.url ?? '');
              },
              onError() {
                reject(new Error($t('ui.tiptap.upload.uploadFailed')));
              },
            });
          });
        },
      },
    }),
    Select: withDefaultPlaceholder(Select, 'select'),
    Space,
    Switch,
    Textarea: withDefaultPlaceholder(Textarea, 'input'),
    TimePicker,
    TreeSelect: withDefaultPlaceholder(TreeSelect, 'select'),
    Upload: withPreviewUpload(),
    CollapsibleParams: VbenCollapsibleParams,
  };

  // Register components in global shared state
  globalShareState.setComponents(components);

  // Global message handlers
  globalShareState.defineMessage({
    // Preferences copy success notification
    copyPreferencesSuccess: (title, content) => {
      notification.success({
        description: content,
        title,
        placement: 'bottomRight',
      });
    },
  });
}

export { initComponentAdapter };
