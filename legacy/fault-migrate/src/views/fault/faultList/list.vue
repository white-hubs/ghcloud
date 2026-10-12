<template>
  <div class="flow-table">
    <g-table ref="tableRef" tableCode="FAULT_LIST" @reset="handleReset" :title="pageTitle" :beforeGet="beforeGet" :api="api"
      :extraSearchModel="form"
      :search="search" :btns="[]" :columns="columns" bordered :scroll="{x:1500,y:scrollY}">
      <template #header-btns>
        <a-button type="primary" @click="addFlow">新增</a-button>
      </template>
      <template #pre-item="{record}">
        <a-form-item>
          <a-radio-group v-model:value="form.type" style="margin-right: 10px" @change="handleTypeChange"
            button-style="solid">
            <a-radio-button value="ALL">全部</a-radio-button>
            <a-radio-button value="WAITING">待我处理</a-radio-button>
            <a-radio-button value="SUBMIT">我发起的</a-radio-button>
            <a-radio-button value="SERVED">抄送给我</a-radio-button>
            <a-radio-button value="PROCESSED">已处理</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="状态" name="status" v-show="supportedFilter">
          <a-select allowClear v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options">
          </a-select>
        </a-form-item>
      </template>
    </g-table>
  </div>
</template>
<script setup>
import { getFlowProcessPagePersonal } from "../../../api/flow-config"
import moment from "moment"
import {
  computed,
  h,
  reactive,
  ref,
  watch,
} from "vue"
import { getBusinessPrefix, getInstanceNameColumnText, getObjectNameColumnText, getUrgencyLevelColumnText } from '../../../hooks/useBusinessPrefix'
import { Popover, Table, Button } from 'ant-design-vue'
import { getCurrentApplicationCode } from "@/hooks/useCurrentApplication"
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const scrollY = ref(520)
const flowCode = JSON.parse(sessionStorage.getItem("GH-currentApplication")).code
const dataSource = ref([]);
const api = {
  list: 'getFlowProcessPagePersonal'
}
const tableRef = ref();
const search = [
  {
    label: '发起时间',
    value: 'date',
    defaultDate: 'submitTime',
    component: 'a-range-picker',
    width: '200px',
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
    placeholder: ['开始时间', '结束时间'],
  },
]
const businessPrefix = getBusinessPrefix();
/*获取table高度*/
const getScrollY = (data) => {
  const layoutContentHeight =
    document.getElementsByClassName("layout-content")[0];
  const contentSearchHeight =
    document.getElementsByClassName("content-search")[0];
  const contentDataHeight =
    document.getElementsByClassName("content-data")[0];
  const contentStatisticHeight =
    document.getElementsByClassName("statistic-data")[0];
  scrollY.value =
    layoutContentHeight.offsetHeight -
    contentSearchHeight.offsetHeight -
    contentDataHeight.offsetHeight -
    contentStatisticHeight.offsetHeight -
    50;
  const tableBody = document.getElementsByClassName("content-table")[0];
  tableBody.style.height =
    data && data.length === 0 ? "0px" : scrollY.value + "px";
};
const notDefaultVisibleDataIndex = ['code']
const columns = ref([
  {
    title: "编号",
    dataIndex: "code",
    width: 150,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    width: 200,
    customRender: ({ text }) => {
      const res = text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-";
      return h(Popover, { content: res }, { default: () => res })
    },
  },
  {
    dataIndex: "instanceName",
    title: getInstanceNameColumnText(),
    ellipsis: true,
    width: 200,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "objName",
    title: getObjectNameColumnText(),
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "faultType",
    title: `${businessPrefix}类型`,
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "urgencyLevel",
    title: getUrgencyLevelColumnText(),
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      const res = text ? statusText(text) : "-";
      return h(Popover, { content: res }, { default: () => res })
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    key: "activeNodeName",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    title: "处理结果",
    dataIndex: "result",
    key: "result",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    customRender: ({ text, record }) => {
      return h(Button, { type: 'link', onClick: () => goDetail(record) }, { default: () => "详情" })
    },
  },
]);
columns.value = columns.value.map(item => {
  return {
    ...item,
    defaultVisible: !notDefaultVisibleDataIndex.includes(item.dataIndex) ? true : false,
  }
})
const formatSubmitTimeForApi = (submitTime) => {
  if (submitTime == null || submitTime === '') {
    return ''
  }
  const parts = Array.isArray(submitTime)
    ? submitTime
    : typeof submitTime === 'string'
      ? submitTime.split(',')
      : []
  if (parts.length === 0) {
    return ''
  }
  return parts.map((t) => moment(t).format('YYYY-MM-DD')).join(',')
}

const beforeGet = (params) => {
  return {
    ...params,
    businessType: flowCode,
    type: form.type,
    status: form.status,
    submitTime: formatSubmitTimeForApi(params.submitTime),
  }
}
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
  time: [],
  status: null,
});
const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"]
const supportedFilter = computed(() => supportFilterStatus.includes(form.type))
const handleReset = () => {
  form.type = "ALL";
  form.time = [];
  form.status = null;
};
const addFlow = () => {
  const target = `/portal/stream-engine-render/index?businessType=${flowCode}&type=add&title=${pageTitle}`
  history.pushState({}, "", target)
};
const goDetail = (row) => {
  const { processInstanceId, currentTaskId, status } = row;
  const target = `/portal/stream-engine-render/index?businessType=${flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${pageTitle}`
  history.pushState(history.state, "", target)
};
watch(() => form.status, () => {
  tableRef.value.searchRecord();
})
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0 !important;
}
</style>
