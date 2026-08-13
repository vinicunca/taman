/**
 * @copy https://github.com/element-plus/element-plus/blob/dev/packages/hooks/use-draggable/index.ts
 * Adjusted for local modal behavior
 */

import type { ComputedRef, Ref } from 'vue';
import { unrefElement } from '@vueuse/core';
import { onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue';

export function useDialogDraggable(
  {
    targetRef,
    dragRef,
    draggable,
    containerSelector,
    centered,
    isOverflow,
  }: {
    targetRef: Ref<HTMLElement | undefined>;
    dragRef: Ref<HTMLElement | undefined>;
    draggable: ComputedRef<boolean>;
    containerSelector?: ComputedRef<string | undefined>;
    centered?: ComputedRef<boolean>;
    isOverflow?: ComputedRef<boolean>;
  },
) {
  const transform = reactive({
    offsetX: 0,
    offsetY: 0,
  });

  const dragging = ref(false);

  function onMousedown(event: MouseEvent) {
    const downX = event.clientX;
    const downY = event.clientY;

    if (!targetRef.value) {
      return;
    }

    const targetRect = targetRef.value.getBoundingClientRect();
    const { offsetX, offsetY } = transform;
    const targetLeft = targetRect.left;
    const targetTop = targetRect.top;
    const targetWidth = targetRect.width;
    const targetHeight = targetRect.height;

    let containerRect: DOMRect | null = null;

    if (containerSelector?.value) {
      const container = document.querySelector(containerSelector.value);
      if (container) {
        containerRect = container.getBoundingClientRect();
      }
    }

    let maxLeft, maxTop, minLeft, minTop;
    if (containerRect) {
      minLeft = containerRect.left - targetLeft + offsetX;
      maxLeft = containerRect.right - targetLeft - targetWidth + offsetX;
      minTop = containerRect.top - targetTop + offsetY;
      maxTop = containerRect.bottom - targetTop - targetHeight + offsetY;
    } else {
      const docElement = document.documentElement;
      const clientWidth = docElement.clientWidth;
      const clientHeight = docElement.clientHeight;
      minLeft = -targetLeft + offsetX;
      minTop = -targetTop + offsetY;
      maxLeft = clientWidth - targetLeft - targetWidth + offsetX;
      maxTop = clientHeight - targetTop - targetHeight + offsetY;
    }

    const onMousemove = (e: MouseEvent) => {
      let moveX = offsetX + e.clientX - downX;
      let moveY = offsetY + e.clientY - downY;

      if (!isOverflow?.value) {
        moveX = Math.min(Math.max(moveX, minLeft), maxLeft);
        moveY = Math.min(Math.max(moveY, minTop), maxTop);
      }

      transform.offsetX = moveX;
      transform.offsetY = moveY;

      if (targetRef.value) {
        const isCentered = centered?.value;
        targetRef.value.style.transform = isCentered
          ? `translate(${moveX}px, calc(-50% + ${moveY}px))`
          : `translate(${moveX}px, ${moveY}px)`;
        dragging.value = true;
      }
    };

    const onMouseup = () => {
      dragging.value = false;
      document.removeEventListener('mousemove', onMousemove);
      document.removeEventListener('mouseup', onMouseup);
    };

    document.addEventListener('mousemove', onMousemove);
    document.addEventListener('mouseup', onMouseup);
  }

  function onDraggable() {
    const dragDom = unrefElement(dragRef);
    if (dragDom && targetRef.value) {
      dragDom.addEventListener('mousedown', onMousedown);
    }
  }

  function offDraggable() {
    const dragDom = unrefElement(dragRef);
    if (dragDom && targetRef.value) {
      dragDom.removeEventListener('mousedown', onMousedown);
    }
  }

  function resetPosition() {
    transform.offsetX = 0;
    transform.offsetY = 0;

    const target = unrefElement(targetRef);
    if (target) {
      target.style.transform = '';
    }
  }

  onMounted(() => {
    watchEffect(() => {
      if (draggable.value) {
        onDraggable();
      } else {
        offDraggable();
      }
    });
  });

  onBeforeUnmount(() => {
    offDraggable();
  });

  return {
    dragging,
    resetPosition,
    transform,
  };
}
