<template>
  <div>
    <VanField v-model="vacationLength" :disabled="props.readonly" :label="props.label" :required="props.required" :placeholder="placeholder" :type="props.readonly?'text':'number'" @update:model-value="emit('update:modelValue', vacationLength)"/>
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
  modelValue?: string;
  dependFormValues: [{id:string;name:string;holidayRuleId:string},[string,string]];
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

watch([() => props.dependFormValues], async () => {
  if (props.readonly) {
    return
  }
  if(props.dependFormValues[1] && businessType){
    const [start,end=null]=props.dependFormValues[1]
    const params = {
      businessType:businessType!,
      staffId:props.sponsorId,
      holidayRuleId: props.dependFormValues[0].holidayRuleId ?? '',
      period: `${start},${end}`,
    }
    const res= await attendanceService.getVacationDuration(params)
    vacationLength.value = res
    emit('update:modelValue', res);
  }
})


onMounted(()=>{
  if(props.modelValue){
    vacationLength.value=props.modelValue
    if(props.readonly){
      vacationLength.value+='小时'
    }
  }
})

defineExpose<FormItemExpose>({
  validate: () => !!vacationLength.value
})
</script>

<style scoped>

</style>
