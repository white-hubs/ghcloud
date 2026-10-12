<template>
  <div class="flow-table">
    <g-layout :title="pageTitle">
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item>
            <a-radio-group v-model:value="form.backlogKey" style="marginright: 10px" @change="handleTypeChange"
              button-style="solid">
              <a-radio-button value="ALL">全部</a-radio-button>
              <a-radio-button value="WAITING">待我处理</a-radio-button>
              <a-radio-button value="SERVED">抄送给我</a-radio-button>
              <a-radio-button value="PROCESSED">已处理</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="发起时间">
            <a-range-picker v-model:value="form.submitTime" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
        </a-form>
      </template>
      <template #content-table>
        <AliasTable 
          tableCode="EVENT_HANDLE_APPROVAL"
          applicationCode="OFFICIAL_MANAGEMENT" 
          :scroll-x="100"
          :scroll-y="tableScorllHeight"
          :dataSource="dataSource" :columns="columns" :loading="isLoading"  :pagination="false"
          size="middle">
        </AliasTable>
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" :total="page.total" :default-current="1" @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </g-layout>
  </div>
</template>
<script setup lang="ts">
import { getFocusWorkFlowPage } from "@/api/superviseManage";
import gLayout from "@/components/common/gLayout.vue";
import { Button, type TableColumnsType } from "ant-design-vue";
import moment from "moment";
import { queryParameter } from "@ghcloud/cube-utils";
import { AliasTable } from '@ghcloud/generic-component'
import {
  ComponentInternalInstance,
  getCurrentInstance,
  h,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from "vue";
import { appFunctionCodes } from '@/permission'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const permission=appFunctionCodes.officialEventHandleApproval
const path = window.location.pathname.split("/").reverse()[0];

const columns: TableColumnsType = [
  {
    title: "编号",
    dataIndex: "processInstanceCode",
    key: "processInstanceCode",
  },
  {
    title: "督办事项",
    dataIndex: "workDesc",
    key: "workDesc",
    ellipsis: true,
  },
  {
    title: "发起人",
    dataIndex: "applicantName",
    key: "applicantName",
  },

  {
    title: "发起时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "处理状态",
    dataIndex: "processInstanceStatus",
    key: "processInstanceStatus",
    customRender: ({ text }) => {
      return statusText(text);
    },
  },
  {
    title: "处理进度",
    dataIndex: "processInstanceNode",
    key: "processInstanceNode",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    customRender: ({ record }) => {
      return [
      hasPermission(permission.details)?h(
          Button,
          { type: 'link', size: 'small', onClick: () => goDetail(record) },
          { default: () => '详情' }
        ):null,
      ]
    }
  },
];

const isLoading = ref(false);
const tableScorllHeight = ref(500);
let form = reactive({
  status: null,
  submitTime: [],
  backlogKey: "ALL",
} as SuperviseMangagement.FormState);
const page = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 1,
});
const pageChange = (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  getFocusWorkList();
};
const statusText = (str: string) => {
  const statusMap = new Map([
    ["SUBMIT", "提交"],
    ["UNDO", "撤销"],
    ["REPEAT", "重新提交"],
    ["APPROVAL", "审批"],
    ["BACK", "撤回"],
    ["COPY", "抄送"],
    ["REJECT", "驳回"],
    ["FINISHED", "完成"],
  ]);
  return statusMap.get(str) || "处理中";
};
const scrollHandle = () => {
  let tableHeight = 520;

  const clientHeight: number | undefined = document.querySelector(".content-table")
    ?.clientHeight;
  if (clientHeight) {
    tableHeight = clientHeight;
  }
  tableScorllHeight.value = tableHeight;
};
const setQuery = () => {
  queryParameter.setAddressQuery({
    ...form,
    pageSize: page.value.pageSize,
    pageNumber: page.value.pageNumber,
  });
};
const handleTypeChange = (e: Event) => {
  form.backlogKey = (e.target as HTMLInputElement).value;
  setQuery();
  page.value.pageNumber = 1;
  getFocusWorkList();
};
const handleSearch = () => {
  setQuery();
  page.value.pageNumber = 1;
  getFocusWorkList();
};
const handleReset = () => {
  form.status = null;
  form.backlogKey = "ALL";
  form.submitTime = [];
  page.value.pageNumber = 1;
  setQuery();
  getFocusWorkList();
};
const goDetail = (row: SuperviseMangagement.rowState) => {
  const { processInstanceId, status } = row;
  const target = `/portal/stream-engine-render/index?businessType=OFFICIAL_FOCUS_WORK_REPLY&appName=governmentManagement&processInstanceId=${processInstanceId}&status=${status}&type=detail&title=${pageTitle}`;
  history.pushState(history.state, "", target);
};
const getFocusWorkList = async () => {
  const params = {
    businessType: "OFFICIAL_FOCUS_WORK_REPLY",
    type: form.backlogKey,
    submitTime: form.submitTime.join(","),
    status: form.status,
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
  };
  isLoading.value = true;
  try {
    const result = await getFocusWorkFlowPage(params);
    dataSource.value = result.data.records;
    page.value.total = result.data.total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
onMounted(() => {
  Object.assign(form, queryParameter.getQuery("submitTime"));
  Object.assign(page.value, queryParameter.getQuery());

  scrollHandle();
  getFocusWorkList();
  window.addEventListener("resize", scrollHandle);
});
onUnmounted(() => {
  window.removeEventListener("resize", scrollHandle);
});
const dataSource = ref([]);
</script>
<style lang="less" scoped>
.flow-table {
  width: 100%;
  height: 100%;
}
</style>
