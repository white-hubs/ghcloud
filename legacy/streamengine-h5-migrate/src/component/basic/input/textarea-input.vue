<template>
  <VanField v-model="inputValue" type="textarea" :rows="props.rows" :error-message="errorMessage" :required="required"
    :label="props.label" :disabled="props.readonly" class="cube-input-textarea" label-align="top"
    :placeholder="props.placeholder" :maxlength="props.maxlength" :formatter="formatter" format-trigger="onBlur" />
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string;
  required?: boolean;
  placeholder?: string;
  label?: string;
  rows?:number;
  readonly?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  maxlength?: number;
}>(), {
  placeholder: '请输入内容',
  maxlength:500
})
const emit = defineEmits<{
  (e: 'update:modelValue', value?: string): void;
}>()
const inputValue = ref(props.modelValue)
const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required && !props.readonly) ? `请输入${props.label}` : ''
})

watch(() => props.modelValue, () => { inputValue.value = props.modelValue })
watch(inputValue, () => {
  validate()
  emit('update:modelValue', inputValue.value)
})

const validate = () => {
  if(props.readonly){
    return true
  }
  const valid = !!inputValue.value
  validInput.value = valid
  return valid
}

defineExpose<FormItemExpose>({
  validate
})
onMounted(() => {
  if (props.defaultValue&&!props.modelValue) {
    inputValue.value = props.defaultValue;
    emit('update:modelValue', inputValue.value);
  }
})

//去除首位空格
const formatter = (value: string) => value.trim();
</script>

<style scoped lang="less">
.cube-input-textarea {
  :deep(.van-field__value) {
    background-color: #FAFAFA;
    padding: 10px 12px;

    .van-field__control--min-height {
      min-height: 50px !important;
    }


  }
}
</style>
