<template>
  <a-rate v-model:value="value" allow-half allow-clear :disabled="props.readonly" :count="props.rateNum" @change="emits('update:modelValue', value)"/>
</template>
<script setup lang="ts">
import { ref } from "vue";
const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    placeholder?: string;
    readonly?: boolean;
    rateNum?:number
  }>(),
  {
    modelValue: null,
    readonly: false,
    rateNum:5
  }
);
const emits = defineEmits(["update:modelValue","clearValidate"]);
const value = ref(props.modelValue);
</script>
