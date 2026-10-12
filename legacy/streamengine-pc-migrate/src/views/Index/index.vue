<template>
  <div class="render-content">
    <a-empty v-if="error" :description="errorMessage" />
    <template v-else>
      <a-spin v-if="!initialized" class="index-spin" size="large" />
      <GLayout :title="title + '-' + (processType === ProcessType.ADD ? '新增' : '详情')" v-else>
        <template #header-btn>
          <a-button type="primary" @click="printRef.print()">打印</a-button>
        </template>
        <template #content-table>
          <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane :key="1" tab="表单信息">
              <FormRender ref="formRenderRef" />
            </a-tab-pane>
            <a-tab-pane :key="2" tab="处理进度">
              <Process ref="formProcess" :activeTab="activeKey" />
            </a-tab-pane>
          </a-tabs>
          <!--打印区域-->
          <PrintPage ref="printRef" />
        </template>
        <template #footer-page>
          <Operates
            :form-render-ref="formRenderRef"
            :form-process="formProcess"
            :notOperates="notOperates === 'true' ? true : false"
            @change-tab="changTab"
          />
        </template>
      </GLayout>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
import { useRoute } from "vue-router";

import { ApplicationGroup } from "../../../../../prod/cube/apps/ouaa/service/src/type";
import { ProcessRoute, ProcessType } from "../../typings/process";
import { getFormFlowBusiness, getProcessTaskForm } from "@/api/flow";
import { cubeOuaaService } from "@/api/service";
import GLayout from "@/components/common/gLayout.vue";
import PrintPage from "@/components/form/components/PrintPage.vue";
import FormRender from "@/components/form/FormRender.vue";
import Operates from "@/components/form/Operates.vue";
import Process from "@/components/form/Process.vue";
import { CurrentTaskDetail, FlowForm } from "@/domain/form-flow";

//url参数
const {
  query: { type: processType, businessType, processInstanceId: processId, appName, title, notOperates = "" },
} = useRoute() as ProcessRoute;
const printRef = ref();
const formRenderRef = ref();
const formProcess = ref();
const initialized = ref(false);
const activeKey = ref(1);
const error = ref(false);
const errorMessage = computed(() => {
  if (error.value) {
    return "当前表单异常，请联系管理员";
  }
  return "";
});

const currentUser = ref(); //当前用户
//通过id获取用户
const initUserInfo = async () => {
  let userID = sessionStorage.getItem("GH-Token") ? JSON.parse(sessionStorage.getItem("GH-Token") as string)?.id : null;
  if (!userID) {
    userID = sessionStorage.getItem("GH-UserInfo") ? JSON.parse(sessionStorage.getItem("GH-UserInfo") as string)?.id : null;
  }
  currentUser.value = { id: userID };
};

/*获取当前任务的详情*/
const currentTaskDetail = ref<CurrentTaskDetail>();
const getTaskDetail = async () => {
  if (processType === ProcessType.DETAIL) {
    const res = await getProcessTaskForm({ id: processId as string });
    currentTaskDetail.value = res;
  }
};
//获取应用
const apps = ref<ApplicationGroup[]>([]);
const getApplication = async () => {
  const data = (await cubeOuaaService.getApplicationGroups()) ?? [];
  toListApps(data);
};
const toListApps = (data: any[]) => {
  data.forEach((x: ApplicationGroup) => {
    if (x?.applicationPageVOS?.length > 0) {
      toListApps(x?.applicationPageVOS);
    } else {
      apps.value.push(x);
    }
  });
};
/*获取流引擎配置的数据*/
const flowForm = ref<FlowForm>();
const getFlowFormData = async () => {
  const res = await getFormFlowBusiness({
    businessType: businessType as string,
  });
  flowForm.value = res as FlowForm;
};

onMounted(async () => {
  await initUserInfo();
  await getFlowFormData();
  if (processType === ProcessType.DETAIL) {
    await getTaskDetail();
  }
  try {
    await getApplication();
  } catch {
    // 应用列表失败不阻断表单详情（嵌入场景鉴权时序可能晚于模块加载）
  }
  //初始化操作
  error.value = invalidQuery();
  initialized.value = true;
  function invalidQuery() {
    if (processType === ProcessType.ADD) {
      return !businessType;
    }
    if (processType === ProcessType.DETAIL) {
      return !processId;
    }
    return true;
  }
});

//tab切换
const changTab = (key: number) => {
  activeKey.value = key;
};

provide("currentUser", currentUser);
provide("currentTaskDetail", currentTaskDetail);
provide("flowForm", flowForm);
provide("processType", processType);
provide("businessType", businessType);
provide("processId", processId);
provide("appName", appName);
provide("notOperates", notOperates === "true" ? true : false);
provide("applications", apps);
</script>
<style lang="less" scoped>
.render-content {
  width: 100%;
  height: 100%;
  position: relative;

  .template-tabs-tabpane {
    overflow: overlay;
    box-sizing: border-box;
    padding: 0 10px;
  }

  :deep(.content-search) {
    display: none;
  }

  .index-spin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  :deep(.template-tabs-tab.template-tabs-tab-active .template-tabs-tab-btn) {
    color: unset;
  }
}
</style>
