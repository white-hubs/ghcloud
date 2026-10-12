<template>
  <div class="flow-table">
    <g-layout :title="pageTitle">
      <template #header-btn>
        <a-button v-if="hasPermission(permission.add)" type="primary" @click="addFocuWorkFlow">新增</a-button>
      </template>
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item>
            <a-radio-group v-model:value="form.backlogKey" style="marginright: 10px" @change="handleTypeChange"
              button-style="solid">
              <a-radio-button value="ALL">全部</a-radio-button>
              <a-radio-button value="WAITING">待我处理</a-radio-button>
              <a-radio-button value="SUBMIT">我发起的</a-radio-button>
              <a-radio-button value="SERVED">抄送给我</a-radio-button>
              <a-radio-button value="PROCESSED">已处理</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="状态" v-show="supportedFilter">
            <a-select v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options">
            </a-select>
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
          tableCode="EVENT_EXCHANGE" 
          applicationCode="OFFICIAL_MANAGEMENT" :dataSource="dataSource" :columns="columns" :loading="isLoading" bordered :pagination="false"
          :scroll-x="1000"
          :scroll-y="520" size="middle">
        </AliasTable>
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize" @change="pageChange"
          v-model:current="page.pageNumber" :total="page.total" :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </g-layout>
  </div>
</template>
<script setup lang="ts">
import { getFocusWorkFlowPage } from "@/api/superviseManage";
import gLayout from "@/components/common/gLayout.vue";
import { Button, type SelectProps, type TableColumnsType } from "ant-design-vue";
import moment from "moment";
import { queryParameter } from "@ghcloud/cube-utils";
import {
  computed,
  h,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { appFunctionCodes } from '@/permission'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const permission=appFunctionCodes.officialEventChange

enum STATUS {
  "UNDONE" = "未完成",
  "STOP" = "已终止",
  "PROCESSING" = "处理中",
  "FINISH" = "已完成",
}
const form = reactive({
  status: null,
  submitTime: [],
  backlogKey: "ALL",
} as SuperviseMangagement.FormState);
const supportFilterStatus = ["ALL", "SUBMITTED_OF_ME", "COPY_OF_ME"];
const supportedFilter = computed(() => supportFilterStatus.includes(form.backlogKey));
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
    title: "完成时限",
    dataIndex: "completeTimeStr",
    key: "completeTimeStr",
    width: 150,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "变更后状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return STATUS[text as SuperviseMangagement.TYPES];
    },
  },
  {
    title: "变更后时限",
    dataIndex: "updateCompleteTimeStr",
    key: "updateCompleteTimeStr",
    width: 150,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "发起人",
    dataIndex: "applicantName",
    key: "applicantName",
  },
  {
    title: "发起部门",
    dataIndex: "applicantDeptName",
    key: "applicantDeptName",
  },
  {
    title: "发起时间",
    dataIndex: "applyTime",
    key: "applyTime",
    width: 150,
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
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
const options = ref<SelectProps["options"]>([
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
]);
const isLoading = ref(false);
const setQuery = () => {
  queryParameter.setAddressQuery({
    ...form,
    pageSize: page.value.pageSize,
    pageNumber: page.value.pageNumber,
  });
};
const handleSearch = () => {
  setQuery();
  page.value.pageNumber = 1;
  getFocusWorkList();
};
const handleReset = () => {
  form.status = null;
  form.submitTime = [];
  form.backlogKey = "ALL";
  page.value.pageNumber = 1;
  setQuery();
  getFocusWorkList();
};
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
const addFocuWorkFlow = () => {
  const target = `/portal/stream-engine-render/index?businessType=OFFICIAL_FOCUS_WORK_UPDATE&appName=governmentManagement&type=add&title=${pageTitle}`;
  history.pushState(history.state, "", target);
};
const goDetail = (row: SuperviseMangagement.rowState) => {
  const { processInstanceId, status } = row;
  const target = `/portal/stream-engine-render/index?businessType=OFFICIAL_FOCUS_WORK_UPDATE&appName=governmentManagement&processInstanceId=${processInstanceId}&status=${status}&type=detail&title=${pageTitle}`;
  history.pushState(history.state, "", target);
};
const handleTypeChange = (e: Event) => {
  form.backlogKey = (e.target as HTMLInputElement).value;
  setQuery();
  page.value.pageNumber = 1;
  getFocusWorkList();
};
const getFocusWorkList = async () => {
  const params = {
    businessType: "OFFICIAL_FOCUS_WORK_UPDATE",
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
  queryParameter.clearInfo();
  getFocusWorkList();
});
const dataSource = ref([]);
watch(
  () => form.status,
  () => {
    handleSearch();
  }
);
</script>
<style lang="less" scoped>
.flow-table {
  width: 100%;
  height: 100%;
}
</style>
