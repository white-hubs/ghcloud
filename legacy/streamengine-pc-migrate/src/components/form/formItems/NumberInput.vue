<template>
  <a-input-number 
    v-model:value="value" 
    :placeholder="placeholder" 
    @change="emits('update:modelValue', value)"
    class="number-input" 
    :disabled="readonly || linkedBindActive" 
    :max="props.maxNum" 
    :min="props.minNum" 
    :precision="props.precision" 
    v-if="!props.readonly"
  />
  <span v-else>{{ value ?? '--' }}</span>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import eventBus from "@/utils/event-bus";

const props = withDefaults(defineProps<{
  modelValue?: number | null
  placeholder?: string
  readonly?: boolean
  maxNum?: number
  minNum?: number
  precision?:number
  /** 关联的上传控件字段 id（FileUpload/ImageUpload），值为数组时本字段同步为 length */
  params?: string | null
  formData?: Record<string, unknown>
}>(), {
  modelValue: null,
  placeholder: "请输入数字",
  readonly: false,
  precision:0,
  params: null,
  formData: () => ({}),
})
const emits = defineEmits(['update:modelValue'])
const value = ref(props.modelValue)

const linkedBindActive = computed(
  () => Boolean(props.params != null && props.params !== ''),
)

const linkedCount = computed(() => {
  if (!linkedBindActive.value) return null
  const raw = props.formData?.[props.params as string]
  return Array.isArray(raw) ? raw.length : null
})

watch(linkedCount, (n) => {
  if (!linkedBindActive.value) return
  const next = n ?? 0
  if (value.value !== next) {
    value.value = next
    emits('update:modelValue', next)
  }
}, { immediate: true })

watch(() => props.modelValue, (v) => {
  if (!linkedBindActive.value) {
    value.value = v
  }
})

eventBus.on('CHANGE_NUMBER_INPUT',(data:any)=>{
  if (!linkedBindActive.value) {
    value.value = data
    emits('update:modelValue', data)
  }
})
</script>
<style scoped>
.number-input {
  width: 100%;
}
</style>