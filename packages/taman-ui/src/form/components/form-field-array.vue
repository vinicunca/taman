<script setup lang="ts">
import type { Sortable } from '@vinicunca/taman-core/composables';
import type { TamanFormFieldArrayRowContext } from '../form.types';
import type { TamanFormFieldArrayProps } from './form-field-array.types';
import { useSortable } from '@vinicunca/taman-core/composables';
import { get, set } from '@vinicunca/taman-core/utils';
import PButton from 'pohon-ui/components/Button.vue';
import PIcon from 'pohon-ui/components/Icon.vue';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  useId,
  useTemplateRef,
  watch,
} from 'vue';
import { TamanButtonIcon, TamanRenderContent } from '../..';
import FormRenderFormField from '../form-render/form-render-form-field.vue';
import { injectRenderFormProps } from '../form-render/form-render.context';
import { createArrayChildSchema } from '../form-render/form-render.schema';
import FormFieldArrayRowContent from './form-field-array-row-content.vue';

defineOptions({
  name: 'TamanFormFieldArray',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<TamanFormFieldArrayProps>(),
  {
    // TODO: implement i18n
    actionText: 'Action',
    addButtonProps: undefined,
    // TODO: implement i18n
    addButtonText: 'Add a row',
    createRow: undefined,
    disabled: false,
    // TODO: implement i18n
    dragHandleText: 'Drag to reorder',
    // TODO: implement i18n
    emptyText: 'No data',
    commonConfig: () => ({}),
    globalCommonConfig: () => ({}),
    max: Number.POSITIVE_INFINITY,
    min: 0,
    // TODO: implement i18n
    moveDownText: 'Move down',
    // TODO: implement i18n
    moveUpText: 'Move up',
    name: '',
    rowActions: undefined,
    rowExtra: undefined,
    rowKey: undefined,
    rowRemovable: undefined,
    schema: () => [],
    showIndex: true,
    sortable: false,
  },
);

const arrayPath = computed(() => props.name);
const formRenderProps = injectRenderFormProps();
const form = formRenderProps.form;
if (!form) {
  throw new Error('Form api is required in <TamanFormFieldArray />');
}
const formActions = form;
const arrayLength = formActions.useSelector((state) => {
  const value = get(state.values, props.name);
  return Array.isArray(value)
    ? value.length
    : 0;
});
const arrayValue = formActions.useSelector((state) => get(state.values, props.name));
const rootValuesState = formActions.useSelector((state) => state.values);
const rowKeyValues = formActions.useSelector((state) => {
  if (!props.rowKey) {
    return undefined;
  }
  const value = get(state.values, props.name);
  return Array.isArray(value)
    ? value.map((row) => get(row, props.rowKey!))
    : undefined;
});
/**
 * One Vue key per row. Without `rowKey` (or for rows lacking a usable value)
 * the key is the index, as before. Returns the previous array while the keys
 * are unchanged, so editing a row does not re-render the list.
 */
const rowKeys = computed<Array<string>>((previous) => {
  const keyValues = rowKeyValues.value;
  const seen = new Set<string>();
  const next = Array.from({ length: arrayLength.value }, (_, index) => {
    const value = keyValues?.[index];
    if (typeof value === 'string' || typeof value === 'number') {
      const key = `${arrayPath.value}-key-${value}`;
      if (!seen.has(key)) {
        seen.add(key);
        return key;
      }
    }
    return `${arrayPath.value}-${index}`;
  });
  const unchanged = previous
    && previous.length === next.length
    && previous.every((key, index) => key === next[index]);
  return unchanged
    ? previous
    : next;
});

const canAdd = computed(() => arrayLength.value < props.max);
const canRemove = computed(() => arrayLength.value > props.min);
const canReorder = computed(() => props.sortable && !props.disabled);
function actionColumnWidth() {
  if (props.rowActions) {
    return 'auto';
  }
  // Room for "Move up", "Move down" and remove.
  return props.sortable
    ? '7.5rem'
    : '4rem';
}
const gridStyle = computed(() => {
  const columns = [
    ...(props.sortable
      ? ['2.5rem']
      : []),
    ...(props.showIndex
      ? ['3rem']
      : []),
    ...props.schema.map(() => 'minmax(0, 1fr)'),
    actionColumnWidth(),
  ];
  return {
    gridTemplateColumns: columns.join(' '),
  };
});
// With `rowActions` the action column is `auto`; the rows share it through
// subgrid so every row gets the width of the widest one.
const rowsContainerStyle = computed(() => props.rowActions
  ? { display: 'grid', ...gridStyle.value }
  : undefined);
const headerStyle = computed(() => props.rowActions
  ? { gridColumn: '1 / -1', gridTemplateColumns: 'subgrid' }
  : gridStyle.value);
const rowStyle = headerStyle;
const emptyStyle = computed(() => props.rowActions
  ? { gridColumn: '1 / -1' }
  : undefined);

function buildDefaultRow(): Record<string, any> {
  if (props.createRow) {
    return props.createRow();
  }

  const row: Record<string, any> = {};
  props.schema.forEach((col) => {
    let value: any = null;
    if (Reflect.has(col, 'defaultValue') && col.defaultValue !== undefined) {
      value = col.defaultValue;
    } else if ('type' in col && col.type === 'array') {
      value = [];
    }
    set(row, col.fieldName, value);
  });
  return row;
}

function addRow() {
  if (props.disabled || !canAdd.value) {
    return;
  }
  formActions.pushFieldValue(arrayPath.value, buildDefaultRow());
}

function removeRow(index: number) {
  if (props.disabled || !canRemove.value) {
    return;
  }
  void formActions.removeFieldValue(arrayPath.value, index);
}

async function moveRow(from: number, to: number) {
  if (
    !canReorder.value
    || from === to
    || to < 0
    || to >= arrayLength.value
  ) {
    return;
  }
  await formActions.moveFieldValue(arrayPath.value, from, to);
}

/**
 * Identifies this array's rows, handle and buttons, so lookups and Sortable
 * selectors skip the ones of an array nested inside a row.
 */
const instanceId = useId();
const rowsContainer = useTemplateRef<HTMLElement>('rowsContainer');

function getRowElements() {
  return Array.from(rowsContainer.value?.children ?? []).filter(
    (element) => element.getAttribute('data-array-row') === instanceId,
  ) as Array<HTMLElement>;
}

async function moveRowBy(index: number, offset: -1 | 1) {
  const to = index + offset;
  await moveRow(index, to);
  await nextTick();
  // Without `rowKey` the focused button stays at its index while its row
  // moves away; keep focus on the moved row.
  const row = getRowElements()[to];
  const direction = offset < 0
    ? 'up'
    : 'down';
  const button
    = row?.querySelector<HTMLButtonElement>(
      `[data-array-move="${instanceId}:${direction}"]:not(:disabled)`,
    )
    ?? row?.querySelector<HTMLButtonElement>(
      `[data-array-move^="${instanceId}:"]:not(:disabled)`,
    );
  button?.focus();
}

interface DragState {
  from: number;
  item: HTMLElement;
  length: number;
  nextSibling: Node | null;
}

let sortableInstance: null | Sortable = null;
// Bumped on every setup and teardown, so an `initializeSortable()` that
// resolves after the component unmounted (or sortable was turned off) is
// destroyed instead of kept.
let sortableGeneration = 0;
let dragState: DragState | null = null;

function onSortStart(event: Sortable.SortableEvent) {
  dragState = {
    from: getRowElements().indexOf(event.item),
    item: event.item,
    length: arrayLength.value,
    nextSibling: event.item.nextSibling,
  };
}

function onSortEnd(event: Sortable.SortableEvent) {
  const state = dragState;
  dragState = null;
  const container = rowsContainer.value;
  if (!state || !container || state.item !== event.item) {
    return;
  }
  const to = getRowElements().indexOf(event.item);

  // Put the row back where Sortable took it from. Vue moves it once the value
  // changes; if the move is rejected, the DOM still matches the data.
  if (state.nextSibling === null || state.nextSibling.parentNode === container) {
    container.insertBefore(event.item, state.nextSibling);
  }

  if (state.from !== -1 && to !== -1 && state.length === arrayLength.value) {
    void moveRow(state.from, to);
  }
}

async function setupSortable(container: HTMLElement) {
  const generation = ++sortableGeneration;
  const { initializeSortable } = useSortable(container, {
    // Rows are always a vertical list, even when the container is a grid.
    direction: 'vertical',
    disabled: props.disabled,
    draggable: `[data-array-row="${instanceId}"]`,
    ghostClass: 'opacity-50',
    handle: `[data-array-drag-handle="${instanceId}"]`,
    onEnd: onSortEnd,
    onStart: onSortStart,
  });
  const instance = await initializeSortable();
  if (generation !== sortableGeneration) {
    instance?.destroy();
    return;
  }
  sortableInstance = instance ?? null;
  sortableInstance?.option('disabled', props.disabled);
}

function teardownSortable() {
  sortableGeneration += 1;
  sortableInstance?.destroy();
  sortableInstance = null;
  dragState = null;
}

watch(
  () => props.sortable && rowsContainer.value,
  (container) => {
    teardownSortable();
    if (container) {
      void setupSortable(container);
    }
  },
  { flush: 'post' },
);

watch(
  () => props.disabled,
  (disabled) => {
    sortableInstance?.option('disabled', disabled);
  },
);

onBeforeUnmount(teardownSortable);

function createRowContext(index: number): TamanFormFieldArrayRowContext {
  // Per row, so a row's dependents only re-run when that row's object changes.
  const rowValue = computed<Record<string, any>>(
    () => arrayValue.value?.[index] ?? {},
  );
  return {
    index,
    get rootValues() {
      return rootValuesState.value;
    },
    get row() {
      return rowValue.value;
    },
    rowPath: `${arrayPath.value}[${index}]`,
  };
}

const rowContexts = computed(() =>
  Array.from({ length: arrayLength.value }, (_, index) => createRowContext(index)),
);

// One computed per row, so `rowRemovable` re-runs only for the row that changed.
const removableRows = computed(() =>
  rowContexts.value.map((context) => computed(() => props.rowRemovable?.(context) ?? true)),
);

function rowSchemas(index: number) {
  return props.schema.map((col) =>
    createArrayChildSchema(col as never, {
      arrayField: arrayPath.value,
      commonConfig: props.commonConfig,
      disabled: props.disabled,
      globalCommonConfig: props.globalCommonConfig,
      index,
      rowContext: rowContexts.value[index],
    }),
  );
}

// Field components are keyed by their path (`contacts[0].name`), so a field
// moved to another index remounts under its new path: the form runtime binds
// a field to its path once.
const normalizedRowSchemas = computed(() =>
  Array.from({ length: arrayLength.value }, (_, index) => rowSchemas(index)),
);
</script>

<template>
  <div
    class="flex flex-col gap-3 w-full"
    :class="[$attrs.class]"
  >
    <div
      ref="rowsContainer"
      class="border border-border/70 rounded-md overflow-hidden"
      :style="rowsContainerStyle"
    >
      <div
        class="px-2 border-b border-border bg-background-muted/30 hidden sm:grid"
        :style="headerStyle"
      >
        <div v-if="sortable" />
        <div
          v-if="showIndex"
          class="text-sm color-text-muted font-normal px-2 py-2 text-left"
        >
          #
        </div>
        <div
          v-for="col in schema"
          :key="col.fieldName"
          class="text-sm color-text-muted font-normal px-2 py-2 text-left"
        >
          <TamanRenderContent :content="col.label" />
        </div>
        <div
          class="text-sm color-text-muted font-normal px-2 py-2 text-left"
        >
          {{ actionText }}
        </div>
      </div>

      <div
        v-for="(rowKeyValue, index) in rowKeys"
        :key="rowKeyValue"
        class="p-3 border-b border-border/60 sm:p-0 last:border-b-0 sm:grid"
        :style="rowStyle"
        :data-array-row="sortable ? instanceId : undefined"
        :data-array-row-index="index"
      >
        <div
          v-if="sortable"
          class="mb-2 flex items-center sm:mb-0 sm:py-3 sm:justify-center"
        >
          <span
            v-if="canReorder"
            aria-hidden="true"
            class="color-text-muted p-1 inline-flex cursor-grab touch-none"
            :data-array-drag-handle="instanceId"
            :title="dragHandleText"
          >
            <PIcon
              class="size-4"
              name="lucide:grip-vertical"
            />
          </span>
        </div>

        <div
          v-if="showIndex"
          class="text-sm color-text-muted mb-2 sm:mb-0 sm:px-4 sm:py-3"
        >
          <span class="sm:hidden">#</span>
          {{ index + 1 }}
        </div>

        <template
          v-for="(childSchema, childIndex) in normalizedRowSchemas[index]"
          :key="childSchema.fieldName"
        >
          <div class="py-2 flex flex-col gap-1 min-w-0 sm:px-2">
            <div
              class="text-xs color-text-muted font-medium sm:hidden"
            >
              <TamanRenderContent :content="schema?.[childIndex]?.label" />
            </div>
            <FormRenderFormField
              v-bind="childSchema"
              :class="childSchema.formItemClass"
            />
          </div>
        </template>

        <div
          v-if="sortable"
          class="pt-1 flex gap-1 justify-end sm:px-2 sm:py-3 sm:justify-start"
        >
          <FormFieldArrayRowContent
            v-if="rowActions"
            class="flex gap-1 items-center"
            data-array-row-actions
            :context="rowContexts[index]!"
            :render="rowActions"
          />
          <template v-if="canReorder">
            <TamanButtonIcon
              :aria-label="moveUpText"
              :data-array-move="`${instanceId}:up`"
              :disabled="index === 0"
              icon="lucide:arrow-up"
              @click="moveRowBy(index, -1)"
            />
            <TamanButtonIcon
              :aria-label="moveDownText"
              :data-array-move="`${instanceId}:down`"
              :disabled="index === arrayLength - 1"
              icon="lucide:arrow-down"
              @click="moveRowBy(index, 1)"
            />
          </template>
          <TamanButtonIcon
            v-if="removableRows[index]?.value ?? true"
            data-array-remove
            :disabled="disabled || !canRemove"
            icon="lucide:x"
            @click="removeRow(index)"
          />
        </div>
        <div
          v-else
          class="pt-1 flex justify-end sm:px-2 sm:py-3"
          :class="rowActions ? 'gap-1 sm:justify-start' : 'sm:block'"
        >
          <FormFieldArrayRowContent
            v-if="rowActions"
            class="flex gap-1 items-center"
            data-array-row-actions
            :context="rowContexts[index]!"
            :render="rowActions"
          />
          <TamanButtonIcon
            v-if="removableRows[index]?.value ?? true"
            data-array-remove
            :disabled="disabled || !canRemove"
            icon="lucide:x"
            @click="removeRow(index)"
          />
        </div>

        <FormFieldArrayRowContent
          v-if="rowExtra"
          class="pb-3 sm:px-2"
          style="grid-column: 1 / -1"
          data-array-row-extra
          :context="rowContexts[index]!"
          :render="rowExtra"
        />
      </div>

      <div
        v-if="arrayLength === 0"
        class="text-sm color-text-muted py-6 text-center"
        :style="emptyStyle"
      >
        {{ emptyText }}
      </div>
    </div>

    <PButton
      variant="outline"
      size="sm"
      class="border-dashed"
      :class="[addButtonProps?.block !== false && 'w-full']"
      icon="lucide:plus"
      v-bind="addButtonProps"
      :disabled="disabled || !canAdd || Boolean(addButtonProps?.disabled)"
      @click="addRow"
    >
      {{ addButtonText }}
    </PButton>
  </div>
</template>
