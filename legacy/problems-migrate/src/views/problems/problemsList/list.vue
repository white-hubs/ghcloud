<template>
  <div class="flow-table">
    <m-table
      ref="tableRef"
      tableCode="PROBLEMS_LIST"
      @reset="handleReset"
      :title="pageTitle"
      :beforeGet="beforeGet"
      :extraSearchModel="form"
      :api="api"
      :search="search"
      :btns="[]"
      :columns="columns"
      bordered
      :scroll="{ x: 1500, y: scrollY }"
    >
      <template #header-btns>
        <a-button type="primary" @click="addFlow">新增</a-button>
        <a-button style="margin-left: 10px" type="primary" :loading="exportLoading" :disabled="dataCount === 0" @click="downloadExcel"
          >导出</a-button
        >
      </template>
      <template #pre-item="{ record }">
        <a-form-item>
          <a-radio-group v-model:value="form.type" style="margin-right: 10px" @change="handleTypeChange" button-style="solid">
            <a-radio-button value="ALL">全部</a-radio-button>
            <a-radio-button value="WAITING">待我处理</a-radio-button>
            <a-radio-button value="SUBMIT">我发起的</a-radio-button>
            <a-radio-button value="SERVED">抄送给我</a-radio-button>
            <a-radio-button value="PROCESSED">已处理</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="状态" name="status" v-show="supportedFilter">
          <a-select allowClear v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options"> </a-select>
        </a-form-item>
        <a-form-item label="发起时间">
          <a-range-picker v-model:value="form.dateRange" value-format="YYYY-MM-DD" />
        </a-form-item>
      </template>
    </m-table>
  </div>
</template>
<script setup>
import mTable from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gTable.vue";
import { Popover, Table, Button } from "ant-design-vue";
import moment from "moment";
import { computed, h, onMounted, reactive, ref, watch } from "vue";

import { usePageName, queryParameter } from "@ghcloud/cube-utils";

import { getFlowProcessPagePersonal } from "../../../api/flow-config";
import { exportExcel } from "../../../utils/export-excel";
const { pageTitle } = usePageName();
const { title } = usePageName();
const scrollY = ref(520);
const flowCode = "HIDDENDANGER";
const api = {
  list: "getFlowProcessPagePersonal",
};
const tableRef = ref();
const search = [
  {
    value: "hidden",
    component: "span",
  },
];
/*获取table高度*/
const getScrollY = (data) => {
  const layoutContentHeight = document.getElementsByClassName("layout-content")[0];
  const contentSearchHeight = document.getElementsByClassName("content-search")[0];
  const contentDataHeight = document.getElementsByClassName("content-data")[0];
  const contentStatisticHeight = document.getElementsByClassName("statistic-data")[0];
  scrollY.value =
    layoutContentHeight.offsetHeight -
    contentSearchHeight.offsetHeight -
    contentDataHeight.offsetHeight -
    contentStatisticHeight.offsetHeight -
    50;
  const tableBody = document.getElementsByClassName("content-table")[0];
  tableBody.style.height = data && data.length === 0 ? "0px" : scrollY.value + "px";
};
const columns = [
  {
    title: "编号",
    dataIndex: "code",
    width: 150,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    width: 200,
    defaultVisible: true,
    customRender: ({ text }) => {
      const res = text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-";
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    dataIndex: "instanceName",
    title: "隐患单名称",
    width: 200,
    defaultVisible: true,
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "hiddenObjName",
    title: "隐患对象",
    defaultVisible: true,
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "hiddenType",
    title: "隐患类型",
    defaultVisible: true,
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "urgencyLevel",
    title: "紧急程度",
    defaultVisible: true,
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    defaultVisible: true,
    key: "startUserName",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    defaultVisible: true,
    key: "status",
    customRender: ({ text }) => {
      const res = text ? statusText(text) : "-";
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    defaultVisible: true,
    key: "activeNodeName",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "处理结果",
    dataIndex: "result",
    defaultVisible: true,
    key: "result",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "操作",
    defaultVisible: true,
    dataIndex: "action",
    customRender: ({ text, record }) => {
      return h(Button, { type: "link", onClick: () => goDetail(record) }, { default: () => "详情" });
    },
  },
];

const statusText = (str) => {
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
const beforeGet = (params) => {
  const result = {
    ...params,
    businessType: flowCode,
    type: form.type,
    status: form.status,
  };
  if (Array.isArray(form.dateRange) && form.dateRange.length === 2) {
    result.submitTime = `${form.dateRange[0]} 00:00:00,${form.dateRange[1]} 23:59:59`;
  }
  return result;
};
const handleTypeChange = (e) => {
  form.type = e.target.value;
  tableRef.value.searchRecord();
};
const isLoading = ref(false);
const options = ref([
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
]);
let form = reactive({
  type: "ALL",
  dateRange: null,
  status: null,
});
const dataCount = computed(() => {
  if (!tableRef.value) return 0;
  return tableRef.value.page.total;
});
const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"];
const supportedFilter = computed(() => supportFilterStatus.includes(form.type));
const handleReset = () => {
  form.type = "ALL";
  form.dateRange = null;
  form.status = null;
};

onMounted(() => {
  const cacheQuery = queryParameter.getQuery() || {};
  let changed = false;
  if (cacheQuery.type !== undefined && form.type !== cacheQuery.type) {
    form.type = cacheQuery.type;
    changed = true;
  }
  if (cacheQuery.status !== undefined && form.status !== cacheQuery.status) {
    form.status = cacheQuery.status;
    changed = true;
  }
  if (cacheQuery.dateRange !== undefined) {
    const times = String(cacheQuery.dateRange).split(",").filter(Boolean);
    if (times.length === 2) {
      const newTime = [times[0].slice(0, 10), times[1].slice(0, 10)];
      if (JSON.stringify(form.dateRange) !== JSON.stringify(newTime)) {
        form.dateRange = newTime;
        changed = true;
      }
    }
  }
  if (changed && tableRef.value) {
    tableRef.value.searchRecord();
  }
});
const addFlow = () => {
  const target = `/portal/stream-engine-render/index?businessType=${flowCode}&type=add&title=${pageTitle}`;
  history.pushState({}, "", target);
};
const goDetail = (row) => {
  const { processInstanceId, currentTaskId, status } = row;
  const target = `/portal/stream-engine-render/index?businessType=${flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${pageTitle}`;
  history.pushState(history.state, "", target);
};
watch(
  () => form.status,
  () => {
    tableRef.value.searchRecord();
  },
);
watch(
  () => form.dateRange,
  (val) => {
    if (typeof val === "string") {
      const times = val.split(",").filter(Boolean);
      if (times.length === 2) {
        form.dateRange = [times[0].slice(0, 10), times[1].slice(0, 10)];
      }
    }
  },
);
const exportLoading = ref(false);
const downloadExcel = async () => {
  try {
    exportLoading.value = true;
    const count = Math.ceil(dataCount.value / 999);
    const exportData = [];
    for (let i = 0; i < count; i++) {
      const params = {
        pageNumber: i + 1,
        pageSize: 999,
        type: form.type,
        status: form.status,
        submitTime:
          Array.isArray(form.dateRange) && form.dateRange.length === 2 ? `${form.dateRange[0]} 00:00:00,${form.dateRange[1]} 23:59:59` : "",
        businessType: flowCode,
      };
      const result = await getFlowProcessPagePersonal(params);
      exportData.push(...result.records);
    }
    let excelColumns = columns.slice(0, -1);
    await exportExcel("隐患单", excelColumns, exportData);
  } catch (error) {
    exportLoading.value = false;
  } finally {
    exportLoading.value = false;
  }
};
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0 !important;
}
</style>
