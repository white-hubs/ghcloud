<template>
  <GLayout ref="table_layout_ref" :title="pageTitle">
    <template #header-btn>
      <Button type="primary" @click="exportTable">导出</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="巡检部门">
          <Select v-model:value="formState.depName" placeholder="请选择巡检部门" style="width: 150px;" allow-clear>
            <SelectOption v-for="item in inspectionType" :key="item.id" :value="item.name">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="巡检时间">
          <RangePicker v-model:value="formState.period" :allow-clear="false" />
        </FormItem>
        <FormItem label="">
          <Input v-model:value="formState.name" placeholder="人员姓名、部门名称" />
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
        tableCode="INSPECT_PERSON" 
        applicationCode="INSPECTION"
        style="height: 560px;overflow-y: scroll;" :loading="tableLoading" :data-source="dataSource" :columns="columns"
        :pagination="false"
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
import { staffStatistics } from '@/api/inspection'
import type { PersonnelQeruy, InspectionPersonnel } from '@/api/model/inspection'
import { Button, type TableColumnsType } from 'ant-design-vue'
import { storeArea } from '@/stores/inspection'
import type { Type } from '@/typings/types'
import { exportExcel } from '@/utils/auth'
import { organizationsList } from '@/api/ouaa'
import { AliasTable } from '@ghcloud/generic-component'
import { queryParameter, usePageName } from '@ghcloud/cube-utils'
interface InspectionResults {
  period: [Dayjs, Dayjs];
  depName: string | undefined;
  name: string;
}
const { pageTitle } = usePageName()
const piniaStoreInspection = storeArea()
const formState = reactive<InspectionResults>({
  period: [dayjs().startOf('month'), dayjs()],
  depName: undefined,
  name: ''
})
const tableLoading = ref<boolean>(false)
const dataSource = ref<InspectionPersonnel[]>([])
const inspectionType = ref<Type[]>([])
const columns: TableColumnsType = [
  {
    title: '人员姓名',
    dataIndex: 'staffName',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '所属部门',
    dataIndex: 'depName',
    width: 180,
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '部门任务总数',
    dataIndex: 'depTaskNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-depTaskNum','任务记录') },
          { default: () => record.depTaskNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '个人任务总数',
    dataIndex: 'personageTaskNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-personageTaskNum','任务记录') },
          { default: () => record.personageTaskNum ?? '-'  }
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
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-completeTaskNum','任务记录') },
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
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-expireTaskNum','任务记录') },
          { default: () => record.expireTaskNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '任务占比',
    dataIndex: 'taskProportion',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '任务完成率',
    dataIndex: 'taskCompleteRatio',
    align: 'center'
  },
  {
    title: '稽查平均匹配率',
    dataIndex: 'checkMatchingRatio',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '部门巡检次数',
    dataIndex: 'depInspectionNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-depInspectionNum','巡检记录') },
          { default: () => record.depInspectionNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '个人巡检次数',
    dataIndex: 'personageInspectionNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-personageInspectionNum','巡检记录') },
          { default: () => record.personageInspectionNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '次数占比',
    dataIndex: 'personageNumRatio',
    align: 'center'
  },
  {
    title: '巡检耗时',
    dataIndex: 'inspectionElapsedTimeStr',
    align: 'center'
  },
  {
    title: '发现隐患数',
    dataIndex: 'abnormalHiddenDangerNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-abnormalHiddenDangerNum','隐患记录') },
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
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'personnel-haveDoneHiddenDangerNum','隐患记录') },
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
  const params: PersonnelQeruy = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.pageNumber,
    period: timeArr ? timeArr.join() : '',
    depName: formState.depName,
    name: formState.name
  }
  return params
}
// 获取部门
const getInspectionType = async () => {
  const res = await organizationsList()
  inspectionType.value = res.data
}
// 查询
const queryResult = async () => {
  tableLoading.value = true
  queryParameter.setAddressQuery({
    period: formState.period?.map((item) => dayjs(item).format('YYYY-MM-DD')).join(',') || undefined,
    depName: formState.depName || undefined,
    name: formState.name || undefined,
    pageSize: pagination.pageSize === 10 ? undefined : pagination.pageSize,
    pageNumber: pagination.pageNumber === 1 ? undefined : pagination.pageNumber,
  })
  const { data } = await staffStatistics(processParamet())
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
  formState.depName = undefined
  formState.name = ''
  pagination.pageNumber = 1
  pagination.pageSize = 10
  queryParameter.setAddressQuery({})
  queryResult()
}
// 导出
const exportTable = async () => {
  exportExcel('/statistic-analysis/staffStatisticsExport', processParamet(), '人员巡检统计')
}

// 跳转下钻页面
const jumpDrilling = (record: InspectionPersonnel, value: string, title: string) => {
  const params = {
    period: processParamet().period
  }
  const data = {
    depId: record.depId,
    staffId: record.staffId
  }
  piniaStoreInspection.params = params
  piniaStoreInspection.record = data
  piniaStoreInspection.value = value
  piniaStoreInspection.title = title
  // router.push({path:'/drillingInPage',query:{
  //   data:'/personnel'
  // }})
  history.pushState({}, 'null', `/portal/inspect/drillingInPage?tableCode=${value}`)
}
const pageChange = () => {
  queryResult()
}
onMounted(() => {
  const cacheQuery = queryParameter.getQuery() || {}
  formState.depName = (cacheQuery.depName as string) || undefined
  formState.name = (cacheQuery.name as string) || ''
  if (typeof cacheQuery.period === 'string' && cacheQuery.period) {
    const periodArr = cacheQuery.period.split(',').filter(Boolean)
    if (periodArr.length === 2) {
      formState.period = [dayjs(periodArr[0]), dayjs(periodArr[1])]
    }
  }
  pagination.pageSize = Number(cacheQuery.pageSize ?? 10)
  pagination.pageNumber = Number(cacheQuery.pageNumber ?? 1)
  // columns.forEach(item=>{
  //   item.customHeaderCell = () => ({
  //           style: {
  //             whiteSpace: 'nowrap',
  //             textOverflow: 'unset',
  //             overflowX: 'scroll',
  //           },
  //         })
  // })
  getInspectionType()
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
:deep(.inspection-table-thead>tr>th) {
      width: 150px;
}
</style>
