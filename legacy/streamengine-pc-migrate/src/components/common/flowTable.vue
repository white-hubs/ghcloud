<template>
  <div class="flow-table">
    <g-layout :title="props.title">
      <template #header-btn>
        <a-button type="primary" @click="addFlow">新增</a-button>
      </template>
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item>
            <a-radio-group
              v-model:value="form.type"
              style="margin-right: 10px"
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
          <a-form-item label="发起时间" name="submitTime">
            <a-range-picker v-model:value="form.submitTime" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item label="发起部门" name="organizationId">
            <DeptTreeSelect v-model:value="form.organizationId" style="width:180px" />
          </a-form-item>
          <a-form-item label="发起人" name="username">
            <a-input v-model:value="form.username" placeholder="请输入发起人名称" style="width:180px" />
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
        <AliasTable 
          :tableCode="props.tableCode" 
          :applicationCode="getApplicationCode()"
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
import gLayout from "./gLayout.vue";
import { Button, type SelectProps, type TableColumnsType } from "ant-design-vue";
import { queryParameter } from "@ghcloud/cube-utils";
import { AliasTable, DeptTreeSelect } from '@ghcloud/generic-component'
import {
  computed,
  h,
  onMounted,
  reactive,
  ref,
} from "vue";
import dayjs from "dayjs";
import { cubeFlowService } from "../../api/service";
import { FlowProcessVO } from "@ghcloud/cube-stream-engine-service/src/type";

interface Props {
  title?: string;
  flowCode?: string;
  tableCode?:string
}
const dataSource = ref<FlowProcessVO[]>([]);
const props = withDefaults(defineProps<Props>(), {
  flowCode: "",
  tableCode:'',
  title: "",
});
const getApplicationCode = ()=>{
  const currentApplication = JSON.parse(
    sessionStorage.getItem("GH-currentApplication") as string
  );
  return currentApplication.code;
}
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
let form = reactive({
  type: queryParameter.getQuery()?.type as string ?? 'ALL',
  status: queryParameter.getQuery()?.status ?? undefined,
  organizationId: queryParameter.getQuery()?.organizationId ?? undefined,
  username: queryParameter.getQuery()?.username ?? undefined,
  submitTime: queryParameter.getQuery()?.submitTime ? (queryParameter.getQuery()?.submitTime as string).split(',') : undefined,
});
const businessType = ref(props.flowCode || queryParameter.getQuery()?.businessType)
const page = ref({
  pageSize: queryParameter.getQuery()?.pageSize ?? 10,
  pageNumber: queryParameter.getQuery()?.pageNumber ?? 1,
  total: queryParameter.getQuery()?.total ?? 0,
});

const period = computed(() => {
  if (form?.submitTime?.[0] && form?.submitTime?.[1]) {
    return `${form.submitTime[0] + ' 00:00:00'},${form.submitTime[1] + ' 23:59:59'}`
  }
  return undefined
})
const handleReset = () => {
  form.type = 'ALL'
  form.submitTime = undefined
  form.status = undefined
  form.username = undefined
  form.organizationId = []
  page.value.pageNumber = 1;
  setQuery();
  getTableData();
};
const handleSearch = () => {
  setQuery();
  page.value.pageNumber = 1;
  getTableData();
};
const addFlow = (): void => {
  history.pushState({ current: location.pathname + location.search }, '', `/portal/stream-engine-render/index?businessType=${props.flowCode}&type=add&title=${props.title}`)
}
const setQuery = () => {
  queryParameter.setAddressQuery({
    ...form,
    businessType: businessType.value,
    pageSize: page.value.pageSize,
    pageNumber: page.value.pageNumber,
    total: page.value.total,
  });
};
const goDetail = (row: FlowProcessVO) => {
  const { processInstanceId, currentTaskId, status } = row;
  history.pushState({ current: location.pathname + location.search }, '', `/portal/stream-engine-render/index?businessType=${props.flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${props.title}`)
};

const getTableData = async () => {
  const params = {
    pageNumber: page.value.pageNumber as number,
    pageSize: page.value.pageSize as number,
    organizationId: form.organizationId as number,
    status: form.status as string,
    type: form.type as string,
    username: form.username as string,
    submitTime: period.value || '',
    businessType: (businessType.value || props.flowCode) as string,
  };
  isLoading.value = true;
  try {
    const res = await cubeFlowService.getFlowProcessPage(params)
    const { records, total } = res
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
  getTableData();
});
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}
</style>
