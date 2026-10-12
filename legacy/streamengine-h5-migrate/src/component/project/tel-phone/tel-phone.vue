<template>
  <VanField v-model="textValue" :label="props.label" type="text" :required="props.required" :disabled="props.readonly"
    :placeholder="props.placeholder" :formatter="formatter" format-trigger="onChange" :maxlength="props.maxlength"/>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { onMounted, ref, watch } from 'vue'

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
}>(), {
  placeholder: '请输入电话号码',
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

defineExpose<FormItemExpose>({
  validate:() =>{
    if(props.required&&!textValue.value){
      return '请输入电话号码'
    }
    if (textValue.value&&!/^1\d{10}$/.test(textValue.value??'')) {
      return '请输入正确的电话号码'
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
