<template>
  <VanField
    :is-link="!props.readonly"
    :required="props.required"
    :model-value="selected?.name"
    readonly
    name="picker"
    :label="label"
    @click="showPicker = true"
    placeholder="请选择处理结果"
    :error-message="errorMessage"
    :disabled="props.readonly"
  />
  <VanPopup v-model:show="showPicker" position="bottom" v-if="!props.readonly">
    <VanPicker
      :columns="columns"
      @cancel="hidePicker"
      @confirm="confirmPicker($event.selectedOptions)"
    />
  </VanPopup>
</template>
<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { PickerOption } from "vant";
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string; name: string };
  errorMessage?: string;
}>();
const columns = ref();
const showPicker = ref(false);
const selected = ref();
const emits = defineEmits(["update:modelValue"]);
function hidePicker() {
  showPicker.value = false;
}

function confirmPicker(selectedOptions: PickerOption[]) {
  selected.value = selectedOptions[0].value;

  selected.value.name = selected.value.projectName;
  selected.value.id = selected.value.ApplyId;
  emits("update:modelValue", selected.value);
  hidePicker();
}

onMounted(async () => {
  const list = [
    {
      ApplyId: "UNRESOLVED",
      projectName: "未解决",
    },
    {
      ApplyId: "RESOLVED",
      projectName: "已解决",
    },
  ];
  columns.value = list.map((item) => {
    return { text: item.projectName, value: item };
  });
  if (props.modelValue) {
    selected.value = props.modelValue;
  }
});

const validInput = ref(true);
const errorMessage = computed(() => {
  return !validInput.value && props.required ? `请选择${props.label}` : "";
});
const validate = () => {
  const valid = !!selected.value;
  validInput.value = valid;
  return valid;
};
defineExpose<FormItemExpose>({
  validate,
});
</script>
