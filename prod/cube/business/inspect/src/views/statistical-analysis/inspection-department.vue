<template>
  <GLayout ref="table_layout_ref" :title="pageTitle">
    <template #header-btn>
      <Button type="primary" @click="exportTable">导出</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="巡检时间">
          <RangePicker v-model:value="formState.period" :allow-clear="false" />
        </FormItem>
        <FormItem label="">
          <Input v-model:value="formState.depName" placeholder="部门名称" />
        </FormItem>
        <FormItem label="">
          <Button type="primary" @click="queryResult">查询</Button>
        </FormItem>
        <FormItem label="">
          <Button type="primary" @click="resetting">重置</Button>
        </FormItem>
      </Form>
    </template>
    <template #content-table>
      <AliasTable 
          tableCode="INSPECT_DEPARTMENT" 
          applicationCode="INSPECTION"
        style="height: 600px;overflow-y: scroll;" :loading="tableLoading" :data-source="dataSource"
        :columns="columns" :pagination="false"
      >
      </AliasTable>
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize" show-size-changer
        :total="pagination.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
  </GLayout>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { departmentStatistics } from '@/api/inspection'
import type { InspectionDepartment, DepartmentQeruy } from '@/api/model/inspection'
import { storeArea } from '@/stores/inspection'
import { Button, type TableColumnsType } from 'ant-design-vue'
import { exportExcel } from '@/utils/auth'
import { AliasTable } from '@ghcloud/generic-component'
import { queryParameter, usePageName } from '@ghcloud/cube-utils'
interface InspectionResults {
  period: [Dayjs, Dayjs];
  depName: string;
}
const { pageTitle } = usePageName()
const formState = reactive<InspectionResults>({
  period: [dayjs().startOf('month'), dayjs()],
  depName: ''
})
const piniaStoreInspection = storeArea()
const tableLoading = ref<boolean>(false)
const dataSource = ref<InspectionDepartment[]>([])
const columns: TableColumnsType = [
  {
    title: '所属部门',
    dataIndex: 'depName',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '覆盖对象数',
    dataIndex: 'coverObjNum',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '对象覆盖率',
    dataIndex: 'coverObjRatio',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '参与巡检人数',
    dataIndex: 'personNum',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '任务总数',
    dataIndex: 'taskTotalNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'department-taskTotalNum','任务记录') },
          { default: () => record.taskTotalNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '完成任务数',
    dataIndex: 'completeTaskNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'department-completeTaskNum','任务记录') },
          { default: () => record.completeTaskNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '过期未执行任务数',
    dataIndex: 'expireTaskNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'department-expireTaskNum','任务记录') },
          { default: () => record.expireTaskNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '任务完成率',
    dataIndex: 'taskCompleteRatio',
    align: 'center'
  },
  {
    title: '巡检次数',
    dataIndex: 'inspectionNum',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检时间',
    dataIndex: 'inspectionElapsedTimeStr',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '稽查平均匹配率',
    dataIndex: 'checkMatchRatio',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '发现隐患数',
    dataIndex: 'abnormalHiddenDangerNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'department-abnormalHiddenDangerNum','隐患记录') },
          { default: () => record.abnormalHiddenDangerNum ?? '-'  }
        ),
      ]
    }
    
  },
  {
    title: '已处理隐患数',
    dataIndex: 'haveDoneHiddenDangerNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'department-haveDoneHiddenDangerNum','隐患记录') },
          { default: () => record.haveDoneHiddenDangerNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '隐患处理率',
    dataIndex: 'hiddenDangerDisposeRatio',
    align: 'center'
  },
]
const pagination = reactive({
  pageSize: 10,
  pageNumber: 1,
  total: 0
})

// 处理接口参数
const processParamet = () => {
  const timeArr = formState.period?.map((item: Dayjs) => {
    return item ? dayjs(item).format('YYYY-MM-DD') : ''
  })
  const params: DepartmentQeruy = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.pageNumber,
    period: timeArr ? timeArr.join() : '',
    depName: formState.depName
  }
  return params
}

// 查询
const queryResult = async () => {
  tableLoading.value = true
  queryParameter.setAddressQuery({
    period: formState.period?.map((item) => dayjs(item).format('YYYY-MM-DD')).join(',') || undefined,
    depName: formState.depName || undefined,
    pageSize: pagination.pageSize === 10 ? undefined : pagination.pageSize,
    pageNumber: pagination.pageNumber === 1 ? undefined : pagination.pageNumber,
  })
  const { data } = await departmentStatistics(processParamet())
  if (data === null) {
    throw new Error('sytnax data is null')
  }
  pagination.total = data.total
  dataSource.value = data.records
  tableLoading.value = false
}
// 重置
const resetting = () => {
  formState.period = [dayjs().startOf('month'), dayjs()]
  formState.depName = ''
  pagination.pageNumber = 1
  pagination.pageSize = 10
  queryParameter.setAddressQuery({})
  queryResult()
}
// 导出
const exportTable = async () => {
  exportExcel('/statistic-analysis/departmentStatisticsExport', processParamet(), '部门巡检统计')
}
// 跳转下钻页面
const jumpDrilling = (record: InspectionDepartment, value: string, title: string) => {
  const params = {
    period: processParamet().period
  }
  const data = {
    depName: formState.depName,
    depId: record.depId
  }
  piniaStoreInspection.params = params
  piniaStoreInspection.record = data
  piniaStoreInspection.value = value
  piniaStoreInspection.title = title
  // router.push({path:'/drillingInPage',query:{
  //   data:'/department'
  // }})
  history.pushState({}, 'null', `/portal/inspect/drillingInPage?tableCode=${value}`)
}
const pageChange = () => {
  queryResult()
}
onMounted(() => {
  const cacheQuery = queryParameter.getQuery() || {}
  formState.depName = (cacheQuery.depName as string) || ''
  if (typeof cacheQuery.period === 'string' && cacheQuery.period) {
    const periodArr = cacheQuery.period.split(',').filter(Boolean)
    if (periodArr.length === 2) {
      formState.period = [dayjs(periodArr[0]), dayjs(periodArr[1])]
    }
  }
  pagination.pageSize = Number(cacheQuery.pageSize ?? 10)
  pagination.pageNumber = Number(cacheQuery.pageNumber ?? 1)
  queryResult()
})
</script>
<style scoped lang="less">
.qualified {
  color: #70b603;
}

.noQualified {
  color: #d9001b;
}

.jump {
  color: #1890ff;
  cursor: pointer;
}
</style>
