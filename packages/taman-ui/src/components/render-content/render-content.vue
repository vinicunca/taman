<script lang="ts">
import type { PropType } from 'vue';
import type { TamanRenderContentType } from './render-content.types';

import { isFunction, isPlainObject, isString } from '@vinicunca/taman-core/utils';
import { defineComponent, h, isVNode } from 'vue';

export default defineComponent({
  name: 'TamanRenderContent',

  props: {
    content: {
      default: undefined,
      type: [Object, String, Function] as PropType<TamanRenderContentType>,
    },
    renderBr: {
      default: false,
      type: Boolean,
    },
  },

  setup(props, { attrs, slots }) {
    return () => {
      const content = props.content;

      if (!content) {
        return null;
      }

      if (isString(content)) {
        if (!props.renderBr) {
          return content;
        }
        return content
          .split('\n')
          .map((line, i) => h('p', { key: i }, line));
      }

      // `h()` clones a VNode passed as its type (merging attrs), so the same
      // VNode can safely be rendered in several places.
      if (isVNode(content) || isPlainObject(content) || isFunction(content)) {
        return h(content as never, attrs, slots);
      }

      return content;
    };
  },
});
</script>
