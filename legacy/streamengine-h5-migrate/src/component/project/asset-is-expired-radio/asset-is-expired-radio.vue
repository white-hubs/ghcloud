<template>
  <VanField :required="props.required" readonly :label="props.label" :disabled="props.readonly" :error-message="errorMessage">
    <template #input>
      <VanRadioGroup v-model="value" direction="horizontal" :disabled="props.readonly" @change="handleChange" v-if="!props.readonly">
        <VanRadio :name="true">是</VanRadio>
        <VanRadio :name="false">否</VanRadio>
      </VanRadioGroup>
      <span v-else>{{ value?'是':'否' }}</span>
    </template>
  </VanField>
</template>
<script lang="ts" setup>
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { computed, ref } from 'vue'
const props = withDefaults(defineProps<{
  modelValue?: Boolean | null;
  readonly?: boolean;
  required?: boolean;
  label?: string;
  errorMessage?:string;
}>(), {
  modelValue: null,
  readonly: false,
})

const value = ref(props.modelValue??null)
const emits = defineEmits(['update:modelValue'])

const handleChange = () => {
  emits('update:modelValue',value.value )
};

const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})
const validate = () => {
  const valid = value.value!==null
  validInput.value = valid
  return valid
}
defineExpose<FormItemExpose>({
	validate
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
