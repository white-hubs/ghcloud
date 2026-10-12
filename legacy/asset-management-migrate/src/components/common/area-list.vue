<template>
  <Cascader
    v-model:value="value" placeholder="请选择" :field-names="{ label: 'name', value: 'id', children: 'children' }"
    :options="areaOptions" allow-clear show-search change-on-select
    @change="onChange"
  />
</template>
<script setup lang="ts">
import { getAreaList } from '@/api/ouaa/ouaa'
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    value:(string | number)[];
  }>(),
  {

  }
);

const emits = defineEmits(['update:value']);

const areaOptions = ref<{id:string; name:string;}[]>([])
const value = ref(props.value ?? [])

onMounted(() => {
  // 区域
  getAreaList().then(res => {
    if (res.data) {
      areaOptions.value = res.data
    }
  })
})

const onChange = () => {
  emits('update:value', value.value)
}
</script>
