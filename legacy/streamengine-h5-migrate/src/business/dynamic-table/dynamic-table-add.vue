<template>
  <CubeLoading :visible="loading" />
  <div v-if="!loading" class="dynamic-table">
    <div class="form">
      <div class="form-box">
        <div class="form-items">
          <template v-for="option in formOptions.filter((item) => item.show)" :key="option.id">
            <FormItem
              ref="formItemComponentRef"
              v-model="formData[option.id]"
              :form-data="formData"
              :allFormData="formData"
              :form-option="option"
              :process-type="DynamicTableProcessType.ADD"
              :flow-json="formFlowConfig?.flowJson"
              v-if="formItemPermission(option).show"
              :readonly="formItemPermission(option).readonly"
              :businessType="props.businessType"
              :callType="formFlowConfig?.callType ?? 'INTERNAL'"
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
import { computed, inject, onMounted, provide, reactive, ref } from "vue";
import { watch } from "vue";
import { useRoute } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getApiBaseUrL } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import { FormFlow, FormOption, FormProcessOperate } from "../../domain/form-flow";
import { closePage, endTask } from "../../infrastructure/close";
import { attendanceService } from "../../service/attendance/attendance.service";
import { getPermission } from "../../service/form-flow/form-flow.hook";
import { formFlowService } from "../../service/form-flow/form-flow.service";
import { staffService } from "../../service/staff/staff.service";
import { usePageTitle } from "../initiating-work-order/use-page-title";
import CubeLoading from "./component/cube-loading.vue";
import { DynamicTableProcessType } from "./dynamic-table";
import { FormItemComponent } from "./form-item";
import FormItem from "./form-item-component.vue";
import { mapFormOptionsWithShowTree, shouldShowByRelateParams } from "./relate-params";

const props = defineProps<{
  businessType: string;
  processId?: string;
}>();
const emits = defineEmits(["submit"]);
const loading = ref(true);
const formFlowConfig = ref<FormFlow>();
const formOptions = ref<FormOption[]>([]);
const initFormOptions = ref<FormOption[]>([]);
const formData = reactive<Record<string, unknown>>({});
const formItemComponentRef = ref<FormItemComponent[] | null>(null);
const isChildrenComponent = inject("isChildrenComponent") as boolean;
const repeatFlow = ref(false);
const route = useRoute();

const addAlias = computed(() => {
  try {
    const operates = JSON.parse(formFlowConfig.value?.flowJson ?? "{}")?.props?.operateAlias ?? [];
    const operate = operates.find((item: { code?: FormProcessOperate }) => item.code === FormProcessOperate.ADD);
    return operate?.alias || operate?.name || "发起申请";
  } catch {
    return "发起申请";
  }
});

// 使用 Composable 共享状态更新页面标题
const { updatePageTitle } = usePageTitle();

const formItemPermission = computed(() => {
  return function (item: FormOption) {
    const res = getPermission(item, formFlowConfig.value?.flowJson, "root");
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
  await initFormData();
  loading.value = false;

  async function initFlowForm() {
    const data = await formFlowService.getFormFlow(props.businessType);
    formFlowConfig.value = data;
    initFormOptions.value = JSON.parse(data.formJson);
    handleFormOptions();

    if (data.businessTypeName) {
      updatePageTitle(data.businessTypeName);
    }
  }
  async function initFormData() {
    try {
      // 默认需要将表单发起人 id 填入最终提交的表单中
      const user = await staffService.getCurrentUser();
      formData.sponsorId = user.id;
      await checkedRepeatData();
    } catch (error) {}
  }
});
/** 再次发起数据校验 */
const checkedRepeatData = async () => {
  if (!props.processId) return;
  let businessData = null;
  businessData = JSON.parse(sessionStorage.getItem("flowProcessReapplyData") as string);
  if (businessData && businessData.flowRepeatFormData) {
    repeatFlow.value = true;
    const repeatData = businessData.flowRepeatFormData as Record<string, unknown>;
    formOptions.value.forEach((e) => {
      if (formItemPermission.value(e).show && repeatData[e.id] && e.name !== "SponsorInput") {
        formData[e.id] = repeatData[e.id];
      }
    });
  }
};

const handleFormOptions = () => {
  formOptions.value = mapFormOptionsWithShowTree(initFormOptions.value, (item) =>
    shouldShowByRelateParams(item, initFormOptions.value, formData),
  );
};
const submitting = ref(false);
//获取文件ID
const getFileIds = (formData: any, options: FormOption[]) => {
  const iniIds: string[] = [];
  const uploadCompsId = options.find((x: any) => x.name === "FileUpload")?.id ?? "";
  Object.keys(formData).find((x) => {
    if (x === uploadCompsId) {
      formData[x]?.forEach((x: { id: string }) => {
        iniIds.push(x.id);
      });
      return formData[x];
    }
  });
  return iniIds;
};
async function submit() {
  if (submitting.value) {
    return;
  }
  submitting.value = true;
  if (validateForm()) {
    try {
      //考勤业务发起前校验
      const CheckParams = {
        formId: formFlowConfig.value!.formDefinitionId,
        formData: JSON.stringify(formData),
      };
      if (props.businessType === "CHANGE_CLASSES") {
        await attendanceService.postClassesChangeCheck(CheckParams);
      } else if (props.businessType === "REPAIR_CLOCK") {
        await attendanceService.postClockRepairCheck({ businessType: props.businessType, flowData: CheckParams });
      }
      const flowTaskId = await formFlowService.submitForm(props.businessType, formFlowConfig.value!, formData);
      const appBusinessData = getEnvironment() === "cubeApp" ? await cubeAppService.getBusinessData() : {};
      // 隐藏排查、故障报修特殊流程
      if (["FAULT", "HIDDENDANGER"].includes(props.businessType)) {
        if (appBusinessData && appBusinessData.business_source && appBusinessData.business_source !== "MANUAL_SUBMISSION") {
          try {
            closePage(flowTaskId, false);
            return;
          } catch (error) {}
        }
      }
      closePage(flowTaskId, isChildrenComponent);
    } catch (error) {
      showToast("发起失败");
    } finally {
      submitting.value = false;
      endTask();
    }
  } else {
    submitting.value = false;
    showToast("请检查表单项");
  }
}

function validateForm() {
  let result = true;
  formItemComponentRef.value?.forEach((item) => {
    const res = item.validate?.();
    if (typeof res === "string" || res === false) {
      result = false;
    }
  });
  return result;
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
  position: relative;
  height: 100vh;
  width: 100vw;
  background-color: #f3f7fa;
  display: flex;
  flex-direction: column;

  .form {
    width: 100%;
    overflow: auto;
    height: calc(100vh - 66px);

    .form-box {
      padding: 12px;

      .form-items {
        overflow: auto;
        border-radius: 6px;

        :deep(.van-field__label) {
          font-weight: bold;
        }
      }
    }
  }

  .option {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 12px;
    height: 56px;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);
  }
}
</style>
