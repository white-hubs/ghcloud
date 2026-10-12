<template>
  <GLayout ref="table_layout_ref" :title="pageTitle">
    <template #header-btn>
      <Button type="primary" @click="exportTable">导出</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="巡检类型">
          <Select v-model:value="formState.typeId" placeholder="请选择巡检类型" style="width: 150px;">
            <SelectOption v-for="item in inspectionType" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="发布时间">
          <RangePicker v-model:value="formState.period" :allow-clear="false" />
        </FormItem>
        <FormItem label="">
          <Input v-model:value="formState.taskName" placeholder="巡检任务" />
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
        tableCode="INSPECT_RESULT" 
        applicationCode="INSPECTION"
        style="height: 600px;overflow-y: scroll;" :loading="tableLoading" :data-source="dataSource" :columns="columns"
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
import { onMounted, reactive, ref, h } from 'vue'
import dayjs, { type Dayjs } from 'dayjs';
import { inspectTypeList, resultStatistics } from '@/api/inspection'
import type { InspectionResultList } from '@/api/model/inspection'
import { storeArea } from '@/stores/inspection'
import type { Type } from '@/typings/types'
import { Button, Tag } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue'
import { exportExcel } from '@/utils/auth'
import { AliasTable } from '@ghcloud/generic-component'
import { queryParameter, usePageName } from '@ghcloud/cube-utils'
interface InspectionResults{
  typeId: string|undefined;
  period: [Dayjs, Dayjs];
  taskName: string;
}
interface InspectionObject{
  typeId: string;
  period: string;
  taskName: string;
  pageSize?:number;
  pageNumber?:number;
}
const { pageTitle } = usePageName()
const piniaStoreInspection = storeArea();

const formState = reactive<InspectionResults>({
  typeId: undefined,
  period: [dayjs().startOf('month'), dayjs()],
  taskName: ''
})
const tableLoading = ref<boolean>(false)
const dataSource = ref<InspectionResultList[]>([])
const columns:TableColumnsType = [
  {
    title: '巡检任务',
    dataIndex: 'name',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检对象数',
    dataIndex: 'targetNum',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检类型',
    dataIndex: 'typeName',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检人员',
    dataIndex: 'inspectionStaff',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '稽查人员',
    dataIndex: 'checkStaff',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检结果',
    dataIndex: 'checkResult',
    align: 'center',
    customRender: ({ text }) => {
      if (text === '正常') {
        return [
          h(Tag, { content: '正常', color: 'success' }, { default: () => text as string || '--' })
        ]
      } else {
        return [
          h(Tag, { content: '异常', color: 'error' }, { default: () => text as string || '--' })
        ]
      }
    }
  },
  {
    title: '稽查结果匹配率',
    dataIndex: 'checkMatchRatio',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '稽查不匹配数',
    dataIndex: 'checkNotMatchNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'result-checkNotMatchNum','稽查不匹配项') },
          { default: () => record.checkNotMatchNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '异常隐患数',
    dataIndex: 'hiddenDangerNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'result-hiddenDangerNum', '隐患记录') },
          { default: () => record.hiddenDangerNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '巡检报修数',
    dataIndex: 'faultNum',
    align: 'center',
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { class:"jump",type: 'link', size: 'small', onClick: () => jumpDrilling(record,'result-faultNum' , '报修记录') },
          { default: () => record.faultNum ?? '-'  }
        ),
      ]
    }
  },
  {
    title: '巡检耗时',
    dataIndex: 'elapsedTime',
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  }
]
const pagination = reactive({
  pageSize: 10,
  pageNumber: 1,
  total: 0
})
const inspectionType = ref<Type[]>([])

// 获取巡检类型
const getInspectionType = async () => {
  const res = await inspectTypeList()
  inspectionType.value = res.data
}
// 处理接口参数
const processParamet = () => {
  const timeArr = formState.period?.map((item:Dayjs) => {
    return item ? dayjs(item).format('YYYY-MM-DD') : ''
  });
  const params:InspectionObject = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.pageNumber,
    period: timeArr ? timeArr.join() : '',
    taskName: formState.taskName,
    typeId: formState.typeId || ''
  }
  return params
}
// 导出
const exportTable = async () => {
  exportExcel('/statistic-analysis/resultStatisticsExport', processParamet(), '巡检结果统计')
}
// 查询
const queryResult = async () => {
  tableLoading.value = true
  queryParameter.setAddressQuery({
    typeId: formState.typeId || undefined,
    period: formState.period?.map((item) => dayjs(item).format('YYYY-MM-DD')).join(',') || undefined,
    taskName: formState.taskName || undefined,
    pageSize: pagination.pageSize === 10 ? undefined : pagination.pageSize,
    pageNumber: pagination.pageNumber === 1 ? undefined : pagination.pageNumber,
  })
  const timeArr = formState.period.map((item:Dayjs) => {
    return item ? dayjs(item).format('YYYY-MM-DD') : ''
  });
  const params = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.pageNumber,
    typeId: formState.typeId || '',
    period: timeArr[0] ? timeArr.join() : null,
    taskName: formState.taskName
  }
  const { data } = await resultStatistics(params)
  if (data === null) {
    throw new Error('sytnax data is null')
  }
  pagination.total = data.total
  dataSource.value = data.records
  tableLoading.value = false
}
// 重置
const resetting = () => {
  formState.typeId = undefined
  formState.taskName = ''
  formState.period = [dayjs().startOf('month'), dayjs()]
  pagination.pageNumber = 1
  pagination.pageSize = 10
  queryParameter.setAddressQuery({})
  queryResult()
}
// 跳转下钻页面
const jumpDrilling = (record:InspectionResultList, value:string, title:string) => {
  const params = {
    period: processParamet().period
  }
  const data = {
    typeId: formState.typeId,
    taskId: record.id
  }
  piniaStoreInspection.params = params
  piniaStoreInspection.record = data
  piniaStoreInspection.value = value
  piniaStoreInspection.title = title
  // router.push({path:'/drillingInPage',query:{
  //   data:'/result'
  // }})
  history.pushState({}, "null", `/portal/inspect/drillingInPage?tableCode=${value}`);

}
const pageChange = () => {
  queryResult()
}
onMounted(() => {
  const cacheQuery = queryParameter.getQuery() || {}
  formState.typeId = (cacheQuery.typeId as string) || undefined
  formState.taskName = (cacheQuery.taskName as string) || ''
  if (typeof cacheQuery.period === 'string' && cacheQuery.period) {
    const periodArr = cacheQuery.period.split(',').filter(Boolean)
    if (periodArr.length === 2) {
      formState.period = [dayjs(periodArr[0]), dayjs(periodArr[1])]
    }
  }
  pagination.pageSize = Number(cacheQuery.pageSize ?? 10)
  pagination.pageNumber = Number(cacheQuery.pageNumber ?? 1)
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

</style>
