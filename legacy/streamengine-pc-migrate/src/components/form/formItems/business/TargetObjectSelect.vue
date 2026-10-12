<template>
  <div class="target-object-select">
    <a-select :value="state.selected.map(e=>e.id)" :searchValue="state.searchValue" :showSearch="true" :showArrow="false" @change="handleChange" @search="handleSearch" :open="false" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="item in state.selected" :key="item.id">{{ item.name }}</a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue && props.modelValue.name || '--' }}</span>
    <a-button type="primary" @click="openSelectModal" v-if="!props.readonly && isInternal">选择对象</a-button>
    <ObjectSelectModal ref="objectModalRef" :title="modalTitle" :value="state.selected" :multiple="false" @enter="onSelectEnter"/>
  </div>
</template>
<script lang="tsx" setup>
import { ObjectSelectModal } from '@ghcloud/cube-app-design'
import { computed, inject, onMounted, reactive, ref, Ref } from 'vue'
import { FlowForm } from "@/domain/form-flow";

type SelectOption = {
  id: string;
  name: string;
  type: string;
}

const emits = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<{
  modelValue?: SelectOption | null;
  readonly?: boolean,
}>(), {
  modelValue: null,
  readonly: false,
})

const state=reactive<{
  selected: SelectOption[],
  searchValue: string;
}>({
  selected: [],
  searchValue: '',
})

const businessType = inject("businessType") as string;
const modalTitle = computed(() => {
  let name = ''
  if (businessType === 'FAULT') {
    name = '故障'
  } else if (businessType === 'HIDDENDANGER') {
    name = '隐患'
  }
  return '选择' + name + '对象'
})

const flowForm = inject("flowForm") as Ref<FlowForm>;
const isInternal = flowForm.value.callType === 'INTERNAL' //是否是内部表单,内部表单才能选择对象

const handleSearch = (value: string) => {
  if(value){
    if (value.length > 50){
      state.searchValue = value.substring(0, 50)
    } else {
      state.searchValue = value
    }
    state.selected = []
    const customValue = {
      id: 0,
      name: state.searchValue,
      type: 'CUSTOM',
      flowConvertData: false,
    }
    emits('update:modelValue', customValue)
  }
}

const handleChange = (val: string) => {
  state.selected = state.selected.filter((item: { id: string; }) => val.indexOf(item.id) > -1);
  emitValue()
};

const objectModalRef = ref<{ openModal: () => void; }>()

const openSelectModal=()=>{
  objectModalRef.value?.openModal()
}

const onSelectEnter=(value: SelectOption[])=>{
  state.selected = value
  state.searchValue = ''
  emitValue()
}

const emitValue=()=>{
  if(state.selected && state.selected.length > 0){
    const value = {
      ...state.selected[0],
      flowConvertData: false,
    }
    emits('update:modelValue', value)
  } else {
    emits('update:modelValue', null)
  }
}

onMounted(async () => {
  if(props.modelValue){
    if (props.modelValue.type === 'CUSTOM') {
      state.searchValue = props.modelValue.name
    }else {
      state.selected = [props.modelValue]
    }
  }
})
</script>
<style lang="less">.target-object-select {
  display: flex;
}</style>
