<template>
  <div>
    <div v-if="!loading" class="container">
      <header-component />
      <Nuxt />
    </div>
    <loader v-else />
  </div>
</template>
<script lang="ts" src="./src/default.ts">
</script>
