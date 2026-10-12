<template>
  <div>
    <a-switch :disabled="readonly" v-model:checked="value" @change="handleChange" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const props = withDefaults(defineProps<{
  modelValue?: boolean | null;
  placeholder?: string;
  options?: string[] | [];
  readonly?:boolean
}>(), {
  modelValue: null,
  placeholder: "请选择",
  options: () => { return [] },
  readonly:false
})

const value = ref(props.modelValue??false)
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: boolean) => {
  emits('update:modelValue', val)
};


</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
