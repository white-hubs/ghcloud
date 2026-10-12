<template>
  <a-textarea v-model:value="value" maxlength="500" :placeholder="_placeholder" @change="emits('update:modelValue', value)"
    :rows="props.rows" :readonly="readonly" :bordered="!readonly"/>
</template>
<script setup lang="ts">
import { ProcessType } from '@/typings/process'
import { computed, inject, onMounted, ref } from 'vue';
const props = withDefaults(defineProps<{
  modelValue?: string | null
  placeholder?: string
  readonly?: boolean
  rows?: number
  defaultValue?:string
}>(), {
  modelValue: null,
  placeholder: "请输入内容",
  readonly: false
})
const processType = inject("processType");
const emits = defineEmits(['update:modelValue'])

const _placeholder = computed(() => {
  return props.readonly ? '' : props.placeholder
})
const value = ref(props.modelValue)

onMounted(()=>{
  if (props.defaultValue && processType === ProcessType.ADD) {
    value.value=props.defaultValue
    emits('update:modelValue', props.defaultValue)
  }
})
</script>