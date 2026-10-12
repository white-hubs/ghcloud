<template>
  <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
    placeholder="请选择考核结果" :disabled="readonly">
    <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">{{ item.name }}</a-select-option>
  </a-select>
</template>
<script lang="ts" setup>
import { getFormControlEnum } from '@/api/personnel'
import { onMounted, ref } from 'vue'
type EnumOption = {
  id: string | number;
  name: string;
}

const props = withDefaults(defineProps<{
  modelValue?: { id: string, name: string } | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false
})

const options = ref<EnumOption[]>([]);
const value = ref(props.modelValue ? props.modelValue.id : null)
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  if (index !== -1) {
    emits('update:modelValue', options.value[index])
  }
};

onMounted(async () => {
  const res = await getFormControlEnum('assessResult')
  options.value = res
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
