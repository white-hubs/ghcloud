<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker"
    :label="label" @click="pick" placeholder="请选择加班补偿" :error-message="errorMessage"/>
  <VanPopup v-model:show="showPicker" position="bottom">
    <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import bus from '../../../infrastructure/bus';
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { ProcessRoute } from '../../../domain/process'
import { attendanceService } from '../../../service/attendance/attendance.service';
import { PickerOption, showNotify } from 'vant'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const { query: { processId=''} } = useRoute() as ProcessRoute

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string, name: string };
  dependFormValues: any[];
  formData: any;
  sponsorId: string;
  processId:string;
  params: string;
}>()
const columns = ref()
const showPicker = ref(false)
const selected = ref()
const params=ref(props.params)
const emits = defineEmits(['update:modelValue'])
bus.on('overTimeChange',(value:any)=>{
  if(value.name==='overTimeType'){
    params.value=value.id
    nextTick(()=>{
      getData()
    })
  }
})
const pick = () => {
  if (props.readonly) {
    return
  }
  if (!params.value) {
    showNotify('请先选择加班类型')
    return
  }
  showPicker.value = true
}
function hidePicker() {
  showPicker.value = false
}

function confirmPicker(selectedOptions: PickerOption[]) {
  if (props.readonly) {
    return
  }
  selected.value = selectedOptions[0].value
  emits('update:modelValue', selected.value)
  hidePicker()
}

const getData=async ()=>{
  const query = {
    processInstanceId:processId,
    workOvertimeType:props.formData[params.value??''],
  }
  const res = await attendanceService.getWorkOvertimeCompensation(query);
  columns.value = res.map(e => {
    return { text: e.name, value: e }
  })
}
getData()

onMounted(async () => {
  if (props.modelValue) {
    selected.value = props.modelValue
  }
})
onUnmounted(()=>{
  bus.off('overTimeChange')
})
const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})
const validate = () => {
  const valid = !!selected.value
  validInput.value = valid
  return valid
}
defineExpose<FormItemExpose>({
  validate: () => validate()
})
</script>
