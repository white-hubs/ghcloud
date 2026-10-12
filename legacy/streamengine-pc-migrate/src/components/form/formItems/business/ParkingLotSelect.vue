<template>
  <div>
    <a-select
      v-if="!props.readonly"
      ref="select"
      v-model:value="value"
      class="select-input"
      style="width: 100%"
      show-search
      :filter-option="filterOption"
      :placeholder="placeholder"
      :loading="loading"
      allowClear
      :options="options"
      @change="handleChange"
    />
    <span v-else>{{ options.find(e => e.value === props.modelValue?.id)?.label || '--' }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { cubeParkingLotService } from '@/api/service'

const props = withDefaults(
  defineProps<{
    modelValue?: { id: string; name: string } | null
    placeholder?: string
    readonly?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: '请选择停车场',
    readonly: false,
  },
)

const emits = defineEmits<{
  (e: 'update:modelValue', value: { id: string; name: string } | null): void
}>()

const options = ref<{ label: string; value: string }[]>([])
const loading = ref(false)
const value = ref<string | undefined>(undefined)

watch(
  () => props.modelValue,
  val => {
    value.value = val?.id
  },
  { immediate: true },
)

const fetchParkingLots = async () => {
  loading.value = true
  try {
    const res = await cubeParkingLotService.getParkingLotList({})
    options.value = (res ?? []).map((item: any) => ({
      label: item.name ?? '',
      value: item.code ?? '',
    }))
  } catch (error) {
    // 控制台打印即可，表单里不打断用户
  } finally {
    loading.value = false
  }
}

const filterOption = (input: string, option: any) => {
  const label: string = option?.label ?? option?.children?.toString() ?? ''
  return label.toLowerCase().includes(input.toLowerCase())
}

const handleChange = (val: string) => {
  const opt = options.value.find(e => e.value === val)
  emits('update:modelValue', opt ? { id: val, name: opt.label } : null)
}

onMounted(() => {
  fetchParkingLots()
})
</script>

<style scoped>
.select-input {
  width: 100%;
}
</style>

