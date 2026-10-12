<template>
  <CubeLoading :visible="loading" />
  <div v-if="!loading" class="dynamic-table" @touchstart="startTouch" @touchend="clearTouch">
    <div class="form">
      <div class="form-box">
        <div class="form-items">
          <template v-for="(option, index) in formOptions.filter((item) => item.show)" :key="option.id">
            <FormItem
              :flow-json="formFlowConfig?.flowJson"
              ref="formItemComponentRef"
              v-model="formData[option.id]"
              :form-data="formData"
              :form-option="option"
              :process-type="DynamicTableProcessType.ADD"
              v-if="formItemPermission(option).show"
              :readonly="formItemPermission(option).readonly"
              :callType="formFlowConfig?.callType ?? 'EXTERNAL'"
            />
          </template>
        </div>
      </div>
    </div>
    <div class="option">
      <VanButton :loading="submitting" type="primary" block size="small" @click="submit">
        {{ addAlias }}
      </VanButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from "vant";
import { computed, onMounted, provide, reactive, ref } from "vue";
import { watch } from "vue";

import { getApiBaseUrL } from "@ghcloud/cube-app-js-sdk";

import CubeLoading from "../../../business/dynamic-table/component/cube-loading.vue";
import { DynamicTableProcessType } from "../../../business/dynamic-table/dynamic-table";
import { FormItemComponent } from "../../../business/dynamic-table/form-item";
import FormItem from "../../../business/dynamic-table/form-item-component.vue";
import { FormFlow, FormOption, FormProcessOperate } from "../../../domain/form-flow";
import { getPermission } from "../../../service/form-flow/form-flow.hook";
import { formFlowService } from "../../../service/form-flow/form-flow.service";
import { mapFormOptionsWithShowTree, shouldShowByRelateParams } from "../../dynamic-table/relate-params";
const props = defineProps<{
  businessType: string;
}>();
const emit = defineEmits(["success"]);
const loading = ref(true);
const formFlowConfig = ref<FormFlow>();
const formOptions = ref<FormOption[]>([]);
const initFormOptions = ref<FormOption[]>([]);
const formData = reactive<Record<string, any>>({});
const formBaseData = reactive({ user: "", phone: "" });
const formItemComponentRef = ref<FormItemComponent[] | null>(null);
const addAlias = computed(() => {
  try {
    const operates = JSON.parse(formFlowConfig.value?.flowJson ?? "{}")?.props?.operateAlias ?? [];
    const operate = operates.find((item: { code?: FormProcessOperate }) => item.code === FormProcessOperate.ADD);
    return operate?.alias || operate?.name || "发起申请";
  } catch {
    return "发起申请";
  }
});
const formItemPermission = computed(() => {
  return function (item: FormOption) {
    const res = getPermission(item, formFlowConfig.value?.flowJson, "root", formFlowConfig.value?.callType ?? "INTERNAL");
    return res;
  };
});

const evaluateFormItemShow = (item: FormOption, rowChain?: Record<string, unknown>[]) =>
  shouldShowByRelateParams(item, initFormOptions.value, formData, rowChain);

provide("evaluateFormItemShow", evaluateFormItemShow);

watch(
  () => formData,
  () => {
    handleFormOptions();
  },
  { deep: true },
);

onMounted(async () => {
  await initFlowForm();
  loading.value = false;

  async function initFlowForm() {
    const data = await formFlowService.getPublicFormFlow(props.businessType);
    formFlowConfig.value = data;
    initFormOptions.value = JSON.parse(data.formJson);
    handleFormOptions();
  }
});
//表单项
const handleFormOptions = () => {
  formOptions.value = mapFormOptionsWithShowTree(initFormOptions.value, (item) => {
    if (item.name === "OutsiderConcat") {
      item.props.required = true;
    }
    return shouldShowByRelateParams(item, initFormOptions.value, formData);
  });
};
const submitting = ref(false);
//发起申请
async function submit() {
  if (submitting.value) {
    return;
  }
  if (await validateForm()) {
    formOptions.value.forEach((x) => {
      if (x.name === "OutsiderConcat") {
        formBaseData.user = formData[x.id]?.name ?? "";
        formBaseData.phone = formData[x.id]?.tel ?? "";
      }
    });
    submitting.value = true;
    try {
      await formFlowService.submitPublicForm(props.businessType, formFlowConfig.value!, formData, formBaseData);
      submitting.value = false;
      emit("success", true);
    } catch (error) {
      showToast("发起失败");
    } finally {
      submitting.value = false;
    }
  }
  submitting.value = false;
}
//表单校验
async function validateForm() {
  let result = true;
  formItemComponentRef.value?.forEach(async (item) => {
    if (!item.validate?.()) {
      result = false;
    }
  });
  return result;
}

const touchFlag = ref();
function startTouch() {
  clearTimeout(touchFlag.value);
  touchFlag.value = setTimeout(() => {
    alert(`baseApiURL：${getApiBaseUrL() ?? "/api"}`);
  }, 10000);
}
function clearTouch() {
  clearTimeout(touchFlag.value);
}
</script>

<style lang="less" scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.dynamic-table {
  height: 94vh;
  width: 100vw;
  background-color: #f3f7fa;
  display: flex;
  flex-direction: column;

  .form {
    width: 100%;
    height: calc(100% - 66px);
    overflow: auto;

    .form-box {
      padding: 12px;

      .form-items {
        overflow: auto;
        border-radius: 6px;
      }
    }
  }

  .option {
    display: flex;
    align-items: center;
    padding: 12px;
    height: 66px;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);
  }
}
</style>
