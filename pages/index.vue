<template>
  <div class="row">
    <div id="mineral-widget" style="width: 284px; height: 10px; margin-right: 16px"></div>
    <chart symbol="0xa9401ba6e1953e13f6712f6e91f0ee144510e3b1" style="margin-right: 16px"></chart>
    <div style="width: 220px;overflow: hidden">
      <token />
      <swap />
    </div>
  </div>
</template>

<script lang="ts" src="./src/index.ts"></script>

<style>
.row {
  display: flex;
}
</style>
