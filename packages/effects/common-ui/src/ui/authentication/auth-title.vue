<template>
  <div class="mb-7 sm:mx-auto sm:max-w-md sm:w-full">
    <h2
      class="text-3xl/9 color-text tracking-tight font-bold mb-3 lg:text-4xl"
    >
      <slot />
    </h2>

    <p class="text-sm text-muted-foreground lg:text-base">
      <slot name="desc" />
    </p>
  </div>
</template>
