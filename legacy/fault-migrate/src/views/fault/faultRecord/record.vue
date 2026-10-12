<template>
  <div class="flow-table">
    <g-table
      ref="tableRef"
      tableCode="FAULT_RECORD"
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
        <a-button style="margin-left: 10px" type="primary" :loading="exportLoading" :disabled="dataCount === 0" @click="downloadExcel"
          >导出</a-button
        >
      </template>
      <template #pre-item="{ record }">
        <a-form-item label="关键字" name="keyword">
          <a-input v-model:value="form.keyword" placeholder="请输入工单编号、工单名称搜索" :maxlength="20"></a-input>
        </a-form-item>
        <a-form-item :label="`${businessPrefix}类型`" name="faultTypeId">
          <g-select v-model:value="form.faultTypeId" :url="'faultType'" width="180px"></g-select>
        </a-form-item>
        <a-form-item label="处理状态" name="status" v-show="supportedFilter">
          <a-select v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options" />
        </a-form-item>
        <a-form-item label="处理进度" name="progerss">
          <SearchSelect v-model:value="form.progress" placeholder="请输入/选择" style="width: 180px" :options="processOptions" />
        </a-form-item>
      </template>
    </g-table>
  </div>
</template>
<script setup>
import { Popover, Table, Button } from "ant-design-vue";
import moment from "moment";
import { computed, h, onMounted, reactive, ref, watch } from "vue";

import { usePageName } from "@ghcloud/cube-utils";

import { getFlowProcessPageAll, getFlowBusinessNodeNames } from "../../../api/flow-config";
import { SearchSelect } from "../../../components/search-select";
import {
  getBusinessPrefix,
  getInstanceNameColumnText,
  getObjectNameColumnText,
  getUrgencyLevelColumnText,
} from "../../../hooks/useBusinessPrefix";
import { exportExcel } from "../../../utils/export-excel";
import { getCurrentApplicationCode } from "@/hooks/useCurrentApplication";
const { pageTitle } = usePageName();
const businessPrefix = getBusinessPrefix();
const scrollY = ref(520);
const api = {
  list: "getFlowProcessPageAll",
};
const dataCount = computed(() => {
  if (!tableRef.value) return 0;
  return tableRef.value.page.total;
});
const tableRef = ref();
const search = [
  {
    label: "发起时间",
    value: "submitTime",
    component: "a-range-picker",
    defaultDate: null,
  },
];
const flowCode = JSON.parse(sessionStorage.getItem("GH-currentApplication")).code;
const beforeGet = (params) => {
  return {
    ...params,
    businessType: flowCode,
    keyword: form.keyword,
    faultTypeId: form.faultTypeId,
    status: form.status,
    submitTime: params.submitTime ? params.submitTime.map((item) => moment(item).format("YYYY-MM-DD")).join(",") : "",
    progress: form.progress,
  };
};
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
const formatDateTime = (value) => {
  return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "-";
};
const formatTimeConsuming = (value) => {
  return value || value === 0 ? `${value}分钟` : "-";
};
const columns = ref([
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
    customRender: ({ text }) => {
      const res = text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-";
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    dataIndex: "instanceName",
    title: getInstanceNameColumnText(),
    ellipsis: true,
    width: 200,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "objName",
    title: getObjectNameColumnText(),
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "faultType",
    title: `${businessPrefix}类型`,
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "urgencyLevel",
    title: getUrgencyLevelColumnText(),
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      const res = text ? statusText(text) : "-";
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    key: "activeNodeName",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "处理结果",
    dataIndex: "result",
    key: "result",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "确认时间",
    dataIndex: "confirmTime",
    key: "confirmTime",
    width: 200,
    customRender: ({ text }) => {
      const res = formatDateTime(text);
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    title: "完成时间",
    dataIndex: "completeTime",
    key: "completeTime",
    width: 200,
    customRender: ({ text }) => {
      const res = formatDateTime(text);
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    title: "耗时",
    dataIndex: "timeConsuming",
    key: "timeConsuming",
    width: 120,
    customRender: ({ text }) => {
      const res = formatTimeConsuming(text);
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    customRender: ({ text, record }) => {
      return h(Button, { type: "link", onClick: () => goDetail(record) }, { default: () => "详情" });
    },
  },
]);
const notDefaultVisibleDataIndex = ["code"];
columns.value = columns.value.map((item) => {
  return {
    ...item,
    defaultVisible: !notDefaultVisibleDataIndex.includes(item.dataIndex) ? true : false,
  };
});
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
const isLoading = ref(false);
const options = ref([
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "PASS", label: "完成" },
]);
let form = reactive({
  type: "ALL",
  keyword: "",
  faultTypeId: "",
  time: [],
  status: null,
  progress: null,
});
const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"];
const supportedFilter = computed(() => supportFilterStatus.includes(form.type));

const handleReset = () => {
  form.type = "ALL";
  form.time = [];
  form.status = null;
  form.keyword = "";
  form.faultTypeId = "";
  form.progress = null;
};
const addFlow = () => {
  const target = `/portal/stream-engine-render/index?businessType=${flowCode}&type=add&title=${pageTitle}`;
  history.pushState({}, "", target);
};
const goDetail = (row) => {
  const { processInstanceId, currentTaskId, status } = row;
  const target = `/portal/stream-engine-render/index?businessType=${flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${pageTitle}`;
  history.pushState(history.state, "", target);
};
// 页面首次加载的时候不执行watch 防止与参数缓存冲突请求俩次接口
const hasSkippedInitialFilterWatch = ref(false);
watch(
  () => [form.status, form.faultTypeId],
  () => {
    if (!hasSkippedInitialFilterWatch.value) {
      hasSkippedInitialFilterWatch.value = true;
      return;
    }
    tableRef.value.searchRecord();
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
        keyword: form.keyword,
        faultTypeId: form.faultTypeId,
        status: form.status,
        submitTime: tableRef.value.form.submitTime
          ? tableRef.value.form.submitTime.map((item) => moment(item).format("YYYY-MM-DD")).join(",")
          : "",
        businessType: flowCode,
        progress: form.progress,
      };
      const result = await getFlowProcessPageAll(params);
      exportData.push(
        ...result.records.map((item) => ({
          ...item,
          confirmTime: formatDateTime(item.confirmTime),
          completeTime: formatDateTime(item.completeTime),
          timeConsuming: formatTimeConsuming(item.timeConsuming),
        })),
      );
    }
    let excelColumns = columns.value.slice(0, -1);
    await exportExcel(pageTitle, excelColumns, exportData);
  } catch (error) {
  } finally {
    exportLoading.value = false;
  }
};

const processOptions = ref([]);

const getFlowNodeNames = async () => {
  const res = await getFlowBusinessNodeNames({
    businessType: flowCode,
  });
  const { data } = res;
  processOptions.value = res.map((item) => {
    return {
      value: item,
      label: item,
    };
  });
};

onMounted(() => {
  getFlowNodeNames();
});
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0 !important;
}
</style>
