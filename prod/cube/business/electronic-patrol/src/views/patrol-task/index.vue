<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #header-btn>
      <Button type="primary" @click="addPlan">新增</Button>
    </template>
    <template #content-data>
      <Tabs v-model:activeKey="activeKey" hide-add type="card" @change="tabchange">
        <TabPane v-for="item in planType" :key="item.key" :tab="`${item.name}(${item.num})`">
          <Form layout="inline" style="margin-bottom: 12px;" :model="formState">
            <FormItem>
              <Input v-model:value="formState.keyword" placeholder="请输入任务名称" />
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
            :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_TASK"
            :scroll-x="0" :scroll-y="550"
          />
          <!-- <Table :pagination="false" class="mt-15px" :columns="columns" :data-source="dataSource" :form-state="false"
            :scroll="{ x: 1000, y: 550 }" size="small" bordered :loading="loading" row-key="id"> -->
          <!-- <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'taskName'">
              <div :title="record.taskName" style="
                    width: 120px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  ">
                <Popover>
                  <template #content>
                    {{ record.taskName ?? '--' }}
                  </template>
{{ record.taskName ?? '--' }}
</Popover>
</div>
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
import { TaskPage, Getoverview, removeElectronicTask } from '@/api/task-api'
import GLayout from '@/components/common/g-layout.vue'
import { Button, Popover, Popconfirm, message, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import { AliasTable } from '@ghcloud/generic-component'
import { useListQueryCache, usePageName, useFeature } from '@ghcloud/cube-utils'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission/index'
import { useRouter } from 'vue-router'

</script>
<script setup lang="ts">

const permission = appFunctionCodes.electronicPatrol
const { pageTitle } = usePageName()
const router = useRouter()
const activeKey = ref('TO_BE_RECEIVED')
const planType = ref([
  {
    name: '待接收',
    key: 'TO_BE_RECEIVED',
    num: 0,
  },
  {
    name: '执行中',
    key: 'IN_EXECUTION',
    num: 0,
  },
  {
    name: '已结束',
    key: 'FINISHED',
    num: 0,
  },
  { name: '全部', key: '', num: 0 },
])
const formState = reactive<TASK.FormState>({
  keyword: '',
  taskState: activeKey.value,
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  admin: false,
})
const queryCache = useListQueryCache({
  defaults: {
    keyword: '',
    taskState: 'TO_BE_RECEIVED',
    pageNumber: 1,
    pageSize: 10,
  },
  getState: () => ({
    keyword: formState.keyword,
    taskState: activeKey.value,
    pageNumber: formState.pageNumber,
    pageSize: formState.pageSize,
  }),
  setState: (next) => {
    activeKey.value = (next.taskState as string) ?? 'TO_BE_RECEIVED'
    formState.taskState = activeKey.value
    formState.keyword = (next.keyword as string) ?? ''
    formState.pageNumber = Number(next.pageNumber ?? 1)
    formState.pageSize = Number(next.pageSize ?? 10)
  }
})
const loading = ref<boolean>(false)
const dataSource = ref([])
const columns = ref<TableColumnType[]>([
  {
    title: '任务名称',
    key: 'taskName',
    dataIndex: 'taskName',
    ellipsis: true,
    width: 180,
    fixed: 'left',
    customRender: ({ text }) => {
      return h(Popover, { content: text }, { default: () => text as string || '--' })
    }
  },
  {
    title: '发布人',
    dataIndex: 'publisherName',
    key: 'publisherName',
    ellipsis: true,
    width: 150,
    customRender: ({ record }) => {
      return `${record.publisherName === '' ? '--' : record.publisherName}`
    },
  },
  {
    title: '发布人部门',
    dataIndex: 'publisherDepName',
    key: 'publisherDepName',
    ellipsis: true,
    width: 150,
    customRender: ({ record }) => {
      return `${record.publisherDepName === '' ? '--' : record.publisherDepName}`
    },
  },
  {
    title: '发布时间',
    dataIndex: 'publisherTime',
    key: 'publisherTime',
    width: 150,
    ellipsis: true,
    customRender: ({ record }) => {
      return `${dayjs(record.publisherTime).format('YYYY-MM-DD HH:mm:ss')}`
    },
  },
  {
    title: '时间段',
    dataIndex: 'executeData',
    key: 'executeData',
    ellipsis: true,
    width: 150,
  },
  {
    title: '巡更路线',
    dataIndex: 'patrolRouteName',
    key: 'patrolRouteName',
    ellipsis: true,
    width: 150,
  },

  {
    title: '巡更点数',
    dataIndex: 'patrolLocationNum',
    key: 'patrolLocationNum',
    ellipsis: true,
    width: 150,
  },
  {
    title: '巡更人员',
    dataIndex: 'userName',
    key: 'userName',
    ellipsis: true,
    width: 150,
    customRender: ({ record }) => {
      return `${record.userName === '' ? '--' : record.userName}`
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    ellipsis: true,
    width: 150,
    customRender: ({ record }) => {
      return `${
        record.status === 'IN_EXECUTION'
          ? '执行中'
          : record.status === 'TO_BE_RECEIVED'
            ? '待接收'
            : record.status === 'FINISHED'
              ? '已结束'
              : ''
      }`
    },
  },
  {
    title: '任务情况',
    dataIndex: 'result',
    key: 'result',
    ellipsis: true,
    width: 150,
    customRender: ({ record }) => {
      return `${
        record.result === 'NORMAL' ? '正常' : record.result === 'ABNORMAL' ? '异常' : '--'
      }`
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    customRender: ({ record }) => {
      const buttons = [
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            onClick: () => {
              editRow(record.id, record.status)
            },
          },
          { default: () => '详情' }
        )
      ]
      if (hasPermission(permission.deleted)) {
        buttons.push(
          h(
            Popconfirm,
            {
              title: '是否删除当前选中？',
              onConfirm: (e) => {
                // 阻止事件冒泡
                e?.stopPropagation?.()
                deleteRow(record.id)
              }
            },
            {
              default: () => h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  danger: true,
                },
                { default: () => '删除' }
              )
            }
          )
        )
      }
      return buttons
    },
  },
])
const notVisibleCodes = ['publisherDepName', 'publisherTime']
columns.value = columns.value.map((item) => {
  return {
    ...item,
    defaultVisible: !notVisibleCodes.includes(item.dataIndex as unknown as string)
  }
})
const pageChange = (pageNumber: number, pageSize: number) => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}

const query = async () => {
  const { data: datalist } = await TaskPage(formState)
  dataSource.value = datalist.records
  formState.total = datalist.total
  const { data } = await Getoverview()
  planType.value[0].num = data.toBeReceived
  planType.value[1].num = data.inExecution
  planType.value[2].num = data.finished
  planType.value[3].num = data.total
  await queryCache.sync()
}
const reset = () => {
  Object.assign(formState, {
    keyword: '',
    taskState: activeKey.value,
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    admin: false,
  })
  query()
}

const tabchange = (value: string | number) => {
  activeKey.value = String(value)
  formState.taskState = String(value)
  formState.pageNumber = 1
  query()
}
const handleSearch = () => {
  formState.pageNumber = 1
  query()
}
const editRow = (id: string, status: string) => {
  router.push({ path: '/task/detiles', query: { id, status, type: 'task' } })
}

const deleteRow = async (id: string) => {
  try {
    await removeElectronicTask([id]);
    message.success('删除成功');
    query();
  } catch {
    message.error('删除失败');
  }
}

const addPlan = () => {
  router.push({ path: '/plan/detiles', query: { type: 'task' } })
}
onMounted(async () => {
  await queryCache.hydrateAndQuery(query)
})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
