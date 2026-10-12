<template>
  <TextAreaInput v-model="work.name" :readonly="true" :label="props.label" placeholder="系统自动带入工作要求" />
</template>
<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { officialService } from "../../../service/official/official";
import { watch, ref } from "vue";
import TextAreaInput from "../../../component/basic/input/textarea-input.vue";
const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string; name: string };
  dependFormValues: any[];
  placeholder: string
}>();

const work = ref(props.modelValue ?? { id: "", name: "" });
const emits = defineEmits(["update:modelValue"]);
watch(
  () => props.dependFormValues,
  () => {
    getData();
  }
);
const getData = async () => {
  const params = {
    id: props.dependFormValues[0].id ?? "",
  };
  const res = await officialService.getFocusWorkListRequirement(params);
  work.value = res;
  emits("update:modelValue", res);
};

defineExpose<FormItemExpose>({
  validate: () => !!work.value,
});
</script>
