<template>
  <GLayout :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" @click="exportData">导出</Button>
    </template>
    <template #content-data>
      <div class="mt-15px" />
      <Form layout="inline" style="margin-bottom: 12px;" :model="formState">
        <FormItem label="巡更时间:">
          <RangePicker
            v-model:value="time"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </FormItem>
        <FormItem label="部门:">
          <Select
            v-model:value="formState.depId"
            :options="daptlist"
            style="width: 200px"
          />
        </FormItem>
        <FormItem>
          <Input
            v-model:value="formState.keyword"
            placeholder="请输入巡更人员名称"
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="query">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
      <AliasTable
        :columns="columns" :data-source="dataSource" :pagination="false" size="small"
        bordered
        :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_LINE_STAT"
        :scroll-x="1000" :scroll-y="450"
      />
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="formState.pageNumber"
        v-model:pageSize="formState.pageSize"
        show-size-changer
        :total="formState.total"
        :default-current="1"
        :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
  </GLayout>
</template>
<script lang="ts">
import { getpersonnel, getpersonnelExport } from '@/api/statistics-api'
import GLayout from '@/components/common/g-layout.vue'
import { Button, RangePicker, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AliasTable } from '@ghcloud/generic-component'
import { getDept } from '@/api/ouaa'
import { onMounted, reactive, ref } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
</script>
<script setup lang="ts">
const { pageTitle } = usePageName()
const time = ref<[string, string] | [dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])
const formState = reactive<Statistics.FormState>({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  period: '',
})
const loading = ref<boolean>(false)
const dataSource = ref([])
const columns = ref<TableColumnType[]>([
  {
    title: '序号',
    width: 70,
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '巡更人员',
    dataIndex: 'userName',
    key: 'userName',
    customRender: ({ record }) => {
      return `${record.userName === '' ? '--' : record.userName}`
    },
  },
  {
    title: '所属部门',
    dataIndex: 'depName',
    key: 'depName',
    customRender: ({ record }) => {
      return `${record.depName === '' ? '--' : record.depName}`
    },
  },
  {
    title: '巡更任务数',
    dataIndex: 'taskNum',
    key: 'taskNum',
  },
  {
    title: '异常任务数',
    dataIndex: 'abnormalTaskNum',
    key: 'abnormalTaskNum',
  },
  {
    title: '巡更点总数',
    dataIndex: 'totalNum',
    key: 'totalNum',
  },
  {
    title: '已巡更点数',
    dataIndex: 'realNum',
    key: 'realNum',
  },
  {
    title: '漏巡更点数',
    dataIndex: 'omitNum',
    key: 'omitNum',
  },
  {
    title: '巡更率',
    dataIndex: 'patrolRatio',
    key: 'patrolRatio',
  },
])
const daptlist = ref([])
const pageChange = (pageNumber: number, pageSize: number) => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}

const query = async () => {
  formState.period = time.value.join(',') === ',' ? '' : time.value.join(',')
  const { data } = await getpersonnel(formState)
  formState.total = data.total
  dataSource.value = data.records
}
const reset = () => {
  time.value = ['', '']
  Object.assign(formState, {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    period: '',
    depId: '',
    keyword: '',
  })
  query()
}
const exportData = async () => {
  const { data } = await getpersonnelExport(formState)
  const link = document.createElement('a')
  const blob = new Blob([data as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', '巡更人员统计.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
onMounted(async () => {
  query()
  const { data } = await getDept()
  daptlist.value = data.map((res: { name: string; id: string; }) => {
    return {
      label: res.name,
      value: res.id,
    }
  })
})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
