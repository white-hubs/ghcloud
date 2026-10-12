<template>
  <div v-if="!props.readonly">
    <a-time-picker
     v-model:value="time.startTime" 
     placeholder="开始时间"  
     :valueFormat="format"
     :format="format"
     :disabled="readonly"
     @change="emits('update:modelValue', [time.startTime,time.endTime])"
    />
    至
    <a-time-picker 
      v-model:value="time.endTime" 
      placeholder="结束时间" 
      :valueFormat="format"
      :format="format"
      :disabled="readonly"
       @change="emits('update:modelValue', [time.startTime,time.endTime])"
      />
  </div>
  <div v-else><span>{{ modelValue?.[0]}}</span> 至<span> {{ modelValue?.[1]}}</span></div>
</template>
<script setup lang="ts">
import {  reactive } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    placeholder?: string;
    readonly?: boolean;
    defaultValue?:any;
    format?: string;
  }>(),
  {
    modelValue: null,
    placeholder: "请输入身份证号",
    readonly: false,
    format:'HH:mm:SS',
    defaultValue:()=>{
      return[null,null]
    },
  }
);
const emits = defineEmits(["update:modelValue","clearValidate"]);
const time =reactive({
  startTime:props.modelValue?.[0]??null,
  endTime:props.modelValue?.[1]??null,
})
const validator = async () => {
	if (time.startTime&&!time.endTime||time.endTime&&!time.startTime) {
		return Promise.reject("请选择时间");
	}
	return Promise.resolve();
};
//对外暴露验证方法
defineExpose({
	validator,
});
</script>
