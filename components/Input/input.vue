<template>
  <div class="input-wrapper">
    <label v-if="label" :for="name">
      {{ label }}
    </label>
    <div
      class="input-container"
      :class="{
        readonly: readonly,
        'has-error': error,
      }"
    >
      <slot name="left">
      </slot>
      <div v-if="loading" class="loading" :class="[classes]">
        {{ loadingText }}
      </div>
      <input
        v-else
        :id="name"
        :class="[classes]"
        :name="name"
        :type="localType"
        :minlength="minlength"
        :maxlength="maxlength"
        :pattern="pattern"
        :required="required"
        :readonly="readonly"
        :placeholder="placeholder"
        :value="localValue"
        @input="input($event.target.value)"
      >
      <slot name="right">
      </slot>
    </div>
    <div v-if="error" class="text-left text-red mt-1 ml-1">
      {{ error }}
    </div>
    <slot name="bottom">
    </slot>
  </div>
</template>

<script lang="ts" src="./src/input.ts">
</script>
<style scoped lang="stylus">
@import 'assets/css/components/input.styl'
</style>
