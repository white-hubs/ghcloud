<template>
  <div>
    <VanField v-model="vacationLength" :disabled="props.readonly" :label="props.label" :required="props.required" :placeholder="placeholder" :type="props.readonly?'text':'number'" @update:model-value="updateModelValue"/>
  </div>
</template>

<script setup lang="ts">
import { DynamicTableRoute } from '../../../business/dynamic-table/dynamic-table'
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { attendanceService } from '../../../service/attendance/attendance.service'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const { query: { businessType } } = useRoute() as DynamicTableRoute

const props = defineProps<{
  modelValue?: { unit:string, value: string };
  dependFormValues: [{id:string;name:string},[string,string]];
  echoMode?: boolean;
  readonly?: boolean;
  placeholder?:string;
  label?:string;
  required?: boolean;
  sponsorId:string;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()

const vacationLength = ref('')
const updateModelValue=()=>{
  if(props.readonly){
    return
  }
  emit('update:modelValue', vacationLength.value)
}

watch([() => props.dependFormValues], async () => {
  if (props.readonly) {
    return
  }
  if(props.dependFormValues[1] && businessType){
    const [start,end=null]=props.dependFormValues[1]
    const params = {
      businessType:businessType!,
      staffId:props.sponsorId,
      holidayRuleId: props.dependFormValues[0].id ?? '',
      period: `${start},${end}`,
    }
    const res= await attendanceService.getVacationDuration(params)
    vacationLength.value = res
    emit('update:modelValue', res);
  }
})


onMounted(()=>{
  if(props.modelValue){
    if(props.modelValue instanceof Object){
      const unit=props.modelValue.unit==='DAY'?'天':'小时'
      vacationLength.value=props.modelValue.value+unit
    }else{
      vacationLength.value=(props.modelValue as unknown as string)+'小时'
    }
  }
})

defineExpose<FormItemExpose>({
  validate: () => !!vacationLength.value
})
</script>

<style scoped>

</style>
