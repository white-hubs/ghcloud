<template>
  <component ref="formItemRef" :formData="formData" :config='config'
    :allFormData="allFormData"
    :is="formItems[config.name] ?? componentNotFoundMessage" v-model="_value" v-bind="config.props"
    :parentRowChain="parentRowChain"
    @clearValidate="clearValidate" />
</template>
<script setup lang="ts">
import { FormInstance } from 'ant-design-vue';
import { computed, h, ref, watch } from 'vue';
import { formItems } from "./formItems/index"
const props = withDefaults(defineProps<{
  value: any;
  config: any;
  formData: object;
  allFormData?: object;
  formRef?: FormInstance | undefined
  /** 组合容器嵌套时，自外向内分组行数据链，用于解析联动字段值 */
  parentRowChain?: Record<string, unknown>[]
}>(), {
  value: null,
  config: () => { return {} },
  formData: () => { return {} },
  parentRowChain: () => undefined,
})
const emits = defineEmits(['update:value']);
const formItemRef = ref()
const _value = ref(props.value)
watch(_value, () => {
  emits('update:value', _value)
  props.formRef?.validateFields([props.config.id])
},{deep:true})
watch(()=>props.value,()=>{
  _value.value = props.value
})
watch([props.config, props.formData],()=>{
},{ immediate: true })
const componentNotFoundMessage = computed(() => h('div', `尚未实现的表单元素[${props.config.name}]`))

const clearValidate = () => {
  if (props.formRef)
    props.formRef.clearValidate(props.config.id)
}

const validator = async () => {
  let validate = true
  let error = ''
  await formItemRef.value.validator().then(() => {
    validate = true
  }).catch((err: string) => {
    error = err
    validate = false
  })
  if (!validate) {
    if (props.config.name === 'GroupList') {
      setTimeout(() => { clearValidate() }, 0);
    }
    return Promise.reject(error);
  }
  return Promise.resolve();
}
//对外暴露验证方法
defineExpose({
  validator
})
</script>

