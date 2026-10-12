<template>
  <span v-if="props.readonly">{{ props.modelValue?.label || '--' }}</span>
  <a-select v-else ref="personnelCategory" v-model:value="value" style="width:100%;" @change="handleChange"
    class="select-input" allowClear placeholder="请选择">
    <a-select-option :value="item.code" v-for="(item, i) in options" :key="item.id" :label="item.name">{{ item.name }}</a-select-option>
  </a-select>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import {cubePersonnelManagementService} from '@/api/service'
import type {PersonCategory} from '@ghcloud/cube-personnel-management-service'
const props = withDefaults(defineProps<{
  modelValue?: {label: string, value: string} | null;
  placeholder?: string;
  readonly?:boolean
}>(), {
  modelValue: null,
  placeholder: "请选择",
  readonly:false
})

const value = ref('')
const emits = defineEmits(['update:modelValue'])
const options = ref<PersonCategory[]>([])
onMounted(()=>{
  if(props.modelValue){
    value.value = props.modelValue.value
  }
  if (!props.readonly) {
    getOptions()
  }
})

const getOptions = async () => {
  const res = await cubePersonnelManagementService.getPersonnelCategoryListAll()
  options.value = res
}
const handleChange = (val: string,option: any) => {
  emits('update:modelValue', {
    label: option.label,
    value: option.value
  })
};


</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
