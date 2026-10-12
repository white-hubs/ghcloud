
<template>
  <Select v-model:value="value" :options="selectOptions" />
</template>
<script lang="ts" setup>
import { ref } from 'vue'
withDefaults(defineProps<{
  modelValue: string | number;
}>(), {
  modelValue: ''
})
const value = ref('')
const selectOptions = ref([
  {
    value: 'jack',
    label: 'Jack'
  },
  {
    value: 'lucy',
    label: 'Lucy'
  },
  {
    value: 'yiminghe',
    label: 'Yiminghe'
  }
])
</script>
<style scoped></style>
