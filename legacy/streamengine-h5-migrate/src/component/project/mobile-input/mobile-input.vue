<template>
  <VanField :model-value="mobile?.name" label="电话" type="text" />
</template>

<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue } from '../../../business/dynamic-table/form-item'
import { staffService } from '../../../service/staff/staff.service'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue?: FormItemObjectValue;
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: FormItemObjectValue): void;
}>()

const mobile = ref(props.modelValue)

onMounted(async () => {
  // TODO(danke): 该业务组件当前定义的提交值为 FormItemObjectValue，但实际应该是 string
  const { mobile: idAndName } = await staffService.getCurrentUser()
  mobile.value = { id: idAndName, name: idAndName }
  emit('update:modelValue', mobile.value)
})

defineExpose<FormItemExpose>({
  validate: () => !!mobile.value
})
</script>

<style scoped>

</style>
