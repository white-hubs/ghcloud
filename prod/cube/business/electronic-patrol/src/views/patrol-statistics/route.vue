<template>
  <GLayout :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" :loading="exportLoading" @click="exportData">导出</Button>
    </template>
    <template #content-data>
      <div class="mt-15px" />
      <Form layout="inline" :model="formState">
        <FormItem label="巡更时间:" style="padding-right: 0; margin-right: 10px; margin-bottom: 10px">
          <DateRangePicker v-model:value="formState.period" />
        </FormItem>
        <FormItem style="padding-right: 0; margin-right: 10px; margin-bottom: 10px">
          <Input
            v-model:value="formState.keyword"
            placeholder="请输入巡更路线名称"
            style="width: 220px"
          />
        </FormItem>
        <FormItem style="padding-right: 0; margin-right: 15px; margin-bottom: 10px">
          <Button type="primary" @click="query">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
      <!-- <Table
        :pagination="false"
        class="mt-15px"
        :columns="columns"
        :data-source="dataSource"
        :form-state="false"
        :scroll="{ x: 1000, y: 550 }"
        size="small"
        bordered
        :loading="loading"
        row-key="id"
      /> -->
      <AliasTable
        :columns="columns" :data-source="dataSource" :pagination="false" size="small"
        bordered
        :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_ROUTE_STAT"
        :scroll-x="1000" :scroll-y="450"
      />
    </template>
    <template #footer-page>
      <Page
        v-model:current="formState.pageNumber"
        v-model:pageSize="formState.pageSize"
        v-model:total="formState.total"
        show-size-changer
        @change="pageChange"
      />
    </template>
  </GLayout>
</template>
<script lang="ts">
import GLayout from '@/components/common/g-layout.vue'
import { h, onMounted, reactive, ref } from 'vue'
import { AliasTable } from '@ghcloud/generic-component'
import { cubeElectronPatrolService } from '@/api/service'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Table, message } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { usePageName } from '@ghcloud/cube-utils'
</script>
<script setup lang="ts">
const { pageTitle } = usePageName()
const time = ref(['', ''])
const formState = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  period: [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
  keyword: '',
})
const exportLoading = ref(false)
const loading = ref<boolean>(false)
const dataSource = ref<unknown[]>([])
const columns = ref([
  {
    title: '序号',
    width: 70,
    fixed: 'left',
    customRender: ({ index }: { index: number; }) => {
      return index + 1
    },
  },
  {
    title: '巡更路线',
    dataIndex: 'patrolRouteName',
    ellipsis: true,
    width: 180,
    fixed: 'left',
    customRender: ({ text }: { text: string; }) => {
      return h(PopOver, { content: text || '--' }, text || '--')
    },
  },
  {
    title: '包含巡更点',
    dataIndex: 'patrolLocationNumber',
    ellipsis: true,
    width: 180,
    customRender: ({ text }: { text: string | number; }) => {
      const valText = text === undefined || text === null ? '' : text
      return h(PopOver, { content: valText || '--' }, valText || '--')
    },
  },
  {
    title: '应巡查的点位次数',
    dataIndex: 'totalNum',
    ellipsis: true,
    width: 180,
    customRender: ({ text }: { text: string | number; }) => {
      const valText = text === undefined || text === null ? '' : text
      return h(PopOver, { content: valText || '--' }, valText || '--')
    },
  },
  {
    title: '实际巡查的点位次数',
    dataIndex: 'realNum',
    ellipsis: true,
    width: 180,
    customRender: ({ text }: { text: string | number; }) => {
      const valText = text === undefined || text === null ? '' : text
      return h(PopOver, { content: valText || '--' }, valText || '--')
    },
  },
  {
    title: '漏巡',
    dataIndex: 'omitNum',
    ellipsis: true,
    width: 180,
    customRender: ({ text }: { text: string | number; }) => {
      const valText = text === undefined || text === null ? '' : text
      return h(PopOver, { content: valText || '--' }, valText || '--')
    },
  },
  {
    title: '路线完成率',
    dataIndex: 'patrolRatio',
    ellipsis: true,
    width: 180,
    customRender: ({ text }: { text: string | number; }) => {
      const valText = text === undefined || text === null ? '' : text
      return h(PopOver, { content: valText || '--' }, valText || '--')
    },
  },
])
const pageChange = (pageNumber: number, pageSize: number) => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}

const query = async () => {
  try {
    loading.value = true
    formState.pageNumber = 1
    const params = {
      pageNumber: formState.pageNumber,
      pageSize: formState.pageSize,
      period: formState.period ? formState.period.join(',') : '',
      keyword: formState.keyword
    }
    const res = await cubeElectronPatrolService.getElectronRoutePage(params)
    if (res) {
      const { records, total } = res
      dataSource.value = records
      formState.total = total
    }
  } catch (error) {
    message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
  } finally {
    loading.value = false
  }
}
const reset = () => {
  time.value = []
  Object.assign(formState, {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    period: [],
    keyword: '',
  })
  query()
}
const exportData = async () => {
  try {
    exportLoading.value = true
    const params = {
      pageNumber: formState.pageNumber,
      pageSize: formState.pageSize,
      period: formState.period ? formState.period.join(',') : '',
      keyword: formState.keyword
    }
    const data = await cubeElectronPatrolService.exportElectronRoute(params)
    const link = document.createElement('a')
    const blob = new Blob([data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', '巡更路线统计.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
  } finally {
    exportLoading.value = false
  }
}
onMounted(async () => {
  query()
})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
