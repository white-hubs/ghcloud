<template>
  <div class="col" :style="{ 'width': `${props.width}%` }">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
const props = withDefaults(defineProps<{
  width?: number
}>(), {
  width: 100
})
</script>
<style scoped>
.col {
  max-width: 100%;
  display: inline-block;
  box-sizing: border-box;
}
</style>