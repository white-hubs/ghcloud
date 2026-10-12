<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";

import { getWorkPermitTypeNames } from "@/api/work-permit";

type WorkPermitTypeOption = {
  id?: string | number;
  typeName?: string;
  name?: string;
};

type WorkPermitTypeValue = {
  id: string | number;
  typeName: string;
};

const emits = defineEmits(["update:modelValue", "clearValidate"]);
const props = withDefaults(
  defineProps<{
    modelValue?: WorkPermitTypeValue | null;
    readonly?: boolean;
    placeholder?: string;
  }>(),
  {
    modelValue: null,
    readonly: false,
    placeholder: "请选择作业类型",
  },
);

const loading = ref(false);
const options = ref<WorkPermitTypeOption[]>([]);

const selectedId = computed(() => props.modelValue?.id);
const readonlyText = computed(() => props.modelValue?.typeName || "--");

const normalizeOptions = (res: any): WorkPermitTypeOption[] => {
  if (Array.isArray(res)) {
    return res;
  }
  if (Array.isArray(res?.data)) {
    return res.data;
  }
  if (Array.isArray(res?.records)) {
    return res.records;
  }
  return [];
};

const searchTypes = async (keyword = "") => {
  loading.value = true;
  try {
    options.value = normalizeOptions(await getWorkPermitTypeNames({ typeName: keyword }));
  } finally {
    loading.value = false;
  }
};

const handleChange = (id?: string | number) => {
  const item = options.value.find((option) => option.id === id);
  emits("update:modelValue", item && item.id !== undefined ? { id: item.id, typeName: item.typeName || item.name || "" } : null);
  emits("clearValidate");
};

watch(
  () => props.modelValue,
  (value) => {
    if (value?.id && !options.value.some((item) => item.id === value.id)) {
      options.value = [value, ...options.value];
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!props.readonly) {
    searchTypes();
  }
});

defineExpose({
  validator: () => Promise.resolve(),
});
</script>

<template>
  <span v-if="props.readonly">{{ readonlyText }}</span>
  <a-select
    v-else
    class="work-permit-select"
    :value="selectedId"
    show-search
    allow-clear
    :filter-option="false"
    :loading="loading"
    :placeholder="props.placeholder"
    @search="searchTypes"
    @change="handleChange"
  >
    <a-select-option v-for="item in options" :key="item.id" :value="item.id">
      {{ item.typeName || item.name }}
    </a-select-option>
  </a-select>
</template>

<style lang="less" scoped>
.work-permit-select {
  width: 100%;
}
</style>
