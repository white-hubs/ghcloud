<template>
  <AmountInput :model-value="value" :readonly="true" :placeholder="props.placeholder" :disabled="props.disabled" :precision="props.precision"/>
</template>
<script setup lang="ts">
import { watch, ref } from 'vue';
import AmountInput from '../AmountInput.vue';
const props = withDefaults(defineProps<{
  modelValue?: number | null
  placeholder?: string
  readonly?: boolean
  disabled?: boolean
  showChinese?: boolean,
  formData: Record<string, any>,
  params: string,
  params2: string,
  precision:number
}>(), {
  modelValue: null,
  placeholder: "自动计算金额",
  readonly: false,
  precision:0
})
const emits = defineEmits(['update:modelValue'])

watch(()=>[props.formData[props.params], props.formData[props.params2]], () => {
  value.value = props.formData[props.params] * props.formData[props.params2]
  emits('update:modelValue',value.value)
})

const value = ref(props.modelValue)
</script>
<style scoped>
.amount-input {
  width: 100%;
}
</style>