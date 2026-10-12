<template>
  <VanField
    :is-link="!props.readonly"
    :required="props.required"
    :model-value="selected?.name"
    readonly
    name="picker"
    :label="label"
    @click="showPicker = true"
    placeholder="请选择委外公司"
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
import { OutSourceService } from "../../../service/outsource";
import { PickerOption } from "vant";
import { computed, onMounted, ref, watch, watchEffect } from "vue";

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string; name: string };
  errorMessage?: string;
  dependFormValues: [string];
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

  emits("update:modelValue", selected.value);
  hidePicker();
}

watch(
  () => props.dependFormValues,
  async () => {
    const id = (props.dependFormValues[0][0] as any).id;
    const res = await OutSourceService.outsourceCompanyList(id);
    columns.value = res.map((item) => {
      return { text: item.name, value: item };
    });
  }
);
onMounted(async () => {
  const res = await OutSourceService.outsourceCompanyList("");
  columns.value = res.map((item) => {
    return { text: item.name, value: item };
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
