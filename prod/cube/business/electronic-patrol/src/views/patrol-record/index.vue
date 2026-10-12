<template>
  <GLayout :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" :loading="exportLoading" @click="exportData">导出</Button>
    </template>
    <template #content-data>
      <div class="mt-15px" />
      <Form class="mt-15px" style="margin-bottom: 12px;" layout="inline" :model="formState">
        <FormItem label="任务开始时间:">
          <RangePicker v-model:value="time" value-format="YYYY-MM-DD" format="YYYY-MM-DD" />
        </FormItem>
        <FormItem label="部门:">
          <Select v-model:value="formState.depId" :options="daptlist" style="width:200px" />
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="请输入任务名称/巡更人员名称" />
        </FormItem>

        <FormItem>
          <Button type="primary" @click="handleSearch">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
      <AliasTable
        :columns="columns" :data-source="dataSource" :pagination="false" size="small"
        bordered
        :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_RECORD"
        :scroll-x="1000" :scroll-y="550"
      />
      <!-- <Table
        class="mt-15px" :pagination="false" :columns="columns" :data-source="dataSource"
        :form-state="false"
        :scroll=" {x: 1000,y: 550}" size="small" bordered :loading="loading"
        row-key="id"
      /> -->
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="formState.pageNumber" v-model:pageSize="formState.pageSize" show-size-changer
        :total="formState.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
  </GLayout>
</template>
<script lang="ts">
import { getDept } from '@/api/ouaa'
import { getRecordPage, taskRemoveBatch } from '@/api/record-api'
import { cubeElectronPatrolService } from '@/api/service'
import GLayout from '@/components/common/g-layout.vue'
import { Button, Popconfirm, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@ghcloud/cube-ui'
import { AliasTable } from '@ghcloud/generic-component'

import { useListQueryCache, usePageName } from '@ghcloud/cube-utils'
</script>
<script setup lang="ts">
const userouter = useRouter()
const { pageTitle } = usePageName()
const formState = reactive<RecordType.FormState>({
  depId: '',
  keyword: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  period: ''
})
const time = ref<[string, string] | [dayjs.Dayjs, dayjs.Dayjs] >([dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])
const queryCache = useListQueryCache({
  defaults: {
    depId: '',
    keyword: '',
    pageNumber: 1,
    pageSize: 10,
    period: '',
    time: [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')] as string[],
  },
  getState: () => ({
    depId: formState.depId,
    keyword: formState.keyword,
    pageNumber: formState.pageNumber,
    pageSize: formState.pageSize,
    period: formState.period,
    time: time.value as string[],
  }),
  setState: (next) => {
    formState.depId = (next.depId as string) ?? ''
    formState.keyword = (next.keyword as string) ?? ''
    formState.pageNumber = Number(next.pageNumber ?? 1)
    formState.pageSize = Number(next.pageSize ?? 10)
    const routeTime = next.time
    if (Array.isArray(routeTime) && routeTime.length === 2) {
      time.value = [String(routeTime[0]), String(routeTime[1])]
    }
  },
  decode: (query) => ({
    depId: typeof query.depId === 'string' ? query.depId : '',
    keyword: typeof query.keyword === 'string' ? query.keyword : '',
    pageNumber: typeof query.pageNumber === 'string' ? Number(query.pageNumber) : 1,
    pageSize: typeof query.pageSize === 'string' ? Number(query.pageSize) : 10,
    time: typeof query.time === 'string' ? query.time.split(',').filter(Boolean) : undefined,
  }),
  encode: (state) => ({
    depId: state.depId || undefined,
    keyword: state.keyword || undefined,
    pageNumber: String(state.pageNumber),
    pageSize: String(state.pageSize),
    time: Array.isArray(state.time) ? state.time.join(',') : undefined,
  })
})
const exportLoading = ref(false)
const exportData = async () => {
  try {
    exportLoading.value = true
    const params = {
      pageNumber: formState.pageNumber,
      pageSize: formState.pageSize,
      period: time.value.join(',') === ',' ? '' : time.value.join(','),
      depId: formState.depId,
      keyword: formState.keyword,
    }
    const data = await cubeElectronPatrolService.exportElectronRecord(params)
    const link = document.createElement('a')
    const blob = new Blob([data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', '巡更记录.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
  } finally {
    exportLoading.value = false
  }
}
const loading = ref<boolean>(false)
const dataSource = ref([])
const columns = ref<TableColumnType[]>(
  [
    {
      title: '任务名称',
      key: 'taskName',
      dataIndex: 'taskName',
      customRender: ({ record }) => {
        return `${record.taskName === '' ? '--' : record.taskName}`
      }
    },
    {
      title: '巡更人员',
      dataIndex: 'userName',
      key: 'userName',
      customRender: ({ record }) => {
        return `${record.userName === '' ? '--' : record.userName}`
      }
    },
    {
      title: '所属部门',
      dataIndex: 'userDepName',
      key: 'userDepName',
      customRender: ({ record }) => {
        return `${record.userDepName === '' ? '--' : record.userDepName}`
      }
    }, {
      title: '任务完成时间',
      dataIndex: 'completeDate',
      key: 'completeDate',
      customRender: ({ record }) => {
        return `${record.completeDate == null ? '--' : dayjs(record.completeDate).format('YYYY-MM-DD HH:mm:ss')}`
      }
    }, {
      title: '巡更路线',
      dataIndex: 'routeName',
      key: 'routeName'
    }, {
      title: '巡更点数',
      dataIndex: 'patrolLocationNum',
      key: 'patrolLocationNum'
    },
    {
      title: '已巡',
      dataIndex: 'completedNum',
      key: 'completedNum'
    },
    {
      title: '漏巡',
      dataIndex: 'undoneNum',
      key: 'undoneNum'
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 200,
      customRender: ({ record }) => {
        return [
          h(
            Button,
            { type: 'link', size: 'small', onClick: () => { editRow(record.id) } },
            { default: () => '详情' }
          ),
          h(
            Popconfirm,
            { title: '确定要删除该项？', danger: true, onConfirm: () => { delRow(record.id) } },
            {
              default: () => h(
                Button,
                { type: 'link', size: 'small', danger: true },
                { default: () => '删除' }
              )
            }
          )
        ]
      }
    }])
const pageChange = (pageNumber: number, pageSize: number): void => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}
const delRow = async (value: string): Promise<void> => {
  try {
    await taskRemoveBatch({ taskIdList: [value] })
    message.success('删除成功')
  } catch (error) {
    message.error('删除失败')
  }
  query()
}
const query = async (): Promise<void> => {
  try {
    loading.value = true
    formState.period = time.value.join(',') === ',' ? '' : time.value.join(',')
    const { data } = await getRecordPage(formState)
    formState.total = data.total
    dataSource.value = data.records
    await queryCache.sync()
  } catch (error) {
  } finally {
    loading.value = false
  }
}
const handleSearch = () => {
  formState.pageNumber = 1
  query()
}
const reset = () => {
  time.value = ['', '']
  Object.assign(formState, {
    depId: '',
    keyword: '',
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    period: ''
  })
  query()
}
const editRow = (id: string) => {
  userouter.push({ path: '/record/detiles', query: { id } })
}
const daptlist = ref([])
onMounted(async () => {
  await queryCache.hydrateAndQuery(query)
  const { data } = await getDept()
  daptlist.value = data.map((res: {
    name: string;
    id: string; }) => {
    return { label: res.name, value: res.id }
    })
})
</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');
</style>
