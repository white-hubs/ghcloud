<template>
  <VanField v-if="props.readonly" :label="props.label" :required="props.required" :model-value="selected" readonly />
  <template v-else>
    <VanField
      is-link
      readonly
      :label="props.label"
      :required="props.required"
      :model-value="selected"
      :placeholder="props.placeholder || '请选择作业等级'"
      :error-message="errorMessage"
      @click="showPicker = true"
    />
    <VanPopup v-model:show="showPicker" position="bottom">
      <VanPicker :columns="columns" @cancel="showPicker = false" @confirm="confirmPicker($event.selectedOptions)" />
    </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { PickerOption } from "vant";
import { computed, onMounted, ref, watch } from "vue";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { workPermitService, WorkPermitTypeName } from "../../../service/work-permit/work-permit";

const emits = defineEmits(["update:modelValue"]);
const props = defineProps<{
  modelValue?: string | null;
  required?: boolean;
  readonly?: boolean;
  label?: string;
  placeholder?: string;
  dependFormValues?: [WorkPermitTypeName | null];
}>();

const selected = ref<string | null>(null);
const showPicker = ref(false);
const columns = ref<{ text: string; value: string }[]>([]);
const validInput = ref(true);
const errorMessage = computed(() => (!validInput.value && props.required ? `请选择${props.label}` : ""));

const workPermitTypeName = computed(() => props.dependFormValues?.[0]?.typeName ?? null);

async function loadLevels() {
  const levels = await workPermitService.getLevels(workPermitTypeName.value ? { typeName: workPermitTypeName.value } : {});
  columns.value = levels.map((item) => ({ text: item, value: item }));
}

function confirmPicker(selectedOptions: PickerOption[]) {
  selected.value = String(selectedOptions[0]?.value || "");
  emits("update:modelValue", selected.value || null);
  showPicker.value = false;
}

watch(workPermitTypeName, async () => {
  selected.value = null;
  emits("update:modelValue", null);
  if (!props.readonly) {
    await loadLevels();
  }
});

watch(
  () => props.modelValue,
  (value) => {
    selected.value = value || null;
  },
  { immediate: true },
);

onMounted(loadLevels);

defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value;
    validInput.value = valid;
    return valid;
  },
});
</script>
