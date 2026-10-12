<template>
  <div class="flow-table">
    <g-table ref="tableRef" tableCode="PROBLEMS_ORDER_STAT" @reset="handleReset" :title="pageTitle" :beforeGet="beforeGet"
      :api="api" :search="search" :btns="[]" :columns="columns" bordered :scroll="{x:1500,y:scrollY}">
      <template #header-btns>
        <a-button style="margin-left: 10px;" type="primary" :loading="exportLoading" :disabled="dataCount === 0"
          @click="exportTable">导出</a-button>
      </template>
      <template #pre-item="{record}">
        <a-form-item label="隐患类型">
          <a-select v-model:value="form.hiddenDangerTypeId" placeholder="请选择隐患类型" style="width: 180px"
            :options="hiddenDangerTypeOptions" allowClear />
        </a-form-item>
      </template>
    </g-table>
  </div>
</template>
<script setup>
import { getHiddenOrderStatistics, exportHiddenOrderStatistics } from "../../../api/flow-config"
import { dangerType } from "../../../api/hiddenDanger"
import { exportExcel } from "@/utils/common"
import {
  computed,
  h,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick
} from "vue"
import { Popover, Table, Button } from 'ant-design-vue'
import moment from "moment"
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const scrollY = ref(520)
const flowCode = 'HIDDENDANGER'
const api = {
  list: 'getHiddenOrderStatistics'
}
const tableRef = ref();

const dataCount = computed(() => {
  if (!tableRef.value) return 0
  return tableRef.value.page.total
})
const beforeGet = (params) => {
  return {
    ...params,
    hiddenDangerTypeId: form.hiddenDangerTypeId,
    applicationCode: flowCode,
  }
}
const columns = [
  {
    title: '序号',
    width: 70,
    dataIndex: 'tableIndex',
    customRender: ({ index }) => `${index + 1}`
  },
  {
    dataIndex: "hiddenTypeName",
    title: "隐患类型",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "totalNumber",
    title: "工单数",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text ?? "--" }, { default: () => text ?? "--" })
    },
  },
  {
    dataIndex: "waitNumber",
    title: "待处理",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text ?? "--" }, { default: () => text ?? "--" })
    },
  },
  {
    dataIndex: "dealNumber",
    title: "已处理",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text ?? "--" }, { default: () => text ?? "--" })
    },
  },
  {
    dataIndex: "dealRate",
    title: "处理率",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text ?? "--" }, { default: () => text ?? "--" })
    },
  },
  {
    title: "平均处理时长",
    dataIndex: "avgWaitTime",
    fixed: "right",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
];
const isLoading = ref(false);
// 获取本月的开始时间
const monthStartDate = moment().startOf('month').format('YYYY-MM-DD');
const monthEndDate = moment().format('YYYY-MM-DD');
const search = [
  {
    label: '时间',
    value: 'date',
    component: 'a-range-picker',
    date: [monthStartDate, monthEndDate],
    defaultDate: 'period',
  }
]
let form = reactive({
  time: [monthStartDate, monthEndDate],
  hiddenDangerTypeId: null,
});
const handleReset = () => {
  form.time = [];
  form.hiddenDangerTypeId = null;
};

const pageChange = (pageNumber, pageSize) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  getTableData();
};
const exportLoading = ref(false)
const exportTable = async () => {
  try {
    exportLoading.value = true;
    await exportExcel('/maintain/hidden/work/order/statisticsExcel', {
      pageNumber: 1,
      pageSize: 999999,
      'hiddenDangerTypeId': form.hiddenDangerTypeId ?? '',
      period: tableRef.value.form.period,
      applicationCode: flowCode
    }, '隐患工单统计.xlsx')
  } catch (error) {
  } finally {
    setTimeout(() => {
      exportLoading.value = false
    }, 1000)
  }
}
const hiddenDangerTypeOptions = ref([]);
const geTypeOptions = async () => {
  const result = await dangerType({ pageNumber: 1, pageSize: 1000 });
  const options = result.map((item) => {
    return {
      value: item.id,
      label: `${item.hiddenDangerCategoryName} - ${item.name}`,
    };
  });
  hiddenDangerTypeOptions.value = options;
};
onMounted(() => {
  geTypeOptions();
});
const dataSource = ref([]);
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0 !important;
}
</style>
