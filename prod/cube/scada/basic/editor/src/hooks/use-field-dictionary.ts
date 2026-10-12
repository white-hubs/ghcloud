import { computed, onMounted, ref } from "vue";

import { useEditorStore } from "../store/use-editor-store";

export type TagValueType = "number" | "boolean" | "string" | "unknown";

export interface TagOption {
  label: string;
  value: string;
  valueType: TagValueType;
}

export function useFieldDictionary() {
  const store = useEditorStore();
  const loading = ref(false);
  const loaded = ref(false);
  const apiUnavailable = ref(false);

  const pageTagOptions = computed<TagOption[]>(() =>
    store.pageTags.map((t) => ({
      label: t.label ?? t.name,
      value: t.name,
      valueType: t.type as TagValueType,
    })),
  );

  const serverOptions = ref<TagOption[]>([]);

  const options = computed<TagOption[]>(() => {
    const nameSet = new Set(pageTagOptions.value.map((o) => o.value));
    return [...pageTagOptions.value, ...serverOptions.value.filter((o) => !nameSet.has(o.value))];
  });

  const optionMap = computed(() => {
    const map = new Map<string, TagOption>();
    for (const option of options.value) {
      map.set(option.value, option);
    }
    return map;
  });

  function getValuePlaceholder(tag?: string) {
    const option = tag ? optionMap.value.get(tag) : undefined;
    if (!option) return "输入值（例如: 1 / true / hello）";
    if (option.valueType === "number") return "输入数字值（例如: 1）";
    if (option.valueType === "boolean") return "输入布尔值（例如: true）";
    if (option.valueType === "string") return "输入字符串值";
    return "输入值（例如: 1 / true / hello）";
  }

  // Tag dictionary is sourced from page-level TagRegistry only.
  // No server endpoint is called — the /api/tags/dictionary endpoint was removed
  // as part of the design-time / runtime decoupling (realtime module deleted).
  async function load() {
    loaded.value = true;
  }

  onMounted(() => {
    void load();
  });

  return {
    loading,
    loaded,
    options,
    load,
    getValuePlaceholder,
    apiUnavailable,
  };
}
