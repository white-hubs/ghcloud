<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择" :disabled="readonly" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?.name || '--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { getFaultTypeList } from '@/api/fault'
import { inject, onMounted, ref } from 'vue'

type OfficialSeal = {
  id: string;
  name: string;
}

const businessType =  inject('businessType') as string

const props = withDefaults(defineProps<{
  modelValue?: OfficialSeal | null;
  readonly?: boolean,
  config: any
}>(), {
  modelValue: null,
  readonly: false,
  config:{
    title:'故障类型'
  }
})

const options = ref<OfficialSeal[]>([]);
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};

onMounted(async () => {
    const res = await getFaultTypeList(businessType)
    options.value = res
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
