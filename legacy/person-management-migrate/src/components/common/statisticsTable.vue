<template>
  <div class="table-layout" ref="table_layout_ref">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line :title="pageTitle"></g-vertical-line>
        <div class="right-btn">
          <a-button type="primary" @click="handleExport" :loading="exportLoading"
            >导出</a-button
          >
        </div>
      </div>
      <div class="header-control">
        <a-form layout="inline" :model="formState">
          <a-form-item label="时间">
            <a-range-picker v-model:value="formState.period" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleReset"> 重置</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div class="layout-content">
      <div class="layout-table">
        <AliasTable 
          :tableCode="props.tableCode" 
          applicationCode="PERSONNELMANAGEMENT"
          :dataSource="dataSource"
          :pagination="false"
          :scroll="{ x: 1000, y: 520 }"
          :loading="isLoading"
          :columns="columns"
          size="middle"
        >
        </AliasTable>
      </div>

      <div class="content-page">
        <a-pagination
          show-size-changer
          v-if="pagination.total > 0"
          v-model:pageSize="pagination.pageSize"
          v-model:current="pagination.pageNumber"
          :total="pagination.total"
          :default-current="1"
          @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"
        ></a-pagination>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  appraiseStatisticsExport,
  departStatisticsExport,
  getAppraiseStatistics,
  getDepartStatistics,
  getInductionStatistics,
  getRecruitStatistics,
  getRegularStatistics,
  getRotationPostStatistics,
  inductionStatisticsExport,
  recruitStatisticsExport,
  regularStatisticsExport,
  rotationPostStatisticsExport,
} from "@/api/statistics";
import { Button, TableColumnsType } from "ant-design-vue";
import { computed, h, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import GVerticalLine from "./gVerticalLine.vue";
import { historyPush } from "@/utils/utils";
import { useTitle } from "@/hooks/useTitle";
import { queryParameter } from "@ghcloud/cube-utils";
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
interface FormState {
  period: string[];
}
interface Props {
  columns: TableColumnsType; //表格列数据源
  type: string;
  tableCode?:string;
}
const path = window.location.pathname.split("/").reverse()[0];
const { pageTitle } = usePageName()
const router = useRouter();
let formState = reactive({ period: [] } as FormState);
const isLoading = ref(false);
const exportLoading = ref(false);
const pagination = ref({
  pageNumber: 1,
  pageSize: 10,
  total: 1,
});
// props默认值
const props = withDefaults(defineProps<Props>(), {
  type: "recruit",
  tableCode:'',
  columns: () => [
    {
      title: "申请岗位",
      dataIndex: "jobName",
      key: "jobName",
    },
    {
      title: "增补人数",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
    },
  ],
});
const columns=computed(()=>{
  let resultCols:TableColumnsType=[]
  const actionCol=props.columns.find(x=>x.dataIndex==='action')
  if(actionCol){
     actionCol.customRender=({ record }) => {
      return [
      h(
          Button,
          { type: 'link', size: 'small', onClick: () => openModal(record.id) },
          { default: () => '详情' }
        ),
      ]
    }
  } 
  resultCols=[...props.columns]
  return resultCols
})

// 详情
const openModal = async (id: string) => {
  const params = {
    id,
    type: props.type,
    period: formState.period.join(","),
  };
  historyPush(params, "/statisticsInfo");
};
const typeForNameMap = new Map<string, string>([
  ["recruit", "招聘统计"],
  ["induction", "入职统计"],
  ["appraise", "考核统计"],
  ["regular", "转正统计"],
  ["depart", "离职统计"],
  ["workshift", "轮岗统计"],
]);
// 导出
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const exportMethodMap = new Map<string, any>([
      ["recruit", recruitStatisticsExport], //招聘
      ["induction", inductionStatisticsExport], //入职
      ["appraise", appraiseStatisticsExport], //考核
      ["regular", regularStatisticsExport], //转正
      ["depart", departStatisticsExport], //离职
      ["workshift", rotationPostStatisticsExport], //离职
    ]);
    const params = {
      period: formState.period.join(","),
    };
    const result = await exportMethodMap.get(props.type)(params);
    // 下载文件
    const link = document.createElement("a");
    let blob = new Blob([result], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${typeForNameMap.get(props.type)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    exportLoading.value = false;
  } catch (error) {
    exportLoading.value = false;
  }
};
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber;
  pagination.value.pageSize = pageSize;
  getStatisticsList();
};
// 获取表格数据
const getStatisticsList = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    period: formState.period.join(","),
  };
  isLoading.value = true;
  const methodMap = new Map<string, any>([
    ["recruit", getRecruitStatistics], //招聘
    ["induction", getInductionStatistics], //入职
    ["appraise", getAppraiseStatistics], //试用考核
    ["regular", getRegularStatistics], //转正
    ["depart", getDepartStatistics], //离职
    ["workshift", getRotationPostStatistics], //轮岗
  ]);
  try {
    const result = await methodMap.get(props.type)(params);
    dataSource.value = result.data.records;
    pagination.value.total = result.data.total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const handleSearch = () => {
  queryParameter.setAddressQuery({
    ...formState,
    ...{
      pageNumber: pagination.value.pageNumber,
      pageSize: pagination.value.pageSize,
      total: pagination.value.total,
    },
  });
  pagination.value.pageNumber = 1;
  getStatisticsList();
};
// 重置
const handleReset = () => {
  formState.period = [];
  pagination.value.pageNumber = 1;
  queryParameter.setAddressQuery({
    ...formState,
    ...{
      pageNumber: pagination.value.pageNumber,
      pageSize: pagination.value.pageSize,
      total: pagination.value.total,
    },
  });
  getStatisticsList();
};
const dataSource = ref([]);
onMounted(() => {
  Object.assign(formState, queryParameter.getQuery("period"));
  Object.assign(pagination.value, queryParameter.getQuery());
  queryParameter.clearInfo();
  getStatisticsList();
});
</script>
<style lang="less" scoped>
.table-layout {
  padding: 0 10px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .layout-header {
    .header-name {
      padding: 14px 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;
    }

    .header-control {
      padding: 10px 0;
    }
  }
}

:deep(.ant-modal-body) {
  padding: 16px 24px 10px !important;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.ant-btn) {
    padding: 0;
    line-height: 20px;
    height: 20px;
  }

  .layout-table {
    flex: 1;
  }

  .content-page {
    // float: right;
    padding: 20px 0;
    border-top: 1px solid #f3f3f3;
    margin-top: 10px;
    display: flex;
    flex-direction: row-reverse;
  }
}

//
</style>
