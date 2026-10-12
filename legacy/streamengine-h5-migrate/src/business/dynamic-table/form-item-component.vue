<template>
  <component
    :is="formItems[props.formOption.name] ?? componentNotFoundMessage"
    ref="componentRef"
    :formData="props.formData"
    :allFormData="allFormData"
    :form-option="props.formOption"
    v-bind="componentProps"
    :parentRowChain="parentRowChain"
  />
</template>

<script setup lang="ts">
import { computed, h, ref, shallowRef, watch } from "vue";

import { FormOption } from "../../domain/form-flow";
import { DynamicTableProcessType } from "./dynamic-table";
import { FormItemComponent, formItems } from "./form-item";

const props = defineProps<{
  formOption: FormOption;
  formData: Record<string, unknown>;
  echoMode?: boolean;
  processType: DynamicTableProcessType;
  readonly?: boolean;
  businessType?: string;
  allFormData?: any;
  callType: string;
  /** 组合容器嵌套时，自外向内分组行数据链，用于解析选项关联 */
  parentRowChain?: Record<string, unknown>[];
}>();

// 下层组件需要依赖的表单值的 key
const dependParamFormKeys = (() => {
  const { props: formFieldProps } = props.formOption;
  const paramsKeyMatchRE = /^params\d*$/;
  const paramKeys = Object.keys(formFieldProps).filter((k) => {
    return paramsKeyMatchRE.test(k);
  });
  paramKeys.sort();
  return paramKeys.map((k) => formFieldProps[k as "params"]!);
})();
let oldDependFormValues: any[] = [];
const validInput = ref(true);
const validationMessage = ref("");
const componentRef = shallowRef<FormItemComponent | null>(null);
const componentNotFoundMessage = computed(() => h("div", `尚未实现的表单元素[${props.formOption.title}:${props.formOption.name}]`));
const errorMessage = computed(() => (validInput.value ? "" : validationMessage.value || `请输入${props.formOption.title}`));

const calcComponentProps = () => {
  componentProps.value = Object.assign(
    {
      label: props.formOption.title,
      required: props.formOption.props.required,
      disabled: props.formOption.props.disabled,
      echoMode: props.echoMode,
      options: props.formOption.props.options,
      placeholder: props.formOption.props.placeholder,
      dependFormValues: dependParamFormKeys.map((k) => props.formData[k]),
      format: props.formOption.props.format,
      errorMessage,
      sponsorId: props.formData.sponsorId ?? null,
      name: props.formOption.name,
      processType: props.processType,
      readonly: props.readonly,
      config: props.formOption,
      businessType: props.businessType,
      callTyep: props.callType,
    },
    props.formOption.props,
  );
};
// 定义下层组件需要的所有参数
// TODO(danke): 使用 FormItemProps
const componentProps = ref<Record<string, unknown>>();
calcComponentProps();

// 监听数据改变
watch(
  () => props.formOption,
  () => {
    // 如果旧的关联参数和新的相同不进行赋值关联参数
    if (oldDependFormValues.join(",") === dependParamFormKeys.map((k) => props.formData[k]).join(",")) return;
    oldDependFormValues = dependParamFormKeys.map((k) => props.formData[k]);
    calcComponentProps();
  },
);
watch(
  dependParamFormKeys.map((k) => () => props.formData[k]),
  () => {
    if (componentProps.value) componentProps.value.dependFormValues = dependParamFormKeys.map((k) => props.formData[k]);
  },
  { deep: true },
);

watch(
  () => props.formData[props.formOption.id],
  (val) => {
    validator();
  },
);

defineExpose({
  validate: validator,
});

function validator() {
  // 这行代码导致组合组件的校验不生效
  // if(!props.formOption.show){
  //   return true
  // }
  if (!componentRef.value?.validate) {
    validInput.value = false;
    validationMessage.value = `请输入${props.formOption.title}`;
    return false;
  }
  const result = componentRef.value?.validate?.() ?? false;
  if (!props.formOption.props.required && props.formOption.name !== "GroupList" && typeof result !== "string") {
    validInput.value = true;
    validationMessage.value = "";
    return true;
  }
  validInput.value = typeof result === "string" ? false : result;
  validationMessage.value = typeof result === "string" ? result : "";
  return result;
}
</script>
