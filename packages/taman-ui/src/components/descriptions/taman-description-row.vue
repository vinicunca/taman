<script lang="ts" setup>
import type { CSSProperties } from 'vue';
import type { TamanDescriptionsSize, TamanInternalDescriptionsItem } from './taman-description.types';

import TamanDescriptionCell from './taman-description-cell.vue';

interface Props {
  bordered?: boolean;
  colon?: boolean;
  contentStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  row: Array<TamanInternalDescriptionsItem>;
  size?: TamanDescriptionsSize;
  vertical?: boolean;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    bordered: false,
    colon: true,
    size: 'middle',
    vertical: false,
  },
);

function mergeStyle(
  base?: CSSProperties,
  override?: CSSProperties,
): CSSProperties | undefined {
  if (!base && !override) {
    return undefined;
  }

  return { ...base, ...override };
}
</script>

<template>
  <!-- Vertical layout: label on its own line, content on its own line -->
  <template v-if="props.vertical">
    <tr>
      <TamanDescriptionCell
        v-for="(item, index) in props.row"
        :key="`label-${item.key ?? index}`"
        tag="th"
        type="label"
        :span="item.span ?? 1"
        :bordered="props.bordered"
        :colon="props.colon"
        :size="props.size"
        :label="item.label ?? null"
        :item-class="item.class"
        :label-style="mergeStyle(props.labelStyle, item.labelStyle)"
      />
    </tr>
    <tr>
      <TamanDescriptionCell
        v-for="(item, index) in props.row"
        :key="`content-${item.key ?? index}`"
        tag="td"
        type="content"
        :span="item.span ?? 1"
        :bordered="props.bordered"
        :size="props.size"
        :content="item.content ?? null"
        :item-class="item.class"
        :content-style="mergeStyle(props.contentStyle, item.contentStyle)"
      />
    </tr>
  </template>

  <!-- Horizontal + Border: Each item split into label (th) and content (td) -->
  <tr v-else-if="props.bordered">
    <template
      v-for="(item, index) in props.row"
      :key="item.key ?? index"
    >
      <TamanDescriptionCell
        tag="th"
        type="label"
        :span="1"
        :bordered="true"
        :size="props.size"
        :label="item.label ?? null"
        :item-class="item.class"
        :label-style="mergeStyle(props.labelStyle, item.labelStyle)"
      />
      <TamanDescriptionCell
        tag="td"
        type="content"
        :span="(item.span ?? 1) * 2 - 1"
        :bordered="true"
        :size="props.size"
        :content="item.content ?? null"
        :content-style="mergeStyle(props.contentStyle, item.contentStyle)"
      />
    </template>
  </tr>

  <!-- Horizontal + Non-bordered: Each item has one cell, label and content in the same column -->
  <tr v-else>
    <TamanDescriptionCell
      v-for="(item, index) in props.row"
      :key="item.key ?? index"
      tag="td"
      type="item"
      :span="item.span ?? 1"
      :colon="props.colon"
      :size="props.size"
      :label="item.label ?? null"
      :content="item.content ?? null"
      :item-class="item.class"
      :label-style="mergeStyle(props.labelStyle, item.labelStyle)"
      :content-style="mergeStyle(props.contentStyle, item.contentStyle)"
    />
  </tr>
</template>
