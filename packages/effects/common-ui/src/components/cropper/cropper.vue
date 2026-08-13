<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

// Component props
const props = defineProps<{
  /** Aspect ratio, e.g. '1:1', '16:9', '3:4' (optional) */
  aspectRatio?: string;
  /** Container height (default 400) */
  height?: number;
  /** Image URL */
  img: string;
  /** Container width (default 500) */
  width?: number;
}>();

const CROPPER_CONSTANTS = {
  MIN_WIDTH: 60 as const,
  MIN_HEIGHT: 60 as const,
  DEFAULT_WIDTH: 500 as const,
  DEFAULT_HEIGHT: 400 as const,
  PADDING_RATIO: 0.1 as const,
  MAX_PADDING: 50 as const,
} as const;

type Point = [number, number]; // [clientX, clientY]
type Dimension = [number, number, number, number]; // [top, right, bottom, left]

// Drag handle types
type DragAction
  = | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'move'
    | 'right'
    | 'top'
    | 'top-left'
    | 'top-right';

// DOM refs
const containerRef = ref<HTMLDivElement | null>(null);
const bgImageRef = ref<HTMLImageElement | null>(null);
// const maskRef = ref<HTMLDivElement | null>(null);
const maskViewRef = ref<HTMLDivElement | null>(null);
const cropperRef = ref<HTMLDivElement | null>(null);
// const cropperViewRef = ref<HTMLDivElement | null>(null);

// Reactive state
const isCropperVisible = ref<boolean>(false);
const validAspectRatio = ref<null | number>(null); // Valid ratio (null = free aspect)
const containerWidth = ref<number>(
  props.width ?? CROPPER_CONSTANTS.DEFAULT_WIDTH,
);
const containerHeight = ref<number>(
  props.height ?? CROPPER_CONSTANTS.DEFAULT_HEIGHT,
);

// Crop inset [top, right, bottom, left]
const currentDimension = ref<Dimension>([50, 50, 50, 50]);
const initDimension = ref<Dimension>([50, 50, 50, 50]);

// Drag state
const dragging = ref<boolean>(false);
const startPoint = ref<Point>([0, 0]);
const startDimension = ref<Dimension>([0, 0, 0, 0]);
const direction = ref<Dimension>([0, 0, 0, 0]);
const moving = ref<boolean>(false);

/**
 * Fit image inside container without upscaling
 */
function calculateImageFitSize() {
  if (!bgImageRef.value) {
    return;
  }

  // Natural image dimensions
  const imgWidth = bgImageRef.value.naturalWidth;
  const imgHeight = bgImageRef.value.naturalHeight;

  if (imgWidth === 0 || imgHeight === 0) {
    return;
  }

  // Scale to fit width/height props (default 500/400)
  const widthRatio
    = (props.width ?? CROPPER_CONSTANTS.DEFAULT_WIDTH) / imgWidth;
  const heightRatio
    = (props.height ?? CROPPER_CONSTANTS.DEFAULT_HEIGHT) / imgHeight;
  const scaleRatio = Math.min(widthRatio, heightRatio, 1); // Shrink only, never upscale

  // Fitted container size
  const fitWidth = Math.floor(imgWidth * scaleRatio);
  const fitHeight = Math.floor(imgHeight * scaleRatio);

  containerWidth.value = fitWidth;
  containerHeight.value = fitHeight;

  // Reset crop box padding for new container
  const padding = Math.min(
    CROPPER_CONSTANTS.MAX_PADDING,
    Math.floor(fitWidth * CROPPER_CONSTANTS.PADDING_RATIO),
    Math.floor(fitHeight * CROPPER_CONSTANTS.PADDING_RATIO),
  );

  initDimension.value = [padding, padding, padding, padding];
  currentDimension.value = [padding, padding, padding, padding];
}

/**
 * Parse and validate aspect ratio string
 * @returns {number|null} width/height ratio, or null if invalid
 */
function parseAndValidateAspectRatio(): null | number {
  // No aspect ratio prop
  if (!props.aspectRatio) {
    return null;
  }

  // Validate format
  const ratioRegex = /^[1-9]\d*:[1-9]\d*$/;
  if (!ratioRegex.test(props.aspectRatio)) {
    console.warn('裁剪比例格式错误，应为 "数字:数字" 格式，如 "16:9"');
    return null;
  }

  // Parse ratio
  const [width, height] = props.aspectRatio.split(':').map(Number);

  // Validate parsed values
  if (Number.isNaN(width) || Number.isNaN(height) || !width || !height) {
    console.warn('裁剪比例解析失败，宽高必须为正整数');
    return null;
  }

  return width / height;
}

/**
 * Apply crop inset
 * @param {Dimension} dimension - [top, right, bottom, left]
 */
function setDimension(dimension: Dimension) {
  currentDimension.value = [...dimension];
  if (maskViewRef.value) {
    maskViewRef.value.style.clipPath = `inset(${dimension[0]}px ${dimension[1]}px ${dimension[2]}px ${dimension[3]}px)`;
  }
}

/**
 * Resize crop box to aspect ratio
 */
function adjustCropperToAspectRatio() {
  if (!cropperRef.value) {
    return;
  }

  // Parse aspect ratio
  validAspectRatio.value = parseAndValidateAspectRatio();

  // Free aspect: use initial inset
  if (validAspectRatio.value === null) {
    setDimension(initDimension.value);
    return;
  }

  // Fixed aspect: resize crop box
  const ratio = validAspectRatio.value;
  const containerWidthVal = containerWidth.value;
  const containerHeightVal = containerHeight.value;

  // Compute crop box from ratio
  let newHeight: number, newWidth: number;

  // Prefer width
  newWidth = containerWidthVal;
  newHeight = newWidth / ratio;

  // Fall back to height if too tall
  if (newHeight > containerHeightVal) {
    newHeight = containerHeightVal;
    newWidth = newHeight * ratio;
  }

  // Center crop box
  const leftRight = (containerWidthVal - newWidth) / 2;
  const topBottom = (containerHeightVal - newHeight) / 2;

  const newDimension: Dimension = [topBottom, leftRight, topBottom, leftRight];

  setDimension(newDimension);
}

/**
 * Initialize cropper UI
 */
function createCropper() {
  // Fit image to container
  calculateImageFitSize();

  isCropperVisible.value = true;
  adjustCropperToAspectRatio();
}

/**
 * Mouse down handler
 * @param {MouseEvent} e - mouse event
 * @param {DragAction} action - drag action
 */
function handleMouseDown(e: MouseEvent, action: DragAction) {
  dragging.value = true;
  startPoint.value = [e.clientX, e.clientY];
  startDimension.value = [...currentDimension.value];
  direction.value = [0, 0, 0, 0];
  moving.value = false;

  // Move crop box
  if (action === 'move') {
    direction.value[0] = 1;
    direction.value[2] = -1;
    direction.value[3] = 1;
    direction.value[1] = -1;
    moving.value = true;
    return;
  }

  // Resize handles
  switch (action) {
    case 'bottom': {
      direction.value[2] = -1;
      break;
    }
    case 'bottom-left': {
      direction.value[2] = -1;
      direction.value[3] = 1;
      break;
    }
    case 'bottom-right': {
      direction.value[2] = -1;
      direction.value[1] = -1;
      break;
    }
    case 'left': {
      direction.value[3] = 1;
      break;
    }
    case 'right': {
      direction.value[1] = -1;
      break;
    }
    case 'top': {
      direction.value[0] = 1;
      break;
    }
    case 'top-left': {
      direction.value[0] = 1;
      direction.value[3] = 1;
      break;
    }
    case 'top-right': {
      direction.value[0] = 1;
      direction.value[1] = -1;
      break;
    }
  }
}

/**
 * Mouse move handler
 * @param {MouseEvent} e - mouse event
 */
function handleMouseMove(e: MouseEvent) {
  if (!dragging.value || !cropperRef.value) {
    return;
  }

  const { clientX, clientY } = e;
  const diffX = clientX - startPoint.value[0];
  const diffY = clientY - startPoint.value[1];

  // Move crop box
  if (moving.value) {
    handleMoveCropBox(diffX, diffY);
    return;
  }

  // Free aspect resize
  if (validAspectRatio.value === null) {
    handleFreeAspectResize(diffX, diffY);
  } else {
    handleFixedAspectResize(diffX, diffY);
  }
}

function handleMoveCropBox(diffX: number, diffY: number) {
  const newDimension = [...startDimension.value] as Dimension;

  // Proposed position after drag
  const tempTop = startDimension.value[0] + diffY;
  const tempLeft = startDimension.value[3] + diffX;

  // Fixed crop box size while moving
  const cropWidth
    = containerWidth.value - startDimension.value[3] - startDimension.value[1];
  const cropHeight
    = containerHeight.value - startDimension.value[0] - startDimension.value[2];

  // Clamp position; keep crop size unchanged
  // Top: top >= 0 and bottom inset >= 0
  newDimension[0] = Math.max(
    0,
    Math.min(tempTop, containerHeight.value - cropHeight),
  );
  // Bottom derived from top and crop height
  newDimension[2] = containerHeight.value - newDimension[0] - cropHeight;
  // Left: left >= 0 and right inset >= 0
  newDimension[3] = Math.max(
    0,
    Math.min(tempLeft, containerWidth.value - cropWidth),
  );
  // Right derived from left and crop width
  newDimension[1] = containerWidth.value - newDimension[3] - cropWidth;

  // Ensure size unchanged (safety)
  const finalWidth = containerWidth.value - newDimension[3] - newDimension[1];
  const finalHeight = containerHeight.value - newDimension[0] - newDimension[2];

  if (finalWidth !== cropWidth) {
    newDimension[1] = containerWidth.value - newDimension[3] - cropWidth;
  }

  if (finalHeight !== cropHeight) {
    newDimension[2] = containerHeight.value - newDimension[0] - cropHeight;
  }

  // Update position only
  setDimension(newDimension);
}

function handleFreeAspectResize(diffX: number, diffY: number) {
  const cropperWidth = containerWidth.value;
  const cropperHeight = containerHeight.value;
  const currentDimensionNew: Dimension = [0, 0, 0, 0];

  // New inset with minimum size
  currentDimensionNew[0] = Math.min(
    Math.max(startDimension.value[0] + direction.value[0] * diffY, 0),
    cropperHeight - CROPPER_CONSTANTS.MIN_HEIGHT,
  );

  currentDimensionNew[1] = Math.min(
    Math.max(startDimension.value[1] + direction.value[1] * diffX, 0),
    cropperWidth - CROPPER_CONSTANTS.MIN_WIDTH,
  );

  currentDimensionNew[2] = Math.min(
    Math.max(startDimension.value[2] + direction.value[2] * diffY, 0),
    cropperHeight - CROPPER_CONSTANTS.MIN_HEIGHT,
  );

  currentDimensionNew[3] = Math.min(
    Math.max(startDimension.value[3] + direction.value[3] * diffX, 0),
    cropperWidth - CROPPER_CONSTANTS.MIN_WIDTH,
  );

  // Enforce minimum crop width/height
  const newWidth
    = cropperWidth - currentDimensionNew[3] - currentDimensionNew[1];
  const newHeight
    = cropperHeight - currentDimensionNew[0] - currentDimensionNew[2];

  if (newWidth < CROPPER_CONSTANTS.MIN_WIDTH) {
    if (direction.value[3] === 1) {
      currentDimensionNew[3]
        = cropperWidth - currentDimensionNew[1] - CROPPER_CONSTANTS.MIN_WIDTH;
    } else {
      currentDimensionNew[1]
        = cropperWidth - currentDimensionNew[3] - CROPPER_CONSTANTS.MIN_WIDTH;
    }
  }

  if (newHeight < CROPPER_CONSTANTS.MIN_HEIGHT) {
    if (direction.value[0] === 1) {
      currentDimensionNew[0]
        = cropperHeight - currentDimensionNew[2] - CROPPER_CONSTANTS.MIN_HEIGHT;
    } else {
      currentDimensionNew[2]
        = cropperHeight - currentDimensionNew[0] - CROPPER_CONSTANTS.MIN_HEIGHT;
    }
  }

  setDimension(currentDimensionNew);
}

function handleFixedAspectResize(diffX: number, diffY: number) {
  if (validAspectRatio.value === null) {
    return;
  }
  const cropperWidth = containerWidth.value;
  const cropperHeight = containerHeight.value;
  // Fixed aspect ratio resize
  const ratio = validAspectRatio.value;
  const currentWidth
    = cropperWidth - startDimension.value[3] - startDimension.value[1];
  const currentHeight
    = cropperHeight - startDimension.value[0] - startDimension.value[2];

  let newHeight: number, newWidth: number;
  let widthChange = 0;
  let heightChange = 0;

  // Width/height delta from drag
  if (direction.value[3] === 1) {
    widthChange = -diffX;
  } else if (direction.value[1] === -1) {
    widthChange = diffX;
  }

  if (direction.value[0] === 1) {
    heightChange = -diffY;
  } else if (direction.value[2] === -1) {
    heightChange = diffY;
  }

  const isCornerDrag
    = (direction.value[3] === 1 || direction.value[1] === -1)
      && (direction.value[0] === 1 || direction.value[2] === -1);

  // New crop dimensions
  if (isCornerDrag) {
    if (Math.abs(widthChange) > Math.abs(heightChange)) {
      newWidth = Math.max(
        CROPPER_CONSTANTS.MIN_WIDTH,
        currentWidth + widthChange,
      );
      newHeight = newWidth / ratio;
    } else {
      newHeight = Math.max(
        CROPPER_CONSTANTS.MIN_HEIGHT,
        currentHeight + heightChange,
      );
      newWidth = newHeight * ratio;
    }
  } else {
    if (direction.value[3] === 1 || direction.value[1] === -1) {
      newWidth = Math.max(
        CROPPER_CONSTANTS.MIN_WIDTH,
        currentWidth + widthChange,
      );
      newHeight = newWidth / ratio;
    } else {
      newHeight = Math.max(
        CROPPER_CONSTANTS.MIN_HEIGHT,
        currentHeight + heightChange,
      );
      newWidth = newHeight * ratio;
    }
  }

  // Clamp to container
  const maxWidth = cropperWidth;
  const maxHeight = cropperHeight;

  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / ratio;
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * ratio;
  }

  // New inset values
  let newLeft = startDimension.value[3];
  let newTop = startDimension.value[0];
  let newRight = startDimension.value[1];
  let newBottom = startDimension.value[2];

  // Adjust position by handle
  if (direction.value[3] === 1) {
    newLeft = cropperWidth - newWidth - startDimension.value[1];
  } else if (direction.value[1] === -1) {
    newRight = cropperWidth - newWidth - startDimension.value[3];
  } else if (!isCornerDrag) {
    // Center on axis
    const currentHorizontalCenter = startDimension.value[3] + currentWidth / 2;
    newLeft = Math.max(
      0,
      Math.min(cropperWidth - newWidth, currentHorizontalCenter - newWidth / 2),
    );
    newRight = cropperWidth - newWidth - newLeft;
  }

  if (direction.value[0] === 1) {
    newTop = cropperHeight - newHeight - startDimension.value[2];
  } else if (direction.value[2] === -1) {
    newBottom = cropperHeight - newHeight - startDimension.value[0];
  } else if (!isCornerDrag) {
    // Center on axis
    const currentVerticalCenter = startDimension.value[0] + currentHeight / 2;
    newTop = Math.max(
      0,
      Math.min(
        cropperHeight - newHeight,
        currentVerticalCenter - newHeight / 2,
      ),
    );
    newBottom = cropperHeight - newHeight - newTop;
  }

  // Clamp insets to >= 0
  newLeft = Math.max(0, newLeft);
  newTop = Math.max(0, newTop);
  newRight = Math.max(0, newRight);
  newBottom = Math.max(0, newBottom);

  const newDimension: Dimension = [newTop, newRight, newBottom, newLeft];
  setDimension(newDimension);
}

/**
 * Mouse up handler
 */
function handleMouseUp() {
  dragging.value = false;
  moving.value = false;
  direction.value = [0, 0, 0, 0];
}

/**
 * Image load handler
 */
function handleImageLoad() {
  createCropper();
}

/**
 * Export cropped image
 * @param {'image/jpeg' | 'image/png'} format - output format
 * @param {number} quality - compression quality (0-1)
 * @param {'blob' | 'base64'} outputType - output encoding
 * @param {number} targetWidth - output width (optional)
 * @param {number} targetHeight - output height (optional)
 */
async function getCropImage(format: 'image/jpeg' | 'image/png' = 'image/png', quality: number = 0.92, outputType: 'base64' | 'blob' = 'blob', targetWidth?: number, targetHeight?: number): Promise<Blob | string | undefined> {
  if (!props.img || !bgImageRef.value || !containerRef.value) {
    return;
  }

  // Clamp quality to [0, 1]
  const validQuality = Math.max(0, Math.min(1, quality));

  // Load image for natural dimensions
  const tempImg = new Image();
  // CORS for cross-origin HTTP(S) images
  if (props.img.startsWith('http://') || props.img.startsWith('https://')) {
    try {
      const url = new URL(props.img);
      if (url.origin !== location.origin) {
        tempImg.crossOrigin = 'anonymous';
      }
    } catch {
      // Invalid URL: skip CORS, continue
    }
  }

  // Wait for image load
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      tempImg.removeEventListener('load', handleLoad);
      tempImg.removeEventListener('error', handleError);
      reject(new Error('图片加载超时，超时时间10秒'));
    }, 10_000);
    const handleLoad = () => {
      clearTimeout(timeout);
      tempImg.removeEventListener('load', handleLoad);
      tempImg.removeEventListener('error', handleError);
      resolve();
    };

    const handleError = (err: ErrorEvent) => {
      clearTimeout(timeout);
      tempImg.removeEventListener('load', handleLoad);
      tempImg.removeEventListener('error', handleError);
      reject(new Error(`图片加载失败: ${err.message}`));
    };

    tempImg.addEventListener('load', handleLoad);
    tempImg.addEventListener('error', handleError);
    tempImg.src = props.img;
  });

  const containerRect = containerRef.value.getBoundingClientRect();
  const imgRect = bgImageRef.value.getBoundingClientRect();

  // 1. Rendered image layout in container
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  const renderedImgWidth = imgRect.width;
  const renderedImgHeight = imgRect.height;
  const imgOffsetX = (containerWidth - renderedImgWidth) / 2;
  const imgOffsetY = (containerHeight - renderedImgHeight) / 2;

  // 2. Crop box geometry in container
  const [cropTop, cropRight, cropBottom, cropLeft] = currentDimension.value;
  const cropBoxWidth = containerWidth - cropLeft - cropRight;
  const cropBoxHeight = containerHeight - cropTop - cropBottom;

  // 3. Map crop box to image coordinates (offset)
  const cropOnImgX = cropLeft - imgOffsetX;
  const cropOnImgY = cropTop - imgOffsetY;

  // 4. Scale from rendered size to natural pixels
  const scaleX = tempImg.width / renderedImgWidth;
  const scaleY = tempImg.height / renderedImgHeight;

  // 5. Crop region in natural image pixels
  const originalCropX = Math.max(0, Math.floor(cropOnImgX * scaleX));
  const originalCropY = Math.max(0, Math.floor(cropOnImgY * scaleY));
  const originalCropWidth = Math.min(
    Math.floor(cropBoxWidth * scaleX),
    tempImg.width - originalCropX,
  );
  const originalCropHeight = Math.min(
    Math.floor(cropBoxHeight * scaleY),
    tempImg.height - originalCropY,
  );

  // Abort if crop region is empty
  if (originalCropWidth <= 0 || originalCropHeight <= 0) {
    return;
  }

  // 6. Device pixel ratio for sharp output
  const dpr = window.devicePixelRatio || 1;

  // Output canvas size (target or natural crop)
  const finalWidth = targetWidth ? Math.max(1, targetWidth) : originalCropWidth;
  const finalHeight = targetHeight
    ? Math.max(1, targetHeight)
    : originalCropHeight;

  // Create canvas and context
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Physical canvas size (DPR)
  canvas.width = finalWidth * dpr;
  canvas.height = finalHeight * dpr;

  // CSS display size
  canvas.style.width = `${finalWidth}px`;
  canvas.style.height = `${finalHeight}px`;

  // Scale context for DPR
  ctx.scale(dpr, dpr);

  // 7. Draw cropped region at full resolution
  ctx.drawImage(
    tempImg,
    originalCropX, // Source X in natural image
    originalCropY, // Source Y in natural image
    originalCropWidth, // Source width
    originalCropHeight, // Source height
    0, // Destination X
    0, // Destination Y
    finalWidth, // Destination width
    finalHeight, // Destination height
  );

  try {
    return outputType === 'base64'
      ? canvas.toDataURL(format, validQuality)
      : new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => {
              // Fallback empty Blob if toBlob returns null
              resolve(blob || new Blob([], { type: format }));
            },
            format,
            validQuality,
          );
        });
  } catch (error) {
    console.error('图片导出失败:', error);
  }
}

// Re-fit crop box when aspect ratio changes
watch(() => props.aspectRatio, adjustCropperToAspectRatio);

// Recompute layout when width/height change
watch([() => props.width, () => props.height], () => {
  calculateImageFitSize();
  adjustCropperToAspectRatio();
});

// Register document listeners on mount
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  // Image already cached: init cropper
  if (
    bgImageRef.value
    && bgImageRef.value.complete
    && bgImageRef.value.naturalWidth > 0
  ) {
    createCropper();
  }
});

// Remove listeners on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});

defineExpose({ getCropImage });
</script>

<template>
  <div
    :style="{
      width: `${width || CROPPER_CONSTANTS.DEFAULT_WIDTH}px`,
      height: `${height || CROPPER_CONSTANTS.DEFAULT_HEIGHT}px`,
    }"
    class="cropper-action-wrapper"
  >
    <div
      ref="containerRef"
      class="cropper-container"
      :style="{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }"
    >
      <!-- Source image (fitted) -->
      <img
        ref="bgImageRef"
        class="cropper-image"
        :src="img"
        :style="{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }"
        alt="裁剪原图"
        @load="handleImageLoad"
      >

      <!-- Mask overlay -->
      <div
        class="cropper-mask"
        :style="{
          display: isCropperVisible ? 'block' : 'none',
          width: '100%',
          height: '100%',
        }"
      >
        <div
          ref="maskViewRef"
          class="cropper-mask-view"
          :style="{
            backgroundImage: `url(${img})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            clipPath: `inset(${currentDimension[0]}px ${currentDimension[1]}px ${currentDimension[2]}px ${currentDimension[3]}px)`,
            width: '100%',
            height: '100%',
          }"
        />
      </div>

      <!-- Crop box -->
      <div
        ref="cropperRef"
        class="cropper-box"
        :style="{
          display: isCropperVisible ? 'block' : 'none',
          width: '100%',
          height: '100%',
        }"
      >
        <div
          class="cropper-view"
          :style="{
            inset: `${currentDimension[0]}px ${currentDimension[1]}px ${currentDimension[2]}px ${currentDimension[3]}px`,
          }"
        >
          <!-- Crop guide lines -->
          <span class="cropper-dashed-h" />
          <span class="cropper-dashed-v" />

          <!-- Crop box move handle -->
          <span
            class="cropper-move-area"
            @mousedown="handleMouseDown($event, 'move')"
          />

          <!-- Edge resize lines -->
          <span class="cropper-line-e" />
          <span class="cropper-line-n" />
          <span class="cropper-line-w" />
          <span class="cropper-line-s" />

          <!-- Corner handles -->
          <span
            class="cropper-point cropper-point-ne"
            @mousedown="handleMouseDown($event, 'top-right')"
          >
            <span class="cropper-point-inner" />
          </span>
          <span
            class="cropper-point cropper-point-nw"
            @mousedown="handleMouseDown($event, 'top-left')"
          >
            <span class="cropper-point-inner" />
          </span>
          <span
            class="cropper-point cropper-point-sw"
            @mousedown="handleMouseDown($event, 'bottom-left')"
          >
            <span class="cropper-point-inner" />
          </span>
          <span
            class="cropper-point cropper-point-se"
            @mousedown="handleMouseDown($event, 'bottom-right')"
          >
            <span class="cropper-point-inner" />
          </span>

          <!-- Edge midpoint handles -->
          <span
            class="cropper-point cropper-point-e"
            @mousedown="handleMouseDown($event, 'right')"
          >
            <span class="cropper-point-inner" />
          </span>
          <span
            class="cropper-point cropper-point-n"
            @mousedown="handleMouseDown($event, 'top')"
          >
            <span class="cropper-point-inner" />
          </span>
          <span
            class="cropper-point cropper-point-w"
            @mousedown="handleMouseDown($event, 'left')"
          >
            <span class="cropper-point-inner" />
          </span>
          <span
            class="cropper-point cropper-point-s"
            @mousedown="handleMouseDown($event, 'bottom')"
          >
            <span class="cropper-point-inner" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cropper-action-wrapper {
  @apply box-border flex items-center justify-center;

  background-color: transparent;

  /* Checkerboard background */
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0;
  background-size: 20px 20px;
}

.cropper-container {
  @apply relative;
}

.cropper-image {
  @apply block;
}

/* Mask overlay */
.cropper-mask {
  @apply absolute top-0 left-0 bg-black/50;
}

.cropper-mask-view {
  @apply absolute top-0 left-0;
}

/* Crop box */
.cropper-box {
  @apply absolute top-0 left-0 z-10;
}

.cropper-view {
  @apply absolute top-0 right-0 bottom-0 left-0 outline-1 outline-blue-500 select-none;
}

/* Crop guide lines */
.cropper-dashed-h {
  @apply absolute top-1/3 left-0 block h-1/3 w-full border-t border-b border-dashed border-gray-200/50;
}

.cropper-dashed-v {
  @apply absolute top-0 left-1/3 block h-full w-1/3 border-r border-l border-dashed border-gray-200/50;
}

/* Crop move area */
.cropper-move-area {
  @apply absolute top-0 left-0 block h-full w-full cursor-move bg-white/10;
}

/* Edge resize lines */
.cropper-line-e,
.cropper-line-n,
.cropper-line-w,
.cropper-line-s {
  @apply absolute block bg-blue-500/10;
}

.cropper-line-e {
  @apply top-0 -right-0.75 h-full w-1;
}

.cropper-line-n {
  @apply -top-0.75 left-0 h-1 w-full;
}

.cropper-line-w {
  @apply top-0 -left-0.75 h-full w-1;
}

.cropper-line-s {
  @apply -bottom-0.75 left-0 h-1 w-full;
}

/* Resize handles */
.cropper-point {
  @apply absolute flex h-2 w-2 items-center justify-center bg-blue-500;
}

.cropper-point-inner {
  @apply block h-1.5 w-1.5 bg-white;
}

/* Corner handle position and cursor */
.cropper-point-ne {
  @apply -top-1.25 -right-1.25 cursor-ne-resize;
}

.cropper-point-nw {
  @apply -top-1.25 -left-1.25 cursor-nw-resize;
}

.cropper-point-sw {
  @apply -bottom-1.25 -left-1.25 cursor-sw-resize;
}

.cropper-point-se {
  @apply -right-1.25 -bottom-1.25 cursor-se-resize;
}

/* Edge handle position and cursor */
.cropper-point-e {
  @apply top-1/2 -right-1.25 -mt-1 cursor-e-resize;
}

.cropper-point-n {
  @apply -top-1.25 left-1/2 -ml-1 cursor-n-resize;
}

.cropper-point-w {
  @apply top-1/2 -left-1.25 -mt-1 cursor-w-resize;
}

.cropper-point-s {
  @apply -bottom-1.25 left-1/2 -ml-1 cursor-s-resize;
}
</style>
