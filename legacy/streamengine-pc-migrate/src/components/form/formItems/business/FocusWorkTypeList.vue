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
import { getFocusWorkTypeList } from '@/api/official'
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
  if (!props.modelValue) {
    const res = await getFocusWorkTypeList()
    options.value = res
  }
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
