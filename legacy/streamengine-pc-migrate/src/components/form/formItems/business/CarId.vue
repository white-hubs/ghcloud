<template>
  <a-select ref="select" v-model:value="value" style="width:100%;" @change="emits('update:modelValue', value)"
    class="select-input" placeholder="请选择车牌号" :disabled="readonly" v-if="!props.readonly">
    <a-select-option :value="item.value" v-for="(item, i) in options" :key="i">
      {{ item.label }}
    </a-select-option>
  </a-select>
  <span v-else>{{ props.modelValue ?? '--' }}</span>
</template>
<script setup lang="ts">
import { cubeParkingLotService } from '@/api/service'
import { nextTick, onMounted, Ref, ref, watch } from "vue";
import { inject } from 'vue';

const processType = inject('processType') as string
const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    placeholder?: string;
    readonly?: boolean;
    onkeyup?: string;
    defaultValue?: string | null;
    params: string;
    allFormData: any;
  }>(),
  {
    modelValue: null,
    placeholder: "请输入车牌号码",
    readonly: false,
    onkeyup: "",
    defaultValue: null,
  }
);
const emits = defineEmits(["update:modelValue","clearValidate"]);
const options = ref<{label:string,value:string}[]>([]);
const value = ref(props.modelValue || props.defaultValue);

onMounted(()=>{
  if(options.value.length===0&&props.allFormData?.[props.params]?.[0]?.id){
    getData();
  }
  if(props.defaultValue&&processType==='add'){
    value.value=props.defaultValue
    emits("update:modelValue", value.value);
  }
})
const validateSecIdCard=(value:string) =>{
  const regex = (/^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳台]{1})$/)
  return regex.test(value);
}
const validator = async () => {
	// if (value.value&& !validateSecIdCard(value.value??'')) {
	// 	return Promise.reject("请选择正确的车牌号码");
	// }
	return Promise.resolve();
};

const getData = async () => {
  try {
    const data=await cubeParkingLotService.getVehicleNumber(props.allFormData?.[props.params]?.[0]?.id??props.allFormData?.[props.params]??'')
    nextTick(()=>{
      options.value=data.map(x=>{return {label:x,value:x}})
      if(options.value.length>0 && processType==='add'){
        value.value = options.value[0].value ?? '';
        emits("update:modelValue", value.value);
      }
    })
  } catch (error) {
  }
};
watch(
  () => props.allFormData?.[props.params],
  () => {
      getData();
  }
);
//对外暴露验证方法
defineExpose({
	validator,
});
</script>
