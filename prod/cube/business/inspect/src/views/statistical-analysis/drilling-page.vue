<template>
  <GLayout ref="table_layout_ref" :title="piniaStoreInspection.title">
    <template #header-btn>
      <Button type="primary" @click="exportTable">导出</Button>
    </template>
    <template #content-table>
      <AliasTable 
         :tableCode="tableCode" 
         applicationCode="INSPECTION"
         :loading="tableLoading" :data-source="dataSource"
        :columns="columns" :pagination="false"
      />
    </template>
    <template #footer-page>
      <div style="display: flex;">
        <Pagination
          v-model:current="pagination.pageNumber" style="margin-right: 10px;" :total="pagination.total"
          show-less-items @change="changePage"
        />
        <Button type="primary" @click="goPage">返回</Button>
      </div>
    </template>
  </GLayout>
</template>

<script setup lang="ts">
import { storeArea } from '@/stores/inspection'
import { onMounted, reactive, ref } from 'vue'
import { checkDetail, hiddenDangerDetail, inspectionDetail, objStatisticsRepairsDetail, taskDetail } from '@/api/inspection'
import { departmentTasksColumns, inspectionRecordsColumns, statisticShiddenDangerColumns, statisticsMismatchingColumns, statisticsRepairColumns } from '@/typings/drilling-page-columns'
import type { TaskDetail, HiddenDangerType } from '@/api/model/inspection'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { exportExcel } from '@/utils/auth'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'

interface PaginationType {
  pageSize: number;
  total: number;
  pageNumber: number;
}
interface ParamsType {
  period: string | null | undefined;
  pagination: number;
  pageSize: number;
  pageNumber: number;
  depId: string | null | undefined;
  objId: string | null | undefined;
  staffId: string | null | undefined;
  taskId: string | null | undefined;
  state: string;
}
const piniaStoreInspection = storeArea();
const columns = ref<TableColumnsType>([])
const dataSource = ref<TaskDetail[] | HiddenDangerType[] | undefined>([])
const pagination = reactive<PaginationType>({
  pageSize: 10,
  pageNumber: 1,
  total: 0
})
const route = useRoute()
const tableCode=route.query.tableCode
const tableLoading = ref<boolean>(false)
const params = reactive<ParamsType>({
  period: undefined,
  pagination: pagination.pageNumber,
  pageSize: pagination.pageSize,
  pageNumber: pagination.pageNumber,
  depId: '',
  staffId: '',
  state: '',
  objId: '',
  taskId: ''
})
// 根据点击的下钻调取不同的接口，参数，columns
const processParameters = async () => {
  tableLoading.value = true
  let res
  params.pageNumber = pagination.pageNumber
  params.period = piniaStoreInspection.params.period
  switch (piniaStoreInspection.value) {
  case 'personnel-depTaskNum':
    params.depId = piniaStoreInspection.record.depId
    columns.value = departmentTasksColumns
    res = await taskDetail(params)
    break;
  case 'personnel-personageTaskNum':
    params.staffId = piniaStoreInspection.record.staffId
    params.staffId = piniaStoreInspection.record.staffId
    columns.value = departmentTasksColumns
    res = await taskDetail(params)
    break;
  case 'personnel-completeTaskNum':
    params.state = 'OVER'
    params.staffId = piniaStoreInspection.record.staffId
    columns.value = departmentTasksColumns
    res = await taskDetail(params)
    break;
  case 'personnel-expireTaskNum':
    params.state = 'EXPIRE'
    columns.value = departmentTasksColumns
    params.staffId = piniaStoreInspection.record.staffId
    res = await taskDetail(params)
    break;
  case 'personnel-depInspectionNum':
    params.depId = piniaStoreInspection.record.depId
    params.staffId = piniaStoreInspection.record.staffId
    columns.value = inspectionRecordsColumns
    res = await inspectionDetail(params)
    break;
  case 'personnel-personageInspectionNum':
    params.staffId = piniaStoreInspection.record.staffId
    params.state = 'CONFIRMED'
    params.staffId = piniaStoreInspection.record.staffId
    columns.value = inspectionRecordsColumns
    res = await inspectionDetail(params)
    break;
  case 'personnel-abnormalHiddenDangerNum':
    params.staffId = piniaStoreInspection.record.staffId
    params.staffId = piniaStoreInspection.record.staffId
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'personnel-haveDoneHiddenDangerNum':
    params.staffId = piniaStoreInspection.record.staffId
    params.staffId = piniaStoreInspection.record.staffId
    params.state = 'COMPLETE'
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'target-inspectionNum':
    params.objId = piniaStoreInspection.record.objId
    columns.value = inspectionRecordsColumns
    res = await inspectionDetail(params)
    break;
  case 'target-taskNum':
    params.objId = piniaStoreInspection.record.objId
    columns.value = departmentTasksColumns
    res = await taskDetail(params)
    break;
  case 'target-abnormalHiddenDangerNum':
    params.objId = piniaStoreInspection.record.objId
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'target-validHiddenDangerNum':
    params.objId = piniaStoreInspection.record.objId
    params.state = 'CONFIRMED'
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'target-processedHiddenDangerNum':
    params.objId = piniaStoreInspection.record.objId
    params.state = 'COMPLETE'
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'target-untreatedHiddenDangerNum':
    params.objId = piniaStoreInspection.record.objId
    params.state = 'UNTREATED'
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'target-repairsNum':
    params.objId = piniaStoreInspection.record.objId
    columns.value = statisticsRepairColumns
    res = await objStatisticsRepairsDetail(params)
    break;
  case 'result-checkNotMatchNum':
    params.taskId = piniaStoreInspection.record.taskId
    columns.value = statisticsMismatchingColumns
    res = await checkDetail(params)
    break;
  case 'result-hiddenDangerNum':
    params.taskId = piniaStoreInspection.record.taskId
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'result-faultNum':
    params.taskId = piniaStoreInspection.record.taskId
    columns.value = statisticsRepairColumns
    res = await objStatisticsRepairsDetail(params)
    break;
  case 'department-taskTotalNum':
    params.depId = piniaStoreInspection.record.depId
    columns.value = departmentTasksColumns
    res = await taskDetail(params)
    break;
  case 'department-completeTaskNum':
    params.depId = piniaStoreInspection.record.depId
    params.state = 'OVER'
    columns.value = departmentTasksColumns
    res = await taskDetail(params)
    break;
  case 'department-expireTaskNum':
    params.depId = piniaStoreInspection.record.depId
    params.state = 'EXPIRE'
    columns.value = departmentTasksColumns
    res = await taskDetail(params)
    break;
  case 'department-abnormalHiddenDangerNum':
    params.depId = piniaStoreInspection.record.depId
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  case 'department-haveDoneHiddenDangerNum':
    params.depId = piniaStoreInspection.record.depId
    params.state = 'COMPLETE'
    columns.value = statisticShiddenDangerColumns
    res = await hiddenDangerDetail(params)
    break;
  default:
    break;
  }
  dataSource.value = res?.data?.records
  if (res?.data?.total) {
    pagination.total = res?.data?.total
  }
  tableLoading.value = false
}
// 导出
const exportTable = async () => {
  if (dataSource.value?.length === 0) {
    message.warning('当前记录暂无数据');
    return
  }
  let exportUrl = ''
  switch (piniaStoreInspection.value) {
  case 'personnel-depTaskNum':
    exportUrl = '/statistic-analysis/taskDetailExport'
    break;
  case 'personnel-personageTaskNum':
    exportUrl = '/statistic-analysis/taskDetailExport'
    break;
  case 'personnel-completeTaskNum':
    exportUrl = '/statistic-analysis/taskDetailExport'
    break;
  case 'personnel-expireTaskNum':
    exportUrl = '/statistic-analysis/taskDetailExport'
    break;
  case 'personnel-depInspectionNum':
    exportUrl = '/statistic-analysis/inspectionDetailExport'
    break;
  case 'personnel-personageInspectionNum':
    exportUrl = '/statistic-analysis/inspectionDetailExport'
    break;
  case 'personnel-abnormalHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'
    break;
  case 'personnel-haveDoneHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'
    break;
  case 'target-inspectionNum':
    exportUrl = '/statistic-analysis/inspectionDetailExport'
    break;
  case 'target-taskNum':
    exportUrl = '/statistic-analysis/taskDetailExport'
    break;
  case 'target-abnormalHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'

    break;
  case 'target-validHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'

    break;
  case 'target-processedHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'

    break;
  case 'target-untreatedHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'

    break;
  case 'target-repairsNum':
    exportUrl = '/statistic-analysis/objStatisticsRepairsDetailExport'

    break;
  case 'result-checkNotMatchNum':
    exportUrl = '/statistic-analysis/checkDetailExport'

    break;
  case 'result-hiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'

    break;
  case 'result-faultNum':
    exportUrl = '/statistic-analysis/objStatisticsRepairsDetailExport'

    break;
  case 'department-taskTotalNum':
    exportUrl = '/statistic-analysis/taskDetailExport'

    break;
  case 'department-completeTaskNum':
    exportUrl = '/statistic-analysis/taskDetailExport'

    break;
  case 'department-expireTaskNum':
    exportUrl = '/statistic-analysis/taskDetailExport'

    break;
  case 'department-abnormalHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'

    break;
  case 'department-haveDoneHiddenDangerNum':
    exportUrl = '/statistic-analysis/exportHiddenDangerDetail'

    break;
  default:
    break;
  }
  const param: ParamsType = JSON.parse(JSON.stringify(params))
  param.pageNumber = 1
  param.pageSize = pagination.total
  exportExcel(exportUrl, param, piniaStoreInspection.title + '统计')
}
const goPage = () => {
  history.go(-1);
}
const changePage = () => {
  processParameters()
}
onMounted(() => {
  processParameters()
})
</script>
<style scoped lang="less"></style>
