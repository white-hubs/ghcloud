<template>
  <div class="table-layout" ref="table_layout_ref">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line :title="title"></g-vertical-line>
        <div class="right-btn">

          <a-button type="primary" @click="handleExport" :loading="exportLoading"
            v-if="hasPermission(routepermission.get(routerName) as string)">导出</a-button>
        </div>
      </div>
      <div class="header-control">
        <a-form layout="inline" :model="formState">
          <a-form-item label="发起时间">
            <a-range-picker v-model:value="formState.period" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleReset"> 重置 </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div class="layout-content">
      <div class="layout-table">
        <AliasTable 
          :tableCode="tableCode" 
          applicationCode="OFFICIAL_MANAGEMENT"
          :dataSource="dataSource" :pagination="false" :loading="isLoading"
          :columns="columns" bordered size="middle">
        </AliasTable>
      </div>
      <div class="content-page">
        <a-pagination show-size-changer v-if="pagination.total > 0" v-model:pageSize="pagination.pageSize"
          v-model:current="pagination.pageNumber" :total="pagination.total" :default-current="1" @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  documentReceivedExport,
  focusWorkApprovalStatisticsExport,
  focusWorkExchangeStatisticsExport,
  getDocumentReceivedStatistic,
  getFocusWorkApprovalStatistics,
  getFocusWorkExchangeStatistics,
  getkeyWorkStatistic,
  getRegulationStatistic,
  getSealStatistics,
  getTopicStatistic,
  keyWorkStatisticExport,
  regulationStatisticExport,
  sealStatisticsExport,
  topicStatisticExport,
} from "@/api/statistics";
import { Button, TableColumnsType } from "ant-design-vue";
import { computed, h, onMounted, reactive, ref } from "vue";
import { useRouter, useRoute, RouteRecordName } from "vue-router";
import GVerticalLine from "./gVerticalLine.vue";
import { usePageName } from "@/hooks/usePageName";
import { queryParameter } from "@ghcloud/cube-utils";
import {appFunctionCodes} from '@/permission'
import {hasPermission } from '@ghcloud/cube-permission-codes'
import { AliasTable } from '@ghcloud/generic-component'
const route = useRoute();

const routerName = ref(route.name);

const { title } = usePageName();
const path = window.location.pathname.split("/").reverse()[0];

const routepermission = new Map<RouteRecordName | undefined | null, string>([
  ["systemStatistics", appFunctionCodes.officialInstitutionalStatistics.export],
  ["issueStatistics", appFunctionCodes.officialIssueStatistics.export],
  ["useSealStatistics", appFunctionCodes.officialUseSealStatistics.export],
  [
    "documentReceivedStatistics",
    appFunctionCodes.officialDocumentReceivedStatistics.export,
  ],
  [
    "departmentWorkStatistics",
    appFunctionCodes.officialDepartmentWorkStatistics.export,
  ],
  ["approvalStatistics", appFunctionCodes.officialApprovalStatistics.export],
  ["exchangeStatistics",appFunctionCodes.officialEventExchangeStat.export],
]);
const routepermissiondetiles = new Map<RouteRecordName | undefined | null, string>([
  ["systemStatistics", appFunctionCodes.officialInstitutionalStatistics.details],
  ["issueStatistics", appFunctionCodes.officialIssueStatistics.details],
  ["useSealStatistics", appFunctionCodes.officialUseSealStatistics.details],
  [
    "documentReceivedStatistics",
    appFunctionCodes.officialDocumentReceivedStatistics.details,
  ],
  [
    "departmentWorkStatistics",
    appFunctionCodes.officialDepartmentWorkStatistics.details,
  ],
  ["approvalStatistics", appFunctionCodes.officialApprovalStatistics.details],
  ["exchangeStatistics", appFunctionCodes.officialEventExchangeStat.details],
]);

const Router = useRouter();
interface FormState {
  period: string[];
}
interface Props {
  title: string; //标题
  columns: TableColumnsType; //表格列数据源
  type: string;
  detailParam: string;
  tableCode?:string;
}
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
  title: "申请统计",
  type: "system",
  detailParam: "id",
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
const getQuery = (data: {
  [x: string]: any;
  period?: string;
  id?: any;
  title?: string;
}) => {
  let query = "";
  for (const key in data) {
    query += `${key}=${data[key]}&`;
  }
  return query;
};
// 详情
const openModal = async (row: any) => {
  const infoMethodMap = new Map<string, any>([
    ["system", "/systemStatisticsInfo"],
    ["seal", "/sealStatisticsInfo"],
    ["issue", "/issueStatisticsInfo"],
  ]);
  const id = row[props.detailParam];

  const params = {
    period: formState.period.join(","),
    id,
    title: title.value,
  };
  history.pushState(
    {},
    "",
    `/portal/governmentManagement${infoMethodMap.get(props.type)}?${getQuery(params)}`
  );
  // Router.push({ path: infoMethodMap.get(props.type), query: { ...params } });
};
const handleSearch = () => {
  queryParameter.setAddressQuery({
    ...formState,
    ...{ pageSize: pagination.value.pageSize, pageNumber: pagination.value.pageNumber },
  });
  pagination.value.pageNumber = 1;
  getStatisticsList();
};
const typeForNameMap = new Map<string, string>([
  ["system", "制度统计"],
  ["seal", "用印统计"],
  ["issue", "预提预报统计"],
  ["documentReceived", "来文统计"],
  ["keywork", "部门重点工作统计"],
  ["focusWork", "督办事项审批统计"],
  ["focusWorkChange", "事项变更统计"],
]);

// 导出
const handleExport = async () => {
  exportLoading.value = true;
  const exportMethodMap = new Map<string, any>([
    ["system", regulationStatisticExport],
    ["seal", sealStatisticsExport],
    ["issue", topicStatisticExport],
    ["documentReceived", documentReceivedExport],
    ["keywork", keyWorkStatisticExport],
    ["focusWork", focusWorkApprovalStatisticsExport],
    ["focusWorkChange", focusWorkExchangeStatisticsExport],
  ]);

  const params = {
    period: formState.period.join(","),
  };
  try {
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
    period: Array.isArray(formState.period)
      ? formState.period.join(",")
      : formState.period,
  };
  isLoading.value = true;
  const methodMap = new Map<string, any>([
    ["system", getRegulationStatistic],
    ["seal", getSealStatistics],
    ["issue", getTopicStatistic],
    ["documentReceived", getDocumentReceivedStatistic],
    ["keywork", getkeyWorkStatistic],
    ["focusWork", getFocusWorkApprovalStatistics],
    ["focusWorkChange", getFocusWorkExchangeStatistics],
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
// 重置
const handleReset = () => {
  formState.period = [];
  queryParameter.setAddressQuery({
    ...formState,
    ...{ pageSize: pagination.value.pageSize, pageNumber: pagination.value.pageNumber },
  });
  getStatisticsList();
};
const dataSource = ref([]);
const columns=computed(()=>{
  let resultCols:TableColumnsType=[]
  const actionCol=props.columns.find(x=>x.dataIndex==='action')
  if(actionCol){
     actionCol.customRender=({ record }) => {
      return [
      hasPermission(routepermissiondetiles.get(routerName.value) as string)?h(
          Button,
          { type: 'link', size: 'small', onClick: () => openModal(record) },
          { default: () => '详情' }
        ):null,
      ]
    }
  } 
  resultCols=[...props.columns]
  return resultCols
})
onMounted(() => {
  Object.assign(formState, {
    ...queryParameter.getQuery("period"),
  });
  Object.assign(pagination.value, {
    ...queryParameter.getQuery(),
  });
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
  height: calc(100% - 125px);
  flex-direction: column;

  :deep(.ant-btn) {
    padding: 0;
    line-height: 20px;
    height: 20px;
  }

  .layout-table {
    overflow: overlay;
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

//</style>
