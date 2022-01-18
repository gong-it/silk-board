<template>
  <div id="loader-wrapper" :class="{'fit-height': fitHeight}">
    <div id="loader">
      <oasis id="logo" />
    </div>
  </div>
</template>

<script lang="ts" src="./src/loader.ts">
</script>
<style scoped lang="stylus">
  @import 'assets/css/components/loader.styl'
</style>
