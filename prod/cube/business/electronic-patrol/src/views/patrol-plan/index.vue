<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #header-btn>
      <Button type="primary" @click="addPlan">新增</Button>
    </template>
    <template #content-data>
      <Tabs v-model:activeKey="activeKey" hide-add type="card" @change="tabchange">
        <TabPane v-for="item in planType" :key="item.key" :tab="gettabname(item.name)">
          <Form layout="inline" style="margin-bottom: 12px;" :model="formState">
            <FormItem label="计划:">
              <Input v-model:value="formState.keyword" placeholder="请输入计划" />
            </FormItem>
            <FormItem label="时间段:">
              <TimeRangePicker v-model:value="formState.executeData" format="HH:mm" value-format="HH:mm" />
            </FormItem>
            <FormItem label="周期">
              <Select v-model:value="formState.patrolCycle" placeholder="请选择" :options="options" style="width: 180px" />
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
            :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_PLAN"
            :scroll-x="1000" :scroll-y="550"
          />
          <!-- <Table :pagination="false" class="mt-15px" :columns="columns" :data-source="dataSource" :form-state="false"
            :scroll="{ x: 1000, y: 550 }" size="small" bordered :loading="loading" row-key="id">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'planName'">
                <div :title="record.planName" style="
                    width: 120px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  ">
                  <Popover>
                    <template #content>
                      {{ record.planName === "" ? "--" : record.planName }}
                    </template>
{{ record.planName === "" ? "--" : record.planName }}
</Popover>
</div>
</template>
<template v-if="column.dataIndex === 'patrolWay'">
                <div>
                  {{
                  record.patrolWay != ""
                  ? record.patrolWay.replace("BLUETOOTH", "蓝牙")
                  : "--"
                  }}
                </div>
              </template>
<template v-if="column.dataIndex === 'action'">
                <Button type="link" size="small" @click="detilsRow(record.id, 'detiles')">详情</Button>
                <Button type="link" size="small" @click="detilsRow(record.id, 'edit')">编辑</Button>
                <Button type="link" size="small" @click="detilsRow(record.id, 'copy')">复制</Button>
                <Popconfirm v-if="activeKey !== 'END'" title="确定要停止该项？" danger @confirm="editRow(record)">
                  <Button type="link" size="small">
                    {{
                    record.status === "ENABLE" ? "停止" : "启用"
                    }}
                  </Button>
                </Popconfirm>
                <Popconfirm title="确定要删除该项？" danger @confirm="delRow(record.id)">
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </template>
</template>
</Table> -->
        </TabPane>
      </Tabs>
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
import { getPalnPage, deletePlan, stopOr, getPalnStatus } from '@/api/plan-api'
import GLayout from '@/components/common/g-layout.vue'
import { Button, Popconfirm, Popover, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { onMounted, reactive, ref, h } from 'vue'
import { AliasTable } from '@ghcloud/generic-component'
import { useRouter } from 'vue-router'
import { useListQueryCache, usePageName } from '@ghcloud/cube-utils'
</script>
<script setup lang="ts">
const { pageTitle } = usePageName()
const router = useRouter()
const currenttotal = ref([])
const gettabname = (item: string) => {
  const find: any = planType.value.find((res: { name: string; }) => res.name === item)
  const num: any = currenttotal.value.find(
    (reset: { name: string; }) => reset.name === find.key
  )
  if (item === '全部') {
    const num: any = currenttotal.value.find(
      (reset: { name: string; }) => reset.name === 'ALL'
    )
    return `${item} (${num === undefined ? 0 : num.value})`
  } else {
    return `${item} (${num === undefined ? 0 : num.value})`
  }
}
const activeKey = ref<string | null>('ENABLE')
const planType = ref<any>([
  {
    name: '执行中',
    key: 'ENABLE',
  },
  {
    name: '已停用',
    key: 'STOP',
  },
  {
    name: '已结束',
    key: 'END',
  },
  { name: '全部', key: null },
])
const options = ref([
  {
    value: 'one',
    label: '单次',
  },
  {
    value: 'circulate',
    label: '循环',
  },
])
const formState = reactive<Plan.GetList>({
  keyword: '',
  executeData: null,
  patrolCycle: '',
  status: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0,
})
const defaultQueryState = {
  keyword: '',
  executeData: null as string[] | null,
  patrolCycle: '',
  activeKey: 'ENABLE' as string | null,
  pageNumber: 1,
  pageSize: 10,
}

const queryCache = useListQueryCache({
  defaults: defaultQueryState,
  getState: () => ({
    keyword: formState.keyword,
    executeData: formState.executeData as string[] | null,
    patrolCycle: formState.patrolCycle,
    activeKey: activeKey.value,
    pageNumber: formState.pageNumber,
    pageSize: formState.pageSize,
  }),
  setState: (next) => {
    formState.keyword = (next.keyword as string) ?? ''
    formState.executeData = (next.executeData as string[] | null) ?? null
    formState.patrolCycle = (next.patrolCycle as string) ?? ''
    formState.pageNumber = Number(next.pageNumber ?? 1)
    formState.pageSize = Number(next.pageSize ?? 10)
    activeKey.value = next.activeKey === undefined ? 'ENABLE' : (next.activeKey as string | null)
  },
  decode: (query) => {
    const executeData = typeof query.executeData === 'string'
      ? query.executeData.split(',').filter(Boolean)
      : null
    return {
      keyword: typeof query.keyword === 'string' ? query.keyword : '',
      executeData: executeData && executeData.length === 2 ? executeData : null,
      patrolCycle: typeof query.patrolCycle === 'string' ? query.patrolCycle : '',
      activeKey: typeof query.activeKey === 'string' ? (query.activeKey === 'ALL' ? null : query.activeKey) : 'ENABLE',
      pageNumber: typeof query.pageNumber === 'string' ? Number(query.pageNumber) : 1,
      pageSize: typeof query.pageSize === 'string' ? Number(query.pageSize) : 10,
    }
  },
  encode: (state) => {
    const executeData = Array.isArray(state.executeData) && state.executeData.length === 2 ? state.executeData.join(',') : undefined
    return {
      keyword: state.keyword || undefined,
      executeData,
      patrolCycle: state.patrolCycle || undefined,
      activeKey: state.activeKey === null ? 'ALL' : state.activeKey,
      pageNumber: String(state.pageNumber),
      pageSize: String(state.pageSize),
    }
  },
})

const loading = ref<boolean>(false)
const dataSource = ref([])
const columns = ref<TableColumnType[]>([
  {
    title: '计划名称',
    key: 'planName',
    dataIndex: 'planName',
    ellipsis: true,
    width: 180,
    fixed: 'left',
    customRender: ({ text }) => {
      return h(Popover, { content: text }, { default: () => text as string || '--' })
    }
  },
  {
    title: '生效时间',
    dataIndex: 'startData',
    key: 'startData',
    customRender: ({ record }) => {
      return `${dayjs(record.startData).format('YYYY-MM-DD HH:mm:ss')}`
    },
  },
  {
    title: '失效时间',
    dataIndex: 'endData',
    key: 'endData',
    customRender: ({ record }) => {
      return `${dayjs(record.endData).format('YYYY-MM-DD HH:mm:ss')}`
    },
  },
  {
    title: '巡更路线',
    dataIndex: 'routeName',
    key: 'routeName',
  },
  {
    title: '巡更周期',
    dataIndex: 'patrolCycle',
    key: 'patrolCycle',
    customRender: ({ record }) => {
      return `${record.patrolCycle === 'one' ? '单次' : '循环'}`
    },
  },
  {
    title: '巡更方式',
    dataIndex: 'patrolWay',
    key: 'patrolWay',
    customRender: ({ text }) => {
      return `${text ? text.replace('BLUETOOTH', '蓝牙') : '--'}`
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ record }) => {
      return `${
        record.status === 'ENABLE'
          ? '执行中'
          : record.status === 'STOP'
            ? '已停用'
            : '已结束'
      }`
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 240,
    customRender: ({ record }) => {
      return [
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => { detilsRow(record.id, 'detiles') } },
          { default: () => '详情' }
        ),
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => { detilsRow(record.id, 'edit') } },
          { default: () => '编辑' }
        ),
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => { detilsRow(record.id, 'copy') } },
          { default: () => '复制' }
        ),
        h(
          Popconfirm,
          { title: record.status === 'ENABLE' ? '确定要停止该项？' : '确定要启用该项？', danger: true, onConfirm: () => { editRow(record) } },
          {
            default: () => h(
              Button,
              { type: 'link', size: 'small', danger: true },
              { default: () => `${record.status === 'ENABLE' ? '停止' : '启用'}` }
            )
          }
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
  },
])
// <Button type="link" size="small" @click="detilsRow(record.id, 'detiles')">详情</Button>
//                 <Button type="link" size="small" @click="detilsRow(record.id, 'edit')">编辑</Button>
//                 <Button type="link" size="small" @click="detilsRow(record.id, 'copy')">复制</Button>
//                 <Popconfirm v-if="activeKey !== 'END'" title="确定要停止该项？" danger @confirm="editRow(record)">
//                   <Button type="link" size="small">
//                     {{
//                     record.status === "ENABLE" ? "停止" : "启用"
//                     }}
//                   </Button>
//                 </Popconfirm>
//                 <Popconfirm title="确定要删除该项？" danger @confirm="delRow(record.id)">
//                   <Button type="link" size="small" danger>删除</Button>
//                 </Popconfirm>
const pageChange = (pageNumber: number, pageSize: number) => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}

const query = async () => {
  const datainfo = JSON.parse(JSON.stringify(formState))
  if (datainfo.executeData) {
    datainfo.executeData = `${datainfo.executeData[0]}-${datainfo.executeData[1]}`
  }

  datainfo.status = activeKey.value

  const { data } = await getPalnPage(datainfo)
  dataSource.value = data.records.map(e => {
    return {
      ...e,
      patrolWay: e.patrolWay.replace('QRCODE', '二维码巡更')
    }
  })
  formState.total = data.total
  const { data: numlist } = await getPalnStatus()
  currenttotal.value = numlist
  await queryCache.sync()
}
const tabchange = (value: string | number | null) => {
  formState.status = value
  formState.pageNumber = 1
  query()
}
const handleSearch = () => {
  formState.pageNumber = 1
  query()
}
const reset = () => {
  Object.assign(formState, {
    keyword: '',
    executeData: null,
    patrolCycle: '',
    status: activeKey.value,
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  })
  query()
}

const detilsRow = (id: string, type: string) => {
  router.push({
    path: '/plan/detiles',
    query: { type: 'plan', id, handle: type }
  })
}
const editRow = async (record: { id: string; status: string; }) => {
  await stopOr({ id: record.id, status: record.status === 'ENABLE' ? 'STOP' : 'ENABLE' })
  query()
}

const delRow = async (id: string): Promise<void> => {
  await deletePlan(id)
  query()
}
onMounted(async () => {
  await queryCache.hydrateAndQuery(query)
})
const addPlan = () => {
  router.push({
    path: '/plan/detiles',
    query: { type: 'plan', path: 'plan' }
  })
}
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
