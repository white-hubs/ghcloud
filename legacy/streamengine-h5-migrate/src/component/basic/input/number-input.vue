<template>
  <VanField 
    v-model="numValue" 
    :label="props.label" 
    type="number" 
    :required="props.required" 
    :disabled="fieldDisabled"
    :placeholder="props.placeholder" 
    :formatter="formatter" 
    format-trigger="onBlur" 
    :maxlength="props.maxlength" 
  />
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { computed, onMounted, ref, watch } from 'vue'
import bus from "../../../infrastructure/bus";

const props = withDefaults(defineProps<{
  label?: string;
  placeholder?: string;
  required?: boolean;
  modelValue: number;
  readonly?: boolean;
  disabled?: boolean;
  defaultValue?: number;
  maxNum?: string;
  minNum?: string;
  precision?: number;
  maxlength?: number;
  /** 关联的上传控件字段 id，值为数组时本字段同步为 length */
  params?: string | null;
  formData?: Record<string, unknown>;
}>(), {
  placeholder: '请输入数字',
  maxNum: '',
  minNum: '',
  precision: 0,
  params: null,
  formData: () => ({}),
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null | string): void;
}>()

const numValue = ref<number|string>(props.modelValue??undefined)

const linkedBindActive = computed(
  () => Boolean(props.params != null && props.params !== ''),
)

const linkedCount = computed(() => {
  if (!linkedBindActive.value) return null
  const raw = props.formData?.[props.params as string]
  return Array.isArray(raw) ? raw.length : null
})

const fieldDisabled = computed(() =>
  Boolean(props.readonly || linkedBindActive.value),
)

watch(numValue, () => {
  if (!linkedBindActive.value) {
    emit('update:modelValue', numValue.value)
  }
})

watch(linkedCount, (n) => {
  if (!linkedBindActive.value) return
  const next = n ?? 0
  const cur = numValue.value === '' || numValue.value === undefined ? undefined : Number(numValue.value)
  if (cur !== next) {
    numValue.value = next
    emit('update:modelValue', next)
  }
}, { immediate: true })

watch(() => props.modelValue, () => {
  if (!linkedBindActive.value) {
    numValue.value = props.modelValue ?? undefined
  }
})

defineExpose<FormItemExpose>({
  validate: () => numValue.value !== undefined
})

onMounted(() => {
  if (props.defaultValue&&!props.modelValue) {
    numValue.value = props.defaultValue;
    emit('update:modelValue', numValue.value);
  }
})

bus.on('CHANGE_NUMBER_INPUT',(value)=>{
  if (!linkedBindActive.value) {
    numValue.value = value as number
    emit('update:modelValue', numValue.value)
  }
})

const formatter = (value: string) => {
  if (props.minNum && parseFloat(props.minNum) > parseFloat(value)) {
    return props.minNum
  }
  if (props.maxNum && parseFloat(props.maxNum) < parseFloat(value)) {
    return props.maxNum
  }
  const match = value.match(new RegExp(`^\\d+(?:\\.\\d{0,${props.precision}})?`))
  return match ? match.toString() : value
};
</script>

<style scoped></style>
