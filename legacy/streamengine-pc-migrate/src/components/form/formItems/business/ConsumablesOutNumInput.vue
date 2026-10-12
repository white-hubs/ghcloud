<template>
  <NumberInput :readonly="props.readonly" :min-num="1" v-model:model-value="value" :max-num="maxNum" />
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";

import NumberInput from "../NumberInput.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: number | null;
    readonly?: boolean;
    maxNum?: number;
    params?: string;
    formData: Record<string, any>;
  }>(),
  {
    modelValue: null,
  },
);
const emits = defineEmits(["update:modelValue"]);

const value = ref(props.modelValue);

watch(
  () => value.value,
  () => {
    emits("update:modelValue", value.value);
  },
);

const maxNum = computed(() => {
  const stock = props.formData.storeNum;
  const limit = props.params ? Number(props.formData[props.params]) : 0;
  const bounds: number[] = [];
  if (stock != null && stock !== "" && Number.isFinite(Number(stock))) bounds.push(Number(stock));
  if (Number.isFinite(limit) && limit > 0) bounds.push(limit);
  // 库存与限领同时生效，0 库存不能被当成未配置。
  return bounds.length ? Math.min(...bounds) : undefined;
});
</script>
