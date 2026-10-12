<template>
  <div class="flow-table">
    <g-table ref="tableRef" tableCode="PROBLEMS_USER_STAT" @reset="handleReset" :title="pageTitle" :beforeGet="beforeGet"
      :api="api" :search="search" :btns="[]" :columns="columns" bordered :scroll="{x:1500,y:scrollY}">
      <template #header-btns>
        <a-button style="margin-left: 10px;" type="primary" :loading="exportLoading" :disabled="dataCount === 0"
          @click="exportTable">导出</a-button>
      </template>
      <template #pre-item="{record}">
        <a-form-item label="部门">
          <a-select v-model:value="form.organizationId" placeholder="请选择部门" style="width: 180px" :options="deptOptions"
            allowClear />
        </a-form-item>
        <a-form-item label="时间">
          <a-range-picker v-model:value="form.time" value-format="YYYY-MM-DD" allowClear />
        </a-form-item>
      </template>
    </g-table>
  </div>
</template>
<script setup>
import { getWordOrderStatisticsByUser, exportWordOrderStatisticsByUser } from "../../../api/flow-config"
import { getDept } from "../../../api/user"
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
  list: 'getWordOrderStatisticsByUser'
}
const tableRef = ref();
const search = [
  {
    label: '人员',
    value: 'keyword',
    component: 'a-input',
    placeholder: '请输入人员名称'
  }
]
const dataCount = computed(() => {
  if (!tableRef.value) return 0
  return tableRef.value.page.total
})
const beforeGet = (params) => {
  return {
    ...params,
    organizationId: form.organizationId,
    period: (form.time && form.time.length) ? moment(form.time[0]).format('YYYY-MM-DD') + ' 00:00:00' + ',' + moment(form.time[1]).format('YYYY-MM-DD')+  ' 23:59:59' : '',
    applicationCode: flowCode,
  }
}
const columns = [
  {
    title: '序号',
    width: 70,
    dataIndex: "tableIndex",
    customRender: ({ index }) => `${index + 1}`
  },
  {
    title: "人员",
    dataIndex: "userName",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" })
    },
  },
  {
    dataIndex: "organizationName",
    title: "所属部门",
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
];
const deptOptions = ref([]);
const getDeptOptions = async () => {
  const result = await getDept();
  const options = result.map((item) => {
    return {
      value: item.id,
      label: item.name,
    };
  });
  deptOptions.value = options;
};
const isLoading = ref(false);
// 获取本月的开始时间
const monthStartDate = moment().startOf('month').format('YYYY-MM-DD');
const monthEndDate = moment().format('YYYY-MM-DD');
let form = reactive({
  keyword: '',
  time: [monthStartDate, monthEndDate],
  organizationId: null,
});

const handleReset = () => {
  form.keyword = '';
  form.time = [];
  form.organizationId = null;
};



const exportLoading = ref(false)
const exportTable = async () => {
  try {
    exportLoading.value = true;
    await exportExcel('/flow/exportWordOrderStatisticsByUser', {
      pageNumber: 1,
      pageSize: 99999,
      'organizationId': form.organizationId ?? '',
      period: form.time ? form.time.join(',') : '',
      keyword: tableRef.value.form.keyword,
      applicationCode: flowCode
    }, '隐患人员统计.xlsx')
  } catch (error) {
  } finally {
    setTimeout(() => {
      exportLoading.value = false
    }, 1000)
  }
}
onMounted(() => {
  getDeptOptions();
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
