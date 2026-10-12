<template>
  <VanField v-model="textValue" :label="props.label" type="text" :required="props.required" :disabled="props.readonly"
    :placeholder="props.placeholder" :formatter="formatter" format-trigger="onChange" :maxlength="props.maxlength"/>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { onMounted, ref, watch ,nextTick} from 'vue'
import {cubeParkingLotService} from '../../../service/service'

const props = withDefaults(defineProps<{
  label?: string;
  placeholder?: string;
  required?: boolean;
  modelValue?: string;
  readonly?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  maxlength?: number;
  onkeyup?: string;
  allFormData: any;
  params: string;
}>(), {
  placeholder: '请输入车牌号码',
  maxlength:500
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()

const textValue = ref(props.modelValue ?? '')
watch(textValue, () => {
  emit('update:modelValue', textValue.value)
})

watch(()=>props.modelValue, () => {
  textValue.value=props.modelValue??''
})
watch(
  () => props.allFormData[props.params],
  () => {
      getData();
  }
);
const getData = async () => {
  try {
    const data=await cubeParkingLotService.getVehicleNumber(props.allFormData[props.params]?.[0]?.id??props.allFormData[props.params]??'')
    nextTick(()=>{
      textValue.value = data[0]??'';
      emit("update:modelValue", data[0]??'');
    })
  } catch (error) {
  }
};
defineExpose<FormItemExpose>({
  validate:() =>{
    if(props.required&&!textValue.value){
      return '请输入车牌号码'
    }
	  return true
  },
})

onMounted(() => {
  if (props.defaultValue&&!props.modelValue) {
    textValue.value = props.defaultValue;
    emit('update:modelValue', textValue.value);
  }
})

//去除首位空格
const formatter = (value: string) =>{
  let res=value.trim()
  if(res&&props.onkeyup){
    res=res.replace(props.onkeyup, '')
  }
  return res
};
</script>

<style scoped></style>
