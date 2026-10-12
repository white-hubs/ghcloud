<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="selected.map(d => d.name).join('、')"
    readonly />
  <template v-else>
  <VanField :label="props.label" is-link readonly @click="pick"
    :placeholder="props.placeholder" :required="props.required" :error-message="errorMessage">
    <template #input v-if="selected.length">
      <VanSpace wrap>
        <VanTag v-for="dept of selected" :key="dept.id" type="primary" :closeable="false" size="medium">
          {{ dept.name }}
        </VanTag>
      </VanSpace>
    </template>
  </VanField>
  <VanPopup v-model:show="showPicker" position="right" duration="0.2">
    <DeptSelectGroup @cancel="closePicker" @confirm="confirmPick" :depts="depts" :multiple="props.multiple"
      ref="DeptSelectGroupRef" />
  </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { Dept } from '../../../domain/ouaa';
import { ouaaService } from '../../../service/ouaa/ouaa.';
import { computed, onMounted, PropType, ref } from 'vue'
import DeptSelectGroup from './dept-select-group.vue'
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table'
import { staffService } from '../../../service/staff/staff.service'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Array as PropType<Dept[]>,
    required: false,
    default: () => []
  },
  multiple:{
    type: Boolean,
    default: true
  },
  placeholder:{
    type: String,
    default: '请选择部门'
  },
  readonly:{
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue:{
    type: Boolean,
    default: false
  },
  processType:{
    type: String,
  }
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: Dept[]): void;
  (e: 'closePicker', value: boolean): void;
}>()
const showPicker = ref(false)
const depts = ref<Dept[]>([])
const selected = ref<Dept[]>(props.modelValue??[])
const DeptSelectGroupRef=ref()
onMounted(async () => {
  depts.value = await ouaaService.getDeptList({enabled:true})
  if(props.defaultValue&&props.processType===DynamicTableProcessType.ADD){
    const user = await staffService.getCurrentUser()
    if (user.organizations&&user.organizations.length) {
      confirmPick([{id:user.organizations[0].id,name:user.organizations[0].name}] as Dept[])
    }
  }
})
function pick() {
  showPicker.value = true
  setTimeout(() => {
    DeptSelectGroupRef.value.resetDeptCells(props.modelValue)
  }, 0);
}
function closePicker() {
  showPicker.value = false
  emit('closePicker', true)
}
function confirmPick(users: Dept[]) {
  if(users.length){
    selected.value = users
    emit('update:modelValue', selected.value)
  }
  showPicker.value = false
}

const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})

const validInput = ref(true)
defineExpose<FormItemExpose & {pick?: () => void}>({
  validate: () => {
    const valid = !!selected.value.length
    validInput.value = valid
    return selected.value.length > 0
  },
  pick
})
</script>

<style scoped></style>
