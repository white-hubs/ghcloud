<template>
  <div class="flow-table">
    <g-table ref="tableRef" tableCode="PROBLEMS_RECORDS" @reset="handleReset" :title="pageTitle" :beforeGet="beforeGet"
      :extraSearchModel="form"
      :api="api" :search="search" :btns="[]" :columns="columns" bordered :scroll="{x:1500,y:scrollY}">
      <template #header-btns>
        <a-button style="margin-left: 10px;" type="primary" :loading="exportLoading" :disabled="Number(dataCount) === 0"
          @click="downloadExcel">导出</a-button>
      </template>
      <template #pre-item="{record}">
        <a-form-item label="状态" name="status">
          <a-select allowClear v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options">
          </a-select>
        </a-form-item>
      </template>
    </g-table>
    <!-- <g-layout :title="title">
      <template #header-btn>
        <a-button style="margin-left: 10px;" type="primary" :loading="exportLoading" :disabled="Number(page.total) === 0" @click="downloadExcel">导出</a-button>
      </template>
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item label="状态" name="status">
            <a-select v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options">
            </a-select>
          </a-form-item>
          <a-form-item label="发起时间" name="time">
            <a-range-picker v-model:value="form.time" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </template>
      <template #content-table>
        <Table :dataSource="dataSource" :columns="columns" :loading="isLoading" bordered :pagination="false"
          size="small" :scroll="{x:1000,y:scrollY}">
        </Table>
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" :total="page.total" @change="pageChange" :default-current="1"
          :show-total="(total) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </g-layout> -->
  </div>
</template>
<script setup>
import { getFlowProcessPageAll } from "../../../api/flow-config"
import moment from "moment"
import {
  computed,
  h,
  reactive,
  ref,
  watch
} from "vue"
import { Popover, Table, Button } from 'ant-design-vue'
import { exportExcel } from "../../../utils/export-excel";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const { title } = usePageName()
const scrollY = ref(520)
const flowCode = 'HIDDENDANGER'
const api = {
  list: 'getFlowProcessPageAll'
}
const tableRef = ref();
const dataSource = ref([]);
const search = [
  {
    label: '发起时间',
    value: 'submitTime',
    component: 'a-range-picker',
    defaultDate: null,
  }
]
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
let columns = [
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
    title: "隐患单名称",
    ellipsis: true,
    width: 200,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "hiddenObjName",
    title: "隐患对象",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "hiddenType",
    title: "隐患类型",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "urgencyLevel",
    title: "紧急程度",
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
];
const notDefaultVisibleDataIndex = ['code']
columns = columns.map(item => {
  return {
    ...item,
    defaultVisible: !notDefaultVisibleDataIndex.includes(item.dataIndex) ? true : false,
  }
})
const dataCount = computed(() => {
  if (!tableRef.value) return 0
  return tableRef.value.page.total
})
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
  { value: "FINISHED", label: "完成" },
]);
let form = reactive({
  time: [],
  status: null,
});

const handleReset = () => {
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
const beforeGet = (params) => {
  return {
    ...params,
    businessType: flowCode,
    submitTime: params.submitTime ? params.submitTime.map(item => moment(item).format('YYYY-MM-DD')).join(",") : '',
    status: form.status,
  }
}

const exportLoading = ref(false)
const downloadExcel = async () => {
  try {
    exportLoading.value = true
    const count = Math.ceil(dataCount.value / 999)
    const exportData = []
    for (let i = 0; i < count; i++) {
      const params = {
        pageNumber: i + 1,
        pageSize: 999,
        status: form.status,
        submitTime: tableRef.value.form.submitTime ? tableRef.value.form.submitTime.map(item => moment(item).format('YYYY-MM-DD')).join(",") : '',
        businessType: flowCode,
      };
      const result = await getFlowProcessPageAll(params);
      exportData.push(...result.records)
    }
    let excelColumns = columns.slice(0, -1);
    await exportExcel('隐患排查记录', excelColumns, exportData)
  } catch (error) {
    exportLoading.value = false
  } finally {
    exportLoading.value = false
  }
}

</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0 !important;
}
</style>
