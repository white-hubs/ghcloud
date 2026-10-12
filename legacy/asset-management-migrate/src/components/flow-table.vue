<template>
  <div class="flow-table">
    <GLayout :title="props.title">
      <template #header-btn>
        <Button type="primary" @click="addFlow">新增</Button>
      </template>
      <template #content-search>
        <Form layout="inline" :model="form">
          <FormItem>
            <RadioGroup v-model:value="form.type" style="margin-right: 10px" button-style="solid" @change="handleTypeChange">
              <RadioButton value="ALL">全部</RadioButton>
              <RadioButton value="WAITING">待我处理</RadioButton>
              <RadioButton value="SUBMIT">我发起的</RadioButton>
              <RadioButton value="SERVED">抄送给我</RadioButton>
              <RadioButton value="PROCESSED">已处理</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem v-show="supportedFilter" label="状态" name="status">
            <Select v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options!" />
          </FormItem>
          <FormItem label="发起时间" name="time">
            <RangePicker v-model:value="form.time as [string, string]" value-format="YYYY-MM-DD" />
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleSearch">查询</Button>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleReset">重置</Button>
          </FormItem>
        </Form>
      </template>
      <template #content-table>
        <Table
          :data-source="dataSource"
          :columns="columns"
          :loading="isLoading"
          bordered
          :pagination="false"
          :scroll="{ x: 1000, y: 520 }"
          size="middle"
        >
          <template #bodyCell="opt">
            <template v-if="opt.column.dataIndex === 'action'">
              <Button type="link" @click="goDetail(opt.record)">详情</Button>
            </template>
          </template>
        </Table>
      </template>
      <template #footer-page>
        <Pagination
          v-if="page.total > 0"
          v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber"
          show-size-changer
          :total="page.total"
          :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"
          @change="pageChange"
        />
      </template>
    </GLayout>
  </div>
</template>
<script setup lang="ts">
import { RadioButton, RadioGroup, type RadioChangeEvent, type SelectProps, type TableColumnsType } from "ant-design-vue";
import dayjs from "dayjs";
import { computed, onMounted, reactive, ref, watch } from "vue";

import { useListQueryCache } from "@ghcloud/cube-utils";

import { getFlowProcessPage, type FlowPageState } from "@/api/flow-config";
import GLayout from "@/components/common/g-layout.vue";
// 主应用配置得子应用name
const applicantName = "work-report";

interface FormState {
  time: string[];
  type: string;
  status: string;
}
interface RowState {
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
  variables: unknown;
}
interface PageResult {
  data: {
    records: RowState[];
    total: number;
    pages?: number;
  };
}
const props = withDefaults(
  defineProps<{
    title?: string;
    flowCode?: string;
  }>(),
  {
    title: "",
    flowCode: "WORK_REPORT", // 流程code 用于跳转页面及获取表格数据
  },
);
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
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    customRender: ({ text }) => {
      return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
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
  },
];
const page = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 1,
});
const form = reactive<FormState>({
  type: "ALL",
  time: [],
  status: "",
});
const queryCache = useListQueryCache({
  defaults: {
    type: "ALL",
    status: "",
    time: [] as string[],
    pageNumber: 1,
    pageSize: 10,
  },
  getState: () => ({
    type: form.type,
    status: form.status,
    time: form.time,
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
  }),
  setState: (next) => {
    form.type = (next.type as string) || "ALL";
    form.status = (next.status as string) || "";
    form.time = Array.isArray(next.time) ? (next.time as string[]) : typeof next.time === "string" ? (next.time as string).split(",") : [];
    page.value.pageNumber = Number(next.pageNumber ?? 1);
    page.value.pageSize = Number(next.pageSize ?? 10);
  },
});
const isLoading = ref(false);
const options = ref<SelectProps["options"]>([
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
]);
const dataSource = ref<RowState[]>([]);
const getTableData = async () => {
  const params: FlowPageState = {
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
    type: form.type,
    status: form.status,
    submitTime: form.time.join(","),
    businessType: props.flowCode,
  };
  isLoading.value = true;
  try {
    const reslut: PageResult = (await getFlowProcessPage(params)) as unknown as PageResult;
    const { records, total } = reslut.data;
    dataSource.value = records;
    page.value.total = total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const handleTypeChange = async (e: RadioChangeEvent) => {
  form.type = (e.target as HTMLInputElement).value;
  page.value.pageNumber = 1;
  await getTableData();
  await queryCache.sync();
};

const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"];
const supportedFilter = computed(() => supportFilterStatus.includes(form.type));

const handleReset = async () => {
  await queryCache.reset();
  await getTableData();
};

const addFlow = () => {
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/index?businessType=${props.flowCode}&appName=${applicantName}&type=add&title=${props.title}`,
  );
};
const goDetail = (row: RowState) => {
  const { processInstanceId, currentTaskId, status } = row;
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/index?businessType=${props.flowCode}&appName=${applicantName}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${props.title}`,
  );
};

const handleSearch = async () => {
  page.value.pageNumber = 1;
  await getTableData();
  await queryCache.sync();
};

watch(
  () => form.status,
  () => {
    handleSearch();
  },
);

const pageChange = async (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  await getTableData();
  await queryCache.sync();
};
onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);
});
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.content-table) {
  padding-right: 2px;
  overflow: overlay !important;
}
</style>
