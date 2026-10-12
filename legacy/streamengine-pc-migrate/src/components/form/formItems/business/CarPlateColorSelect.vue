<template>
  <div>
    <a-select
      v-if="!props.readonly"
      ref="select"
      v-model:value="value"
      class="select-input"
      style="width: 100%"
      allowClear
      :placeholder="placeholder"
      :options="options"
      @change="handleChange"
    />
    <span v-else>{{ options.find(e => e.value === props.modelValue?.id)?.label || '--' }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: { id: string; name: string } | null
    readonly?: boolean
    placeholder?: string
  }>(),
  {
    modelValue: null,
    readonly: false,
    placeholder: '请选择车牌颜色',
  },
)

const options = [
  { label: '蓝色', value: 'BLUE' },
  { label: '黄色', value: 'YELLOW' },
  { label: '绿色', value: 'GREEN' },
  { label: '黑色', value: 'BLACK' },
  { label: '白色', value: 'WHITE' },
  { label: '其他', value: 'OTHER' },
]

const value = ref(props.modelValue ? props.modelValue.id : undefined)
const emits = defineEmits<{
  (e: 'update:modelValue', value: { id: string; name: string } | null): void
}>()

const handleChange = (val: string) => {
  const opt = options.find(e => e.value === val)
  emits('update:modelValue', opt ? { id: val, name: opt.label } : null)
}
</script>

<style scoped>
.select-input {
  width: 100%;
}
</style>

