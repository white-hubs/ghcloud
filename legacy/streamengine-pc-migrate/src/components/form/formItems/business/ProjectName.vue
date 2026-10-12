<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择工程名称" :disabled="props.readonly" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <a-input disabled :value="props.modelValue?.name" v-else></a-input>
  </div>
</template>
<script lang="ts" setup>
import { projectNameList } from '@/api/smallScattered';
import { onMounted, ref } from 'vue'

type CommonType = {
  id: string;
  name: string; 
}

const props = withDefaults(defineProps<{
  modelValue?: CommonType | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false,
})

const options = ref<CommonType[]>([]);
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};

onMounted(async () => {
  if (!props.readonly) {
    const res = await projectNameList()
    options.value = res.map((item: { ApplyId: string; projectName: string })=>{
      return {
        id:item.ApplyId,
        name:item.projectName,
      }
    })
  }
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
