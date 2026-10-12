<template>
  <span v-if="props.readonly">{{ props.modelValue?.name || '--' }}</span>
  <a-select v-else ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input" placeholder="请选择职位">
    <a-select-option :value="item.id" v-for="(item, i) in options" :key="i" :disabled="!item.enabled">
      {{ item.name }}
    </a-select-option>
  </a-select>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { getPositionList } from "@/api/ouaa";
type Position = {
  id: string;
  name: string;
  enabled: boolean;
  remark: string;
}

const props = withDefaults(defineProps<{
  modelValue?: Position | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false,
})

const options = ref<Position[]>([]);
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};

onMounted(async () => {
  if (!props.readonly) {
    const res = await getPositionList({enabled:true})
    options.value = res
  }
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
