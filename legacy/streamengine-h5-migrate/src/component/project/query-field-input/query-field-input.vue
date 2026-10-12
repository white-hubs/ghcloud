<template>
  <VanField v-model="staffValue.name" :label="props.label" type="text" :required="props.required" readonly
    :placeholder="placeholder" :error-message="errorMessage" :disabled="true" />
</template>

<script setup lang="ts">
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table';
import { FormItemExpose, FormItemObjectValue } from '../../../business/dynamic-table/form-item'
import { staffService } from '../../../service/staff/staff.service';
import { computed, onMounted, ref, watch } from 'vue'
import { archivesList } from './componentList'

const props = withDefaults(defineProps<{
  label?: string;
  required?: boolean;
  modelValue?: FormItemObjectValue|null;
  echoMode?: boolean;
  defaultValue?: string;
  sponsorId?: string;
  name?: string;
  processType: DynamicTableProcessType;
  errorMessage?: string;
  disabled?: boolean;
  placeholder?: string;
  dependFormValues: any[];
}>(), {
  dependFormValues: () => []
})

const placeholder = computed(() => {
  if (props.name) {
    return archivesList[archivesList.findIndex(e => e.name === props.name)].placeholder ?? '系统自动带入'
  }
  return '系统自动带入'
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: FormItemObjectValue|null): void;
}>()

const staffValue = ref<FormItemObjectValue>(props.modelValue ?? { id: '', name: '' })
watch(() => props.dependFormValues, (newVal) => {
  let ids = props.dependFormValues[0] ?? null
  if (ids) {
    if (ids instanceof Array) {
      ids = ids.map(item => item.id).join(',')
    } else if (ids instanceof Object) {
      ids = ids?.id ?? ""
    }
    getData(ids)
  }
})

const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `${props.label}不存在` : ''
})

defineExpose<FormItemExpose>({
  validate: () => {
    validInput.value = true
    if (!staffValue.value) {
      validInput.value = false
    }
    if (!staffValue.value.name) {
      validInput.value = false
    }
    return validInput.value
  }
})

const getData = async (ids: string = '') => {
  let id = ids ? ids : (props.sponsorId ?? "")
  const params = { id: id, attr: archivesList[archivesList.findIndex(e => e.name === props.name)].attr ?? 'name' }
  const res = await staffService.getStaffField(params)
  staffValue.value.name = res.name ?? '';
  if (res.name) {
    staffValue.value = res;
    emit('update:modelValue', staffValue.value);
  }else{
    emit('update:modelValue', null);
  }
}

onMounted(async () => {
  if (props.modelValue) {
    return
  }
  if (props.sponsorId) {
    getData()
  }
})
</script>

<style scoped></style>
