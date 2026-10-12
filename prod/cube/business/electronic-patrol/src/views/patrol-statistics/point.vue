<template>
  <GLayout :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" @click="exportData">导出</Button>
    </template>
    <template #content-data>
      <div class="mt-15px" />
      <Form class="mt-15px" style="margin-bottom: 12px;" layout="inline" :model="formState">
        <FormItem label="巡更时间:">
          <RangePicker
            v-model:value="time"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </FormItem>
        <FormItem label="所属区域:">
          <Cascader
            v-model:value="cascader"
            style="width: 200px"
            placeholder="请选择"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            :options="areaOptions"
            allow-clear
            show-search
            change-on-select
          />
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="请输入巡更点名称" />
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
        :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_POINT_STAT"
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
import { getlocation, getlocationExport } from '@/api/statistics-api'
import { getAreaList } from '@/api/ouaa'
import GLayout from '@/components/common/g-layout.vue'
import { Button, RangePicker, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AliasTable } from '@ghcloud/generic-component'
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
const areaOptions = ref([])
const cascader = ref<string[]>([])
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
    title: '巡更点',
    dataIndex: 'locationName',
    key: 'locationName',
    customRender: ({ record }) => {
      return `${record.locationName === '' ? '--' : record.locationName}`
    },
  },
  {
    title: '应巡次数',
    dataIndex: 'totalNum',
    key: 'totalNum',
  },
  {
    title: '巡更点区域',
    dataIndex: 'areaName',
    key: 'areaName',
  },
  {
    title: '实巡',
    dataIndex: 'realNum',
    key: 'realNum',
  },
  {
    title: '漏巡',
    dataIndex: 'omitNum',
    key: 'omitNum',
  },
  {
    title: '巡更率',
    dataIndex: 'patrolRatio',
    key: 'patrolRatio',
  },
  {
    title: '异常次数',
    dataIndex: 'abnormalNum',
    key: 'abnormalNum',
  },
  {
    title: '隐患数',
    dataIndex: 'hiddenDangerNum',
    key: 'hiddenDangerNum',
  },
  {
    title: '隐患处理数',
    dataIndex: 'hiddenDangerDisposeNum',
    key: 'hiddenDangerDisposeNum',
  },
])
const pageChange = (pageNumber: number, pageSize: number) => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}

const query = async (): Promise<void> => {
  formState.period = time.value.join(',') === ',' ? '' : time.value.join(',')
  formState.areaId = cascader.value.join(',')
  const { data } = await getlocation(formState)
  formState.total = data.total
  dataSource.value = data.records
}
const reset = (): void => {
  time.value = ['', '']
  cascader.value = []
  Object.assign(formState, {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    period: '',
    keyword: '',
  })
  query()
}
const exportData = async (): Promise<void> => {
  const { data } = await getlocationExport(formState)
  const link = document.createElement('a')
  const blob = new Blob([data as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', '巡更点统计.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
onMounted(() => {
  getAreaList().then((res) => {
    if (res.data) {
      areaOptions.value = res.data
    }
    query()
  })
})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
