<template>
  <a-cascader 
    v-model:value="value" 
    :placeholder="!props.readonly?placeholder:''" 
    :options="props.options" 
    :fieldNames="props.fieldNames"
    @change="emits('update:modelValue',value)"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue';
const props = withDefaults(defineProps<{
  modelValue?: string[] | null;
  placeholder?:string;
  readonly?:boolean
  options?:unknown[];
  fieldNames?:{ label: string, value: string, children: string };
}>(), {
  modelValue: null,
  placeholder:"请选择",
  readonly:false,
  options:()=>[],
  fieldNames:()=>({ label: 'label', value: 'value', children: 'children' })
})
const emits=defineEmits(['update:modelValue'])

const value=ref(props.modelValue??[])
</script>