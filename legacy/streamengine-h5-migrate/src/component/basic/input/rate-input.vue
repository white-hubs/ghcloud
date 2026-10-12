<template>
  <div>
    <VanField :label="props.label" type="text" :required="props.required" readonly :disabled="props.readonly">
      <template #input>
        <van-rate v-model="value" color="#ffd21e" allow-half :count="props.rateNum" clearable
          :readonly="props.readonly" />
      </template>
    </VanField>
  </div>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  label?: string;
  required?: boolean;
  modelValue?: number;
  readonly?: boolean;
  disabled?: boolean;
  rateNum?:number;
}>(), {
  rateNum: 5
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>()

const value = ref(props.modelValue ?? 0)

watch(value, () => {
  emit('update:modelValue', value.value)
})

watch(()=>props.modelValue, () => {
  value.value=props.modelValue??0
})

defineExpose<FormItemExpose>({
  validate: () => {
    return true
  }
})
</script>

<style scoped></style>
