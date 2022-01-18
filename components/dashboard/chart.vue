<template>
  <div class="chart-container">
    <form @submit.prevent="search">
      <input-component
        v-model="symbol"
        :readonly="loading"
        placeholder="Enter token address"
        id="symbol-search-bar"
        name="symbol"
        :required="true"
        :minlength="42"
        :maxlength="42"
      />
    </form>
    <div v-show="ready" :id="containerId" class="chart" />
    <div v-show="!ready" class="dummy-chart">
      <loader :fit-height="true" />
    </div>
  </div>
</template>

<script lang="ts" src="./src/chart.ts">
</script>
<style scoped lang="stylus">
@import 'assets/css/components/chart.styl'
</style>
