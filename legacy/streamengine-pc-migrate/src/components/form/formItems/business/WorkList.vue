<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择事项类型" :disabled="readonly" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <a-input disabled v-model:value="props.modelValue.name" v-else-if="props.modelValue"></a-input>
  </div>
</template>
<script lang="ts" setup>
import { FlowForm } from '@/domain/form-flow'
import { computed } from 'vue'
import { Ref, inject, ref, watch } from 'vue'
import eventBus from "@/utils/event-bus";

type ModalValue = {
  id: string;
  name: string;
}
const props = withDefaults(defineProps<{
  modelValue?: ModalValue | null;
  readonly?: boolean,
  config:Object,
  formData: any,
  params: string,
}>(), {
  modelValue: null,
  readonly: false,
})

const options: ModalValue[]=[
  { id: 'ACTIVE', name: '处理中' },
  { id: 'FINISHED', name: '已完成' },
]
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])

const handleChange = (val: string) => {
  const index = options.findIndex(e => e.id === val);
  emits('update:modelValue', options[index])
  eventBus.emit('CHANGE_NUMBER_INPUT',options[index].id==='FINISHED'?100:0)
};

if(props.params &&! props.readonly){
  watch(()=>props.formData[props.params], () => {
    let numberValue = props.formData[props.params] ?? null
    if(numberValue !== null){
      const index = parseInt(numberValue) >= 100 ? 1: 0
      value.value = options[index].id
      emits('update:modelValue',options[index])
    }
  })
}
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
