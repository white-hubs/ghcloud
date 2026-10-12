<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择紧急程度" v-if="!props.readonly" :options="options" />
    <span v-else>{{ options.find(e=>e.value===props.modelValue?.id)?.label || '--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: {id:string,name:string} | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false,
})

const options = [
  {label:'一般',value:'NORMAL'},
  {label:'重要',value:'IMPORTANCE'},
  {label:'紧急',value:'URGENCY'},
];
const value = ref(props.modelValue?props.modelValue.id:undefined)
const emits = defineEmits(['update:modelValue'])

const handleChange = (val: string) => {
  emits('update:modelValue', {id:val,name:options.find(e=>e.value===val)?.label})
};

</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
