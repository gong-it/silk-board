<template>
  <button
    role="button"
    class="btn"
    :class="[buttonClass, buttonSize, classes, loadingClass]"
    :type="nativeType"
    :disabled="disabled"
    @click="click"
  >
    <span v-if="hasIcon" class="btn__icon">
      <slot name="icon" />
    </span>
    <span v-if="type !== 'circle'" class="btn__text">
      <slot />
    </span>
    <slot v-else />
  </button>
</template>

<script lang="ts" src="./src/index.ts">
</script>
<style scoped lang="stylus">
  @import 'assets/css/components/button.styl'
</style>
