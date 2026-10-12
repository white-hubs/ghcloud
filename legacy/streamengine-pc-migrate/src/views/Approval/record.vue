<template>
  <div class="record-list">
    <g-layout :title="state.pageTitle">
      <template #header-btn>
      <a-button type="primary" @click="handleExport" style="margin-right: 10px;">导出</a-button>
    </template>
      <template #content-search>
        <a-form layout="inline" :model="state.search">
          <a-form-item name="submitTime" label="发起时间">
            <a-range-picker v-model:value="state.search.submitTime" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item name="businessType" label="业务类型">
            <a-select v-model:value="state.search.businessType" allowClear show-search placeholder="请选择业务类型"
              style="width: 200px" :options="businessTypeOption"></a-select>
          </a-form-item>
          <a-form-item name="organizationId" label="部门">
            <a-select v-model:value="state.search.organizationId" allowClear show-search placeholder="请选择部门"
              style="width: 200px" :options="state.deptOption"></a-select>
          </a-form-item>
          <a-form-item name="organizationId" label="状态">
            <a-select v-model:value="state.search.status" allowClear show-search placeholder="请选择" style="width: 200px"
              :options="statusOptions"></a-select>
          </a-form-item>
          <a-form-item name="username" label="发起人">
            <a-input v-model:value="state.search.username" placeholder="请输入发起人" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </template>
      <template #content-table>
        <a-table :dataSource="state.dataSource" :columns="columns" :loading="state.isLoading" bordered size="small"
          :scroll="{ x: 1000, y: state.scrollY }" :pagination="false" />
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="state.page.total > 0" v-model:pageSize="state.page.pageSize"
          v-model:current="state.page.pageNumber" :total="state.page.total" @change="pageChange" :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </g-layout>
  </div>
</template>

<script setup lang="tsx">
import { reactive, onBeforeMount, onMounted, onUnmounted, h, ref } from "vue";
import gLayout from "@/components/common/gLayout.vue";
import { queryParameter } from "@ghcloud/cube-utils";
import { RECORD_APP_BUSINESS_TYPE, RECORD_APP_FUNCTION_CODES } from "./approvalConfig";
import dayjs from "dayjs";
import { deptList } from "../../api/ouaa";
import _ from "lodash";
import { getProcessApprovalList, postHistoricalExport } from "../../api/flow/index";
import { Popover, message } from "ant-design-vue";
import { useRoute } from "vue-router";
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission'
import { usePageName } from '@ghcloud/cube-utils'

interface recordState {
  search: searchState;
  page: pageState;
  deptOption: { value: string; label: string }[];
  dataSource: rowState[];
  scrollY: number;
  isLoading: boolean;
  pageTitle?: string | undefined;
}
interface searchState {
  submitTime: string[];
  organizationId: string | undefined;
  username: string;
  businessType: string | undefined;
  status: string | undefined;
}
interface pageState {
  pageNumber: number;
  pageSize: number;
  total: number;
}

const statusOptions = [
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
];
const currentApplication = JSON.parse(
  sessionStorage.getItem("GH-currentApplication") as string
);
const permission = appFunctionCodes.flowApprovalRecord ?? null
const applicationCode = currentApplication.code;
const applicationName = currentApplication.name;
const RECORD_BUSINESS_TYPE = RECORD_APP_BUSINESS_TYPE[applicationCode];
const RECORD_FUNCTION_CODES = RECORD_APP_FUNCTION_CODES[applicationCode];
const getScrollY = () => {
  const layoutContentHeight = document.getElementsByClassName(
    "layout-content"
  )[0] as HTMLDivElement;
  const contentSearchHeight = document.getElementsByClassName(
    "content-search"
  )[0] as HTMLDivElement;

  state.scrollY =
    layoutContentHeight.offsetHeight - contentSearchHeight.offsetHeight - 50;
};

const businessTypeOption = Object.keys(RECORD_BUSINESS_TYPE).map((businessType) => {
  return {
    value: businessType,
    label: RECORD_BUSINESS_TYPE[businessType],
  };
});
const columns = [
  {
    title: "编号",
    dataIndex: "formNo",
    key: "formNo",
    customRender: ({ text }: { text: string }) => {
      return text || "-";
    },
  },
  {
    dataIndex: "instanceName",
    title: "申请名称",
    slots: {
      customRender: "instanceName",
    },
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return h(Popover, { content: text || "--" }, text || "--");
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    customRender: ({ text }: { text: string }) => {
      return text === "null" ? "--" : text;
    },
  },
  {
    dataIndex: "startUserInfo",
    title: "发起部门",
    key: "startUserInfo",
    ellipsis: true,
    customRender: ({ text }: { text: any }) => {
      return h(
        Popover,
        { content: text ? text.organizationName : "--" },
        text ? text.organizationName : "--"
      );
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    customRender: ({ text }: { text: string }) => {
      return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }: { text: string }) => {
      return text ? statusText(text) : "-";
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    key: "activeNodeName",
    customRender: ({ text }: { text: string }) => {
      return text || "-";
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    customRender: ({ record }: { record: rowState }) => {
      return (
        !permission || hasPermission(permission.info) && <a-button
          type="link"
          onClick={() => goDetails(record)}
        >
          详情
        </a-button>
      );
    },
  },
];
const goDetails = (row: rowState) => {
  const { businessType, processInstanceId } = row;
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/index?businessType=${businessType}&processInstanceId=${processInstanceId}&type=detail&title=${RECORD_BUSINESS_TYPE[businessType]}&appName=${applicationName}`
  );
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
const initSearchState = {
  submitTime: [],
  organizationId: undefined,
  username: "",
  businessType: undefined,
  status: undefined,
};
/**
 * 数据部分
 */
const state = reactive<recordState>({
  search: {
    submitTime: queryParameter.getQuery()?.submitTime
      ? (queryParameter.getQuery()?.submitTime as string).split(",")
      : [],
    organizationId: (queryParameter.getQuery()?.organizationId as string) ?? undefined,
    username: (queryParameter.getQuery()?.username as string) ?? "",
    businessType: (queryParameter.getQuery()?.businessType as string) ?? undefined,
    status: (queryParameter.getQuery()?.status as string) ?? undefined,
  },
  page: {
    pageNumber: (queryParameter.getQuery()?.pageNumber as number) ?? 1,
    pageSize: (queryParameter.getQuery()?.pageSize as number) ?? 10,
    total: (queryParameter.getQuery()?.total as number) ?? 0,
  },
  isLoading: false,
  deptOption: [],
  dataSource: [],
  scrollY: 1000,
});
interface rowState {
  formNo: string;
  processInstanceId: string;
  startUserId: string;
  formInstanceId: number | null;
  startUserName: string;
  submitedTime: number;
  lastTaskCompletedTime: string | null;
  status: string;
  activeNodeName: string;
  currentTaskId: string;
  businessType: string;
  variables: any;
}
interface pageResult {
    records: rowState[];
    total: number;
    pages?: number;
}
const setUrl = () => {
  queryParameter.setAddressQuery({
    ...state.search,
    pageNumber: state.page.pageNumber,
    pageSize: state.page.pageSize,
    total: state.page.total,
  });
};
const getDataSource = async (urlCache = false) => {
  state.isLoading = true;
  const result: pageResult = (await getProcessApprovalList({
    ...{ ...state.search, submitTime: state.search.submitTime&&state.search.submitTime.join(",") },
    ...state.page,
    applicationCode: (applicationCode as string).includes("ATTENDANCE")
      ? "ATTENDANCE_MANAGEMENT"
      : applicationCode,
  }))as unknown  as pageResult;
  state.dataSource = result.records;
  state.page.total = result.total;
  state.isLoading = false;
  urlCache && setUrl();
};
const handleSearch = () => {
  state.page.pageNumber = 1;
  getDataSource(true);
};
const handleReset = () => {
  state.search = _.cloneDeep(initSearchState);
  getDataSource(true);
};
//导出=========================================================================================================================================================
const handleExport = async() => {
  if(state.dataSource.length===0){
    message.warning('未查询到数据，无法导出')
    return
  }
  const exportData=ref()
  const exportTitle=ref()
  // //导出
  const param={
    ...state.search,
    submitTime: state.search.submitTime&&state.search.submitTime.join(","),
    applicationCode 
  }
    const data =await postHistoricalExport(param)
    exportData.value=data
    exportTitle.value=`${state.pageTitle}.xlsx`
  // //生成excel
  const link = document.createElement('a')
  const blob = new Blob([exportData.value], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', exportTitle.value)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
};
const pageChange = (pageNumber: number, pageSize: number) => {
  state.page.pageSize = pageSize;
  state.page.pageNumber = pageNumber;
  getDataSource(true);
};
onBeforeMount(async () => {
  const depts = await deptList({}) as any;
  state.deptOption = depts.map((dept: any) => {
    return {
      label: dept.name,
      value: dept.id,
    };
  });
});

const { pageTitle } = usePageName()
onMounted(() => {
  const route = useRoute();
  state.pageTitle =  pageTitle || route.meta.title as string;
  getScrollY();
  window.addEventListener("resize", getScrollY);
  getDataSource();
});
onUnmounted(() => {
  window.removeEventListener("resize", getScrollY);
});
</script>
<style scoped lang="less">
.record-list {
  width: 100%;
  height: 100%;
}
</style>
