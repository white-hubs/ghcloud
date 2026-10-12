<template>
  <GLayout ref="table_layout_ref" :title="pageTitle">
    <template #header-btn>
      <Button type="primary" @click="exportTable">导出</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="对象类型">
          <Select v-model:value="formState.objType" placeholder="请选择对象类型" style="width: 150px;" allow-clear>
            <SelectOption v-for="item in inspectionType" :key="item.name" :value="item.name" />
          </Select>
        </FormItem>
        <FormItem label="巡检区域">
          <!-- <Select v-model:value="formState.area" placeholder="请选择巡检区域" style="width: 150px;" allow-clear>
            <SelectOption v-for="item in departmentType" :key="item.id" :value="item.name">{{ item.name }}</SelectOption>
          </Select> -->
          <Cascader v-model:value="formState.area" :options="departmentType" placeholder="请选择巡检区域" />
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
          tableCode="INSPECT_TARGET" 
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
import { objStatistics } from '@/api/inspection'
import { getAreaList } from '@/api/mdata'
import type { ObjectQeruy, InspectionPersonnel, InspectionTarget } from '@/api/model/inspection'
import { Button, type TableColumnsType } from 'ant-design-vue'
import { storeArea } from '@/stores/inspection'
import { exportExcel } from '@/utils/auth'
import { AliasTable } from '@ghcloud/generic-component'
import { queryParameter, usePageName } from '@ghcloud/cube-utils'
interface InspectionResults {
  period: [Dayjs, Dayjs];
  name: string;
  area: string[];
  objType: string | undefined;
}
interface Department {
  id: string;
  name: string;
}
const { pageTitle } = usePageName()
const piniaStoreInspection = storeArea()
const formState = reactive<InspectionResults>({
  period: [dayjs().startOf('month'), dayjs()],
  name: '',
  area: [],
  objType: undefined
})
const tableLoading = ref<boolean>(false)
const dataSource = ref<InspectionTarget[]>([])
const inspectionType: Department[] = [
  { id: 'DEVICE', name: '设备' },
  { id: 'STALL', name: '档位' },
  { id: 'PROPERTY', name: '资产' },
  { id: 'SITE_POINT', name: '现场点' },
  { id: 'RISK_SOURCE', name: '风险源' },
]
const departmentType = ref<Department[]>([])
const columns: TableColumnsType = [
  {
    title: '对象名称',
    dataIndex: 'objName',
    align: 'center',
    ellipsis: true,
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '对象类型',
    dataIndex: 'objType',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '所在区域',
    dataIndex: 'area',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '巡检次数',
    dataIndex: 'inspectionNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'target-inspectionNum','巡检记录') },
          { default: () => record.inspectionNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '巡检任务数',
    dataIndex: 'taskNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'target-taskNum','巡检任务') },
          { default: () => record.taskNum ?? '-'  }
        ),
      ]
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
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'target-abnormalHiddenDangerNum','隐患记录') },
          { default: () => record.abnormalHiddenDangerNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '已处理隐患数',
    dataIndex: 'processedHiddenDangerNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'target-processedHiddenDangerNum','隐患记录') },
          { default: () => record.processedHiddenDangerNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '未处理隐患数',
    dataIndex: 'untreatedHiddenDangerNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'target-untreatedHiddenDangerNum','隐患记录') },
          { default: () => record.untreatedHiddenDangerNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '隐患处理率',
    dataIndex: 'hiddenDangerDisposeRatio',
    align: 'center'
  },
  {
    title: '报修次数',
    dataIndex: 'repairsNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'target-repairsNum','报修记录') },
          { default: () => record.repairsNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '巡检平均耗时',
    dataIndex: 'inspectionAveTime',
    align: 'center'
  }
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
  const params: ObjectQeruy = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.pageNumber,
    period: timeArr ? timeArr.join() : '',
    name: formState.name,
    objType: formState.objType ? inspectionType.filter(item => item.name === formState.objType)[0].id : '',
    area: formState.area ? formState.area[formState.area.length - 1] : ''
  }
  return params
}
// 获取部门
const getInspectionType = async () => {
  const res = await getAreaList()
  res.data = JSON.parse(JSON.stringify(res.data).replace(/"name"/g, '"label"'))
  res.data = JSON.parse(JSON.stringify(res.data).replace(/"id"/g, '"value"'))
  if (res.data) {
    departmentType.value = res.data
  }
}
// 查询
const queryResult = async () => {
  tableLoading.value = true
  queryParameter.setAddressQuery({
    objType: formState.objType || undefined,
    area: formState.area?.join(',') || undefined,
    period: formState.period?.map((item) => dayjs(item).format('YYYY-MM-DD')).join(',') || undefined,
    name: formState.name || undefined,
    pageSize: pagination.pageSize === 10 ? undefined : pagination.pageSize,
    pageNumber: pagination.pageNumber === 1 ? undefined : pagination.pageNumber,
  })
  const { data } = await objStatistics(processParamet())
  if (data === null) {
    throw new Error('sytnax data is null')
  }
  pagination.total = data.total
  dataSource.value = data.records
  tableLoading.value = false
}
// 重置
const resetting = () => {
  pagination.pageNumber = 1
  pagination.pageSize = 10
  formState.period = [dayjs().startOf('month'), dayjs()]
  formState.name = ''
  formState.area = []
  formState.objType = undefined
  dataSource.value = []
  queryParameter.setAddressQuery({})
  queryResult()
}
// 导出
const exportTable = async () => {
  exportExcel('/statistic-analysis/objStatisticsExport', processParamet(), '巡检对象统计')
}
// 跳转下钻页面
const jumpDrilling = (record: InspectionPersonnel, value: string, title: string) => {
  const params = {
    period: processParamet().period
  }
  const data = {
    objId: record.objId,
    staffId: record.staffId
  }
  piniaStoreInspection.params = params
  piniaStoreInspection.record = data
  piniaStoreInspection.value = value
  piniaStoreInspection.title = title
  // router.push({path:'/drillingInPage',query:{
  //   data:'/target'
  // }})
  history.pushState({}, 'null', `/portal/inspect/drillingInPage?tableCode=${value}`)
}
const pageChange = () => {
  queryResult()
}
onMounted(async () => {
  const cacheQuery = queryParameter.getQuery() || {}
  formState.objType = (cacheQuery.objType as string) || undefined
  formState.name = (cacheQuery.name as string) || ''
  if (typeof cacheQuery.area === 'string' && cacheQuery.area) {
    formState.area = cacheQuery.area.split(',').filter(Boolean)
  }
  if (typeof cacheQuery.period === 'string' && cacheQuery.period) {
    const periodArr = cacheQuery.period.split(',').filter(Boolean)
    if (periodArr.length === 2) {
      formState.period = [dayjs(periodArr[0]), dayjs(periodArr[1])]
    }
  }
  pagination.pageSize = Number(cacheQuery.pageSize ?? 10)
  pagination.pageNumber = Number(cacheQuery.pageNumber ?? 1)
  await getInspectionType()
  await queryResult()
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
