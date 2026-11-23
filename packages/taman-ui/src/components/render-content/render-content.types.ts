import type { Component, VNode } from 'vue';

/**
 * Anything `TamanRenderContent` can render: a plain string, a component,
 * a VNode, or a render function.
 */
export type TamanRenderContentType = (() => any) | Component | VNode | string;
