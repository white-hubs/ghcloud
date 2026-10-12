<template>
  <a-input
    v-model:value="value"
    :placeholder="!props.readonly ? placeholder : ''"
    :onkeyup="keyup"
    maxlength="500"
    @change="emits('update:modelValue', value)"
    :disabled="readonly"
    v-if="!props.readonly"
  />
  <span v-else>{{ props.modelValue ?? '--' }}</span>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { inject } from 'vue';

const processType = inject('processType') as string
const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    placeholder?: string;
    readonly?: boolean;
    onkeyup?: string;
    defaultValue?: string | null;
  }>(),
  {
    modelValue: null,
    placeholder: "请输入内容",
    readonly: false,
    onkeyup: "",
    defaultValue: null,
  }
);
const emits = defineEmits(["update:modelValue","clearValidate"]);
const keyup = (ent: any) => {
  if (value.value && props.onkeyup){
    value.value = value.value.replace(props.onkeyup, "");
  }
  emits("update:modelValue", value.value);
  if(value.value){
    emits("clearValidate")
  }
};
const value = ref(props.modelValue || props.defaultValue);

onMounted(()=>{
  if(props.defaultValue&&processType==='add'){
    value.value=props.defaultValue
    emits("update:modelValue", value.value);
  }
})
</script>
