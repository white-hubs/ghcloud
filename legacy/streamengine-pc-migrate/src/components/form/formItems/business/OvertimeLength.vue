<template>
  <div v-if="!props.readonly">
    <a-input-number v-model:value="value" style="width:calc(100% - 50px);" :placeholder="placeholder" :disabled="props.readonly" min="0" />
    <div style="position: absolute;right:0px;top:5px">小时</div>
  </div>
  <span v-else>{{ value+'小时' }}</span>
</template>
<script setup lang="ts">
import { getWorkOvertimeDuration, getWorkOvertimePeriod } from '@/api/attendance'
import eventBus from '@/utils/event-bus'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import { ref, watch } from 'vue'
const props = withDefaults(defineProps<{
  modelValue?: any | null;
  placeholder?: string;
  readonly?: boolean;
  config: any;
  params: string;
  params2: string;
  formData: any
}>(), {
  modelValue: null,
  placeholder: "系统自动计算",
  readonly: false
})
const emits = defineEmits(['update:modelValue', 'update:formData'])
const period=ref('')
const params=ref(props.params)
const params2=ref(props.params2)
const initValue=ref()
const unitStr: { [key: string]: string } = {
  DAY: "天",
  HOUR: "小时",
}
const unWatch = ref(false)
const timeReadOnly=ref(true)
const typeReadOnly=ref(true)
const value = ref(props.modelValue?props.modelValue.name:'')
eventBus.on('overTimeChange',(value:any)=>{
  if(value.name==='overTimeType'){
    params.value=value.id
    typeReadOnly.value=value.readonly
  }
  if(value.name==='dateTime'){
    params2.value=value.id
    timeReadOnly.value=value.readonly
  }
})
watch(
  [() => props.formData[params2.value],
  () => props.formData[params.value]],
  () => {
    if (!unWatch.value) {
        if(!initValue.value&&(!timeReadOnly.value||!typeReadOnly.value)){
      getData();
    }
    initValue.value=null
    }
  }
);
watch(()=>value.value,()=>{
  value.value? emits('update:modelValue', { name: value.value, id:  "", }):emits('update:modelValue',null)
})
onMounted(()=>{
  initValue.value=value.value
  value.value? emits('update:modelValue', { name: value.value, id:  "", }):emits('update:modelValue',null)
})
const getData = async () => {
  if(props.formData[params2.value]?.length===2&&props.formData[params.value]){
    try {
     period.value = [
      dayjs(props.formData[params2.value][0]).format("YYYY-MM-DD HH:mm:ss"),
      dayjs(props.formData[params2.value][1]).format("YYYY-MM-DD HH:mm:ss"),
    ].join(",");

    const query = {
      workOvertimeType: props.formData[params.value],
      period: period.value
    }
    const resq = await getWorkOvertimeDuration(query);
    emits('update:modelValue', { name: resq.data?.name ?? "", id: resq.data?.id ?? "", })
    value.value = resq.data.name
  } catch (error) {
    emits('update:modelValue', null)
    value.value = ''
  }
  }else{
    value.value = ''
    emits('update:modelValue', null)
    return
  }
};

</script>