<template>
  <CubeLoading :visible="loading" />
  <div v-if="!loading" class="dynamic-table">
    <div class="form">
      <div class="form-box">
        <div class="form-items">
          <template v-for="(option, index) in formOptions.filter((item) => item.show)" :key="option.id">
            <FormItem
              ref="formItemComponentRef"
              v-model="formData[option.id]"
              :form-data="formData"
              :flow-json="formFlowInstance?.properties.processJson"
              :form-option="option"
              :process-type="DynamicTableProcessType.HANDLING"
              v-if="formItemPermission(option).show"
              :readonly="formItemPermission(option).readonly"
              :businessType="businessType"
              :callType="'INTERNAL'"
            />
          </template>
        </div>
      </div>
    </div>
    <DynamicTableOperate
      :addFileIds="addFileIds"
      :operateAlias="operateAlias"
      :process-id="props.processId"
      :form-flow-process="formFlowInstance"
      :form-data="formData"
      v-if="formFlowInstance && route.query.isLogin !== 'false'"
      :form-item-component-ref="formItemComponentRef"
      :businessType="businessType"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { FormFlowInstance, FormOption } from "../../domain/form-flow";
import { endTask } from "../../infrastructure/close";
import { getPermission } from "../../service/form-flow/form-flow.hook";
import { formFlowService } from "../../service/form-flow/form-flow.service";
import CubeLoading from "./component/cube-loading.vue";
import { DynamicTableProcessType } from "./dynamic-table";
import DynamicTableOperate from "./dynamic-table-operate.vue";
import { FormItemComponent } from "./form-item";
import FormItem from "./form-item-component.vue";
import { mapFormOptionsWithShowTree, resolveRelateParamValue, shouldShowByRelateParams } from "./relate-params";

const props = defineProps<{
  processId: string;
}>();
const loading = ref(true);
const formFlowInstance = ref<FormFlowInstance>();
const initFormOptions = ref<FormOption[]>([]);
const formData = ref<Record<string, unknown>>({});
const formItemComponentRef = ref<FormItemComponent[] | null>(null);
const businessType = ref("");

const formItemPermission = computed(() => {
  return function (item: FormOption) {
    const res = getPermission(item, formFlowInstance.value?.properties.processJson, formFlowInstance.value?.key ?? "");
    return res;
  };
});

/** 预警记录不落库，只读时仍需展示并实时查询；时间区间等字段走表单副本 */
const READONLY_ALWAYS_SHOW_COMPONENTS = ["AlarmRecords"];

const hasDisplayValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && value !== "";
};

const getParamsHandler = (item: FormOption, rowChain?: Record<string, unknown>[]) => {
  if (!item.props?.relateParams) {
    //不为外部表单，不展示外部人员联系方式
    if (item.name === "OutsiderConcat") {
      return formFlowInstance.value?.processInstanceRunningInfo?.outSider ? true : false;
    }
    //只读并且没有值，不展示
    if (formItemPermission.value(item).readonly) {
      if (READONLY_ALWAYS_SHOW_COMPONENTS.includes(item.name)) {
        return true;
      }
      return hasDisplayValue(resolveRelateParamValue(item.id, rowChain, formData.value));
    }
    //驳回和撤销使用上个节点的展示状态
    const status = formFlowInstance.value?.processInstanceRunningInfo.status ?? "";
    const formPerms = formFlowInstance.value?.processInstanceRunningInfo.formPerms as { perm: string; id: string }[];
    if (["REJECT", "UNDO"].includes(status)) {
      const perm = formPerms.find((x: { id: string }) => x.id === item.id)?.perm;
      return perm === "H" ? false : true;
    }
    return true;
  }
  return shouldShowByRelateParams(item, initFormOptions.value, formData.value, rowChain);
};

provide("evaluateFormItemShow", getParamsHandler);

const operateAlias = ref();
// 获取初始文件
const initFileIds = ref();
const addFileIds = ref();
const route = useRoute();
onMounted(async () => {
  try {
    const instance = await formFlowService.getFormFlowProcess(props.processId);
    sessionStorage.setItem("instance", JSON.stringify(instance));
    formFlowInstance.value = instance;
    initFormOptions.value = JSON.parse(instance.properties.formJson);
    businessType.value = instance.businessType;
    operateAlias.value = instance.processInstanceRunningInfo.operateAlias ?? [];
    operateAlias.value.forEach((x: any) => {
      if (!x.perm) {
        x.perm = "S";
      }
    });
    formData.value = JSON.parse(instance.data);
    initFileIds.value = getFileIds(formData.value, initFormOptions.value);
    initFormOptions.value.forEach((item) => {
      if (!Object.keys(formData.value).includes(item.id)) {
        formData.value[item.id] = null;
      }
    });
    loading.value = false;
  } catch (err) {
    loading.value = false;
    endTask();
  }
});
onUnmounted(() => {
  sessionStorage.removeItem("instance");
});
const formOptions = computed(() => {
  return mapFormOptionsWithShowTree(initFormOptions.value, (item) => getParamsHandler(item));
});

watch(
  () => formData.value,
  () => {
    const resultFileIds = getFileIds(formData.value, initFormOptions.value);
    addFileIds.value = resultFileIds.filter((item) => !initFileIds.value.includes(item));
  },
  { deep: true },
);
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
</script>

<style scoped lang="less">
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.dynamic-table {
  height: 100vh;
  width: 100vw;
  background-color: #f3f7fa;
  display: flex;
  flex-direction: column;
  position: relative;

  .form {
    height: calc(100% - 66px);
    width: 100%;
    overflow: auto;

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
}
</style>
