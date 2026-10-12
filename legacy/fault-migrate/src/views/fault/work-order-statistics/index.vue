<template>
  <div class="flow-table">
    <g-table ref="tableRef" tableCode="WORK_ORDER_STAT" @reset="handleReset" :title="pageTitle" :beforeGet="beforeGet"
      :api="api" :search="search" :btns="[]" :columns="columns" bordered :scroll="{x:1500,y:scrollY}">
      <template #header-btns>
        <a-button style="margin-left: 10px;" type="primary" :loading="exportLoading" :disabled="dataCount === 0"
          @click="exportTable">导出</a-button>
      </template>
      <template #pre-item="{record}">
        <a-form-item :label="`${businessPrefix}类型`">
          <a-select v-model:value="form.faultTypeId" placeholder="请选择" style="width: 180px" :options="faultTypeOptions"
            allowClear />
        </a-form-item>
      </template>
    </g-table>
  </div>
</template>
<script setup>
import { getFaultApplyStatistics, exportFaultApplyStatistics } from "../../../api/flow-config"
import { faultType } from "../../../api/fault"
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
import { getBusinessPrefix } from '../../../hooks/useBusinessPrefix'
import { Popover, Table, Button } from 'ant-design-vue'
import moment from "moment"
import { getCurrentApplicationCode } from "@/hooks/useCurrentApplication"
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const businessPrefix = getBusinessPrefix();
const scrollY = ref(520)
const api = {
  list: 'getFaultApplyStatistics'
}
const tableRef = ref();
const search = [
  {
    label: '时间',
    value: 'date',
    component: 'a-range-picker',
    defaultDate: 'period',
  }
]
const dataCount = computed(() => {
  if (!tableRef.value) return 0
  return tableRef.value.page.total
})
const columns = [
  {
    title: '序号',
    dataIndex: 'tableIndex',
    width: 70,
    customRender: ({ index }) => `${index + 1}`
  },
  {
    title: `${businessPrefix}类型`,
    dataIndex: "objName",
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
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    title: "解决率",
    dataIndex: "result",
    customRender: ({ text }) => {
      return h(Popover, { content: text ?? "--" }, { default: () => text ?? "--" })
    },
  },
];
const isLoading = ref(false);
const beforeGet = (params) => {
  return {
    ...params,
    faultTypeId: form.faultTypeId,
    applicationCode: getCurrentApplicationCode(),
  }
}
// 获取本月的开始时间
const monthStartDate = moment().startOf('month').format('YYYY-MM-DD');
const monthEndDate = moment().format('YYYY-MM-DD');

let form = reactive({
  time: [monthStartDate, monthEndDate],
  faultTypeId: null,
});
const handleReset = () => {
  form.time = [];
  form.faultTypeId = null;
};

const exportLoading = ref(false)
const exportTable = async () => {
  try {
    exportLoading.value = true;
    await exportExcel('/maintain/fault/apply/statistics/typeExcel', {
      pageNumber: 1,
      pageSize: 999999,
      'faultTypeId': form.faultTypeId ?? '',
      period: tableRef.value.form.period,
      applicationCode: getCurrentApplicationCode()
    }, `${pageTitle}.xlsx`)
  } catch (error) {
  } finally {
    setTimeout(() => {
      exportLoading.value = false
    }, 1000)
  }
}
const faultTypeOptions = ref([]);
const geFaultTypeOptions = async () => {
  const result = await faultType({ applicationCode: getCurrentApplicationCode() });
  const options = result.map((item) => {
    return {
      value: item.id,
      label: item.name,
    };
  });
  faultTypeOptions.value = options;
};
onMounted(() => {
  geFaultTypeOptions();
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
