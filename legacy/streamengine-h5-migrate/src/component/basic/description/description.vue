<template>
  <div :style="{ color: props.color }" style="margin: 3vw 0;">{{ props.placeholder }}</div>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder?: string;
  color?: string
}>(), {
  placeholder: "",
  color: '#000000'
})
</script>