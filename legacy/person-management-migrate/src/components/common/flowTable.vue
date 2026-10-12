<template>
  <div class="flow-table">
    <g-layout :title="pageTitle">
      <template #header-btn>
        <a-button type="primary" @click="addFlow">新增</a-button>
      </template>
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item>
            <a-radio-group
              v-model:value="form.type"
              style="marginright: 10px"
              @change="handleTypeChange"
              button-style="solid"
            >
              <a-radio-button value="ALL">全部</a-radio-button>
              <a-radio-button value="WAITING">待我处理</a-radio-button>
              <a-radio-button value="SUBMIT">我发起的</a-radio-button>
              <a-radio-button value="SERVED">抄送给我</a-radio-button>
              <a-radio-button value="PROCESSED">已处理</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="状态" name="status" v-show="supportedFilter">
            <a-select
              v-model:value="form.status"
              placeholder="请选择"
              allowClear
              style="width: 180px"
              :options="options"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="时间" name="time">
            <a-range-picker v-model:value="form.time" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
        <!--  -->
      </template>
      <template #content-table>
        <AliasTable 
          :tableCode="props.tableCode" 
          applicationCode="PERSONNELMANAGEMENT"
          :dataSource="dataSource"
          :columns="columns"
          :loading="isLoading"
          :pagination="false"
          :scroll="{ x: 1000, y: 520 }"
          size="middle"
        >
        </AliasTable>
      </template>
      <template #footer-page>
        <a-pagination
          show-size-changer
          v-if="page.total > 0"
          v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber"
          :total="page.total"
          @change="pageChange"
          :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"
        ></a-pagination>
      </template>
    </g-layout>
  </div>
</template>
<script setup lang="ts">
import { flowPageState, getFlowProcessPage } from "@/api/flowConfig";
import gLayout from "@/components/common/gLayout.vue";
import { Button, type SelectProps, type TableColumnsType } from "ant-design-vue";
import moment from "moment";
import { useTitle } from "@/hooks/useTitle";
import { queryParameter } from "@ghcloud/cube-utils";
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
import {
  ComponentInternalInstance,
  computed,
  getCurrentInstance,
  h,
  onMounted,
  reactive,
  ref,
} from "vue";
// 主应用配置得子应用name
const applicantName = "personalManagement";
const path = window.location.pathname.split("/").reverse()[0];
const { pageTitle } = usePageName()
enum FlOWFORIDENTIFIER {
  "PERSONNEL_RECRUIT" = "ZP",
  "PERSONNEL_INDUCTION" = "RZ",
  "PERSONNEL_PROBATION_ASSESS" = "SY",
  "PERSONNEL_REGULAR_WORKER" = "ZZ",
  "PERSONNEL_TRAIN" = "PX",
  "PERSONNEL_LEAVE_OFFICE" = "LZSP",
  "PERSONNEL_LEAVE_OFFICE_PROCEDURES" = "LZSX",
  "PERSONNEL_ROTATION_POST" = "LGSQ",
}
type ENUMTYPES = keyof typeof FlOWFORIDENTIFIER;
interface FormState {
  time: string[];
  type: string;
  status: string | null;
}
interface Props {
  /** 标题 */
  title?: string;
  flowCode?: string;
  tableCode?:string
}
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
  variables: any;
}
interface pageResult {
  data: {
    records: rowState[];
    total: number;
    pages?: number;
  };
}
const props = withDefaults(defineProps<Props>(), {
  flowCode: "PERSONNEL_RECRUIT", //流程code 用于跳转页面及获取表格数据
  tableCode:''
});
const columns: TableColumnsType = [
  {
    title: "编号",
    dataIndex: "formNo",
    key: "formNo",
    customRender: ({ text }) => {
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
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    dataIndex: "startUserInfo",
    title: "发起部门",
    slots: {
      customRender: "startUserInfo",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return text ? text.organizationName ?? "--" : "--";
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-";
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return text ? statusText(text) : "-";
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    key: "activeNodeName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { type: 'link', size: 'small', onClick: () => goDetail(record) },
          { default: () => '详情' }
        ),
      ]
    }
  },
];
const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"];
const supportedFilter = computed(() => supportFilterStatus.includes(form.type));
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
const handleTypeChange = (e: Event) => {
  form.type = (e.target as HTMLInputElement).value;
  setQuery();
  page.value.pageNumber = 1;
  getTableData();
};
const isLoading = ref(false);
const options = ref<SelectProps["options"]>([
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
]);
let form = reactive<FormState>({
  type: "ALL",
  time: [],
  status: null,
});
const page = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 1,
});
const handleReset = () => {
  form.type = "ALL";
  form.time = [];
  form.status = null;
  page.value.pageNumber = 1;
  setQuery();
  getTableData();
};
const handleSearch = () => {
  setQuery();
  page.value.pageNumber = 1;
  getTableData();
};
const addFlow = () => {
  history.pushState(
    history.state,
    "",
    `/portal/stream-engine-render/index?businessType=${
      props.flowCode
    }&appName=${applicantName}&type=add&title=${pageTitle}&prefix=${
      FlOWFORIDENTIFIER[props.flowCode as ENUMTYPES]
    }`
  );
};
const setQuery = () => {
  queryParameter.setAddressQuery({
    ...form,
    pageSize: page.value.pageSize,
    pageNumber: page.value.pageNumber,
    total: page.value.total,
  });
};
const goDetail = (row: rowState) => {
  const { processInstanceId, currentTaskId, status } = row;
  const target = `/portal/stream-engine-render/index?businessType=${
    props.flowCode
  }&appName=${applicantName}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${
    pageTitle
  }&prefix=${FlOWFORIDENTIFIER[props.flowCode as ENUMTYPES]}`;
  history.pushState(history.state, "", target);
};

const getTableData = async () => {
  const params: flowPageState = {
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
    type: form.type,
    status: form.status,
    submitTime: form.time.join(","),
    businessType: props.flowCode,
  };
  isLoading.value = true;
  try {
    const reslut: pageResult = (await getFlowProcessPage(params)) as pageResult;
    const { records, total } = reslut.data;
    dataSource.value = records;
    page.value.total = total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const pageChange = (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  getTableData();
};
onMounted(() => {
  Object.assign(form, queryParameter.getQuery("time"));
  Object.assign(page.value, queryParameter.getQuery());
  queryParameter.clearInfo();
  getTableData();
});
const dataSource = ref<rowState[]>([
  {
    formNo: "HB202301100004",
    processInstanceId: "b578d31b-9093-11ed-899f-a67a04984b6b",
    startUserId: "1478636886984523777",
    formInstanceId: null,
    startUserName: "张三",
    submitedTime: 1673319959754,
    lastTaskCompletedTime: null,
    status: "ACTIVE",
    activeNodeName: "审批人",
    currentTaskId: "b59de798-9093-11ed-899f-a67a04984b6b",
    variables: {},
  },
]);
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}
</style>
