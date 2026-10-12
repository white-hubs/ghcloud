<template>
  <div>
    <a-select v-model:value="value" style="width:100%;" @change="handleChange" clearable class="select-input"
      placeholder="请选择换班班次" :disabled="readonly" v-if="!props.readonly">
      <a-select-option v-for="(op, index) in options" :key="index" :value="op.id">{{ op.name }}</a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?props.modelValue.name:'--' }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
const emits = defineEmits(['update:modelValue'])
type DutyOptionItem = {
  id: string;
  name: string;
}

const props = withDefaults(defineProps<{
  modelValue?: DutyOptionItem | null;
  readonly?: boolean;
  formData: any;
  params: string
}>(), {
  modelValue: null,
  readonly: false,
})
const options = ref<DutyOptionItem[]>([]);
const value = ref(props.modelValue?.id)
const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};
onMounted(async ()=>{
  options.value = [
    {id:'ARRANGE',name:"排班制"},
    {id:'DUTY',name:"值班制"},
  ]
})
</script>
