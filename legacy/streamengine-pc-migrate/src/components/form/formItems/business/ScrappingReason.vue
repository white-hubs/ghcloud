<template>
  <span v-if="props.readonly">{{ props.modelValue?.name || '--' }}</span>
  <a-select v-else ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input" placeholder="请选择">
    <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
      {{ item.name }}
    </a-select-option>
  </a-select>
</template>
<script lang="ts" setup>
import { getAssemblyClassify } from '@/api/property/index';
import { onMounted, ref } from 'vue'

type OfficialSeal = {
  id: string;
  name: string;
}

const props = withDefaults(defineProps<{
  modelValue?: OfficialSeal | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false,
})

const options = ref<OfficialSeal[]>([]);
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};

onMounted(async () => {
  if (!props.readonly) {
    const res = await getAssemblyClassify({type:'reasonForScrapping'})
    options.value = res.records
  }
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
