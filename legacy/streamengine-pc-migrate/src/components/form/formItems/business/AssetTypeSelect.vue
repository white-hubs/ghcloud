<template>
  <div>
    <a-tree-select v-if="!props.readonly" ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择资产类别" :disabled="readonly" :field-names="{ label: 'name', value: 'id' }" :tree-data="options">
    </a-tree-select>
    <span v-else>{{ props.modelValue?props.modelValue.name:'' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { getAssemblyClassifyTree } from '@/api/property'
import { onMounted, ref } from 'vue';
type IdName = {
  id: string;
  name: string;
}

const props = withDefaults(defineProps<{
  modelValue?: IdName | null;
  readonly?: boolean;
}>(), {
  modelValue: null,
  readonly: false,
})

const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])
const options=ref<unknown[]>([])
const handleChange = (val:string,selectedOptions:string[]) => {
  const res={id:val,name:selectedOptions[0]}
  emits('update:modelValue', res)
};
onMounted(()=>{
  if(!props.readonly){
    getAssemblyClassifyTree({ type: "assetType" }).then((res) => {
      options.value = res;
    })
  }
})

</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
