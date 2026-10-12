<template>
  <span v-if="readonly">{{ value.join('、') || '--' }}</span>
  <a-select v-else ref="select" v-model:value="value" mode="multiple" @change="handleChange" class="select-input">
    <a-select-option :value="item" v-for="(item, i) in options" :key="i">{{ item }}</a-select-option>
  </a-select>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string[];
  placeholder?: string;
  options?: string[] | [];
  readonly?: boolean
}>(), {
  modelValue: () => { return [] },
  placeholder: "请选择",
  options: () => { return [] },
  readonly: false
})

const value = ref(props.modelValue ? props.modelValue : [])
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: string) => {
  emits('update:modelValue', val)
};


</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
