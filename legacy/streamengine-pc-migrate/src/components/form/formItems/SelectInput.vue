<template>
  <div>
    <a-select
      v-model:value="innerValue"
      style="width:100%;"
      class="select-input"
      :disabled="readonly"
      allowClear
      v-if="!props.readonly"
      placeholder="请选择"
    >
      <a-select-option :value="item" v-for="(item, i) in options" :key="`${item}-${i}`">{{ item }}</a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue ?? '--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
const props = withDefaults(defineProps<{
  modelValue?: number | string | null;
  placeholder?: string;
  options?: string[];
  readonly?: boolean
}>(), {
  modelValue: null,
  placeholder: "请选择",
  options: () => [],
  readonly: false
})

const emits = defineEmits<{ 'update:modelValue': [number | string | null | undefined] }>()

/** 与父级 form 数据双向绑定，避免异步 patch 时 a-select 内部状态与 props 脱节（引发 subTree 等报错） */
const innerValue = computed({
  get(): string | number | undefined {
    const v = props.modelValue
    if (v === null || v === undefined) {
      return undefined
    }
    return v as string | number
  },
  set(v: string | number | undefined) {
    emits('update:modelValue', v ?? null)
  }
})


</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
