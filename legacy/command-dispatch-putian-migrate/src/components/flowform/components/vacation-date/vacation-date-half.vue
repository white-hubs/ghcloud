<template>
  <a-space>
    <DateHalfPicker :disabled="props.disabled" v-model:value="start" />
    ~
    <DateHalfPicker :disabled="props.disabled" v-model:value="end" />
  </a-space>
</template>

<script setup>
import { ref, watch } from 'vue';
import DateHalfPicker from './date-half-picker.vue';

const props = defineProps({
  value: {
    type: Array
  },
  disabled: Boolean
})
const emit = defineEmits(['update:value'])
const [propsStart, propsEnd] = props.value ?? []
const start = ref(propsStart)
const end = ref(propsEnd)

watch([start, end], () => {
  if (!start.value || !end.value) {
    return
  }
  emit('update:value', [start.value, end.value])
})
</script>

<style scoped>

</style>