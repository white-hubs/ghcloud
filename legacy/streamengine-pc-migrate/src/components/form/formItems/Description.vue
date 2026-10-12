<template>
  <span :style="{ color: props.color }" style="margin-left: 130px;">{{ props.placeholder }}</span>
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