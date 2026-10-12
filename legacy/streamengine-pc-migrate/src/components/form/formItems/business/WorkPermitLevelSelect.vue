<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";

import { getWorkPermitLevels } from "@/api/work-permit";

type WorkPermitTypeValue = {
  typeName?: string;
  name?: string;
};

const resolveWorkPermitTypeName = (value: unknown): string | null => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    const typed = value as WorkPermitTypeValue;
    return typed.typeName || typed.name || null;
  }
  return null;
};

const emits = defineEmits(["update:modelValue", "clearValidate"]);
const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    readonly?: boolean;
    placeholder?: string;
    formData?: Record<string, any>;
    params?: string | null;
  }>(),
  {
    modelValue: null,
    readonly: false,
    placeholder: "请选择作业等级",
    formData: () => ({}),
    params: null,
  },
);

const loading = ref(false);
const options = ref<string[]>([]);
const readonlyText = computed(() => props.modelValue || "--");

const workPermitTypeName = computed(() => {
  const value = props.params ? props.formData?.[props.params] : null;
  return resolveWorkPermitTypeName(value);
});

const normalizeOptions = (res: any): string[] => {
  if (Array.isArray(res)) {
    return res;
  }
  if (Array.isArray(res?.data)) {
    return res.data;
  }
  return [];
};

const loadLevels = async () => {
  loading.value = true;
  try {
    const params = workPermitTypeName.value ? { typeName: workPermitTypeName.value } : undefined;
    options.value = normalizeOptions(await getWorkPermitLevels(params));
  } finally {
    loading.value = false;
  }
};

const handleChange = (value?: string) => {
  emits("update:modelValue", value || null);
  emits("clearValidate");
};

watch(workPermitTypeName, () => {
  emits("update:modelValue", null);
  if (!props.readonly) {
    loadLevels();
  }
});

onMounted(() => {
  if (!props.readonly) {
    loadLevels();
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
    :value="props.modelValue"
    show-search
    allow-clear
    :loading="loading"
    :placeholder="props.placeholder"
    @change="handleChange"
  >
    <a-select-option v-for="item in options" :key="item" :value="item">
      {{ item }}
    </a-select-option>
  </a-select>
</template>

<style lang="less" scoped>
.work-permit-select {
  width: 100%;
}
</style>
