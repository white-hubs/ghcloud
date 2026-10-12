<template>
  <a-cascader ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
    placeholder="请选择区域" v-if="!props.readonly" :options="options" change-on-select
    :fieldNames="{ label: 'name', value: 'id', children: 'children' }">
  </a-cascader>
  <span v-else>{{ props.modelValue?.name || '--' }}</span>
</template>
<script lang="ts" setup>
import { getAreaList } from '@/api/property/index';
import { onMounted, ref } from 'vue'

type OfficialSeal = {
  id: string;
  name: string;
  children?:OfficialSeal;
}

const props = withDefaults(defineProps<{
  modelValue?: OfficialSeal | null;
  readonly?: boolean
  api:string
}>(), {
  modelValue: null,
  readonly: false,
  api:''
})

const options = ref<OfficialSeal[]>([]);
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])


const handleChange = (val: string[]) => {
  let res = []
  let _options: { id: string; name: string; children?: unknown[] }[] | { [x: string]: any; }[] = [];
  for (let index = 0; index < val.length; index++) {
    if (index == 0) {
      _options = options.value ?? []
    }
    if (_options.length === 0) {
      break;
    }

    const id = val[index];
    const findIndex: number = _options.findIndex((e: { [x: string]: any; }) => e.id === id)
    if (findIndex === -1) {
      break;
    }
    res.push(_options[findIndex].name)
    _options = _options[findIndex].children ?? []
  }

  const modelValue={
    id:val,
    name:res.join('/')
  }
  emits('update:modelValue', modelValue)
};

onMounted(async () => {
    const api=props.api!==''?props.api:'/mdata/area/list'
    const res = await getAreaList(api)
    options.value = res
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
