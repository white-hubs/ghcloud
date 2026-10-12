<template>
    <VanField v-model="contact.name" label="姓名" type="text" :required="props.required" :disabled="props.readonly" @focus="changeName"
    :placeholder="props.placeholder" :formatter="formatter" format-trigger="onChange" :maxlength="props.maxlength"/>
    <VanField v-model="contact.tel" label="电话" type="text" :required="props.required" :disabled="props.readonly" @focus="changeTel"
    :placeholder="props.placeholder" :formatter="formatter" format-trigger="onChange" :maxlength="props.maxlength"/>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  label?: string;
  placeholder?: string;
  required?: boolean;
  modelValue?: any;
  readonly?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  maxlength?: number;
  onkeyup?: string;
}>(), {
  placeholder: '请输入'
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()

const contact = ref(props.modelValue??{name:'',tel:''})
watch(()=>contact, () => {
  emit('update:modelValue', contact.value)
})
watch(()=>props.modelValue, () => {
  contact.value=props.modelValue??''
})

defineExpose<FormItemExpose>({
  validate: () => !!contact.value
})

onMounted(() => {
  if (props.defaultValue&&!props.modelValue) {
    contact.value = props.defaultValue;
    emit('update:modelValue', contact.value);
  }
})
const changeName=(e:Event)=>{
  const target=e.target as HTMLInputElement;
  contact.value.name=target.value
  emit('update:modelValue', contact.value)
}
const changeTel=(e:Event)=>{
  const target=e.target as HTMLInputElement;
  contact.value.tel=target.value
  emit('update:modelValue', contact.value)
}
//去除首位空格
const formatter = (value: string) =>{
  let res=value.trim()
  if(res&&props.onkeyup){
    res=res.replace(props.onkeyup, '')
  }
  return res
};
</script>

<style scoped>
:global(.van-field--disabled .van-field__label) {
  color: #646566;
}
:global(.van-field__control:disabled){ color: #646566;-webkit-text-fill-color:#646566}
</style>
