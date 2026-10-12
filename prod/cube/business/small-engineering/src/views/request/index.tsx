
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { AliasTable, Layout } from '@ghcloud/generic-component'
import { Button, Page, PopOver, DateRangePicker, FormItem, Tabs, TabPane } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { useTableScroll } from '@/hook/use-table-scroll'
import '@/styles/monthly-report.less'
import { getApplyList } from '@/api/manage'
import { usePageName } from '@ghcloud/cube-utils'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission'
export const Request = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const formState = reactive({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      submitTime: '',

      businessType: 'PROJECT_APPLY',
      status: '',
      type: 'WAITING'
    })
    const result = {
      PASS: '通过',
      FINISHED: '完成',
      ACTIVE: '处理中',
      REJECT: '拒绝',
      UNDO: '撤销'

    }
type RES = 'PASS' | 'FINISHED' | 'ACTIVE' | 'REJECT' | 'UNDO'
const getresult = (text: RES): string => {
  return result[text]
}
  const permission = appFunctionCodes.projectRequest

const todetail = (id: string): void => {
  history.pushState({}, '', `/portal/stream-engine-render/index?businessType=PROJECT_APPLY&appName=small-engineering&processInstanceId=${id}&currentTaskId=&status=ACTIVE&type=detail&title=工程请示`)
}

const columns = [
  {
    title: '编号',
    align: 'center',
    dataIndex: 'applyNum',
    customRender: ({ text }: { text: string; }): string => text
  },
  {
    title: '申请名称',
    dataIndex: 'instanceName',
    ellipsis: true,
    customRender: ({ text }: { text: string; }): JSX.Element => {
      return <PopOver content={text || '--'}>{text || '--'}</PopOver>
    }
  },
  {
    title: '小散工程名称',
    align: 'center',
    dataIndex: 'projectName',
    ellipsis: true,
    customRender: ({ text }: { text: string; }): JSX.Element => {
      return <PopOver content={text || '--'}>{text || '--'}</PopOver>
    }
  },
  {
    title: '发起人',
    align: 'center',
    dataIndex: 'startUserName',
    ellipsis: true,
    customRender: ({ text }: { text: string; }): JSX.Element => {
      return <PopOver content={text || '--'}>{text || '--'}</PopOver>
    }
  },
  {
    title: '发起部门',
    align: 'center',
    dataIndex: 'startUserInfo',
    ellipsis: true,
    customRender: ({ record }: {
      record: {
        startUserInfo: {
          startUserName: string;
          organizationName: string;
        };
      };
    }): string => {
      return record.startUserInfo.organizationName ? record.startUserInfo.organizationName : '--'
    }
  },
  {
    title: '发起时间',
    dataIndex: 'submitedTime',
    ellipsis: true,
    customRender: ({ text }: { text: number; }): JSX.Element => {
      const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
      return <PopOver content={time}>{time}</PopOver>
    }
  },
  {
    title: '处理状态',
    align: 'center',
    dataIndex: 'status',
    ellipsis: true,
    customRender: ({ text }: { text: RES; }): string=> {
      return getresult(text)
    }
  },
  {
    title: '处理进度',
    align: 'center',
    dataIndex: 'activeNodeName',
    ellipsis: true,
    customRender: ({ text }: { text: string; }): JSX.Element => {
      return <PopOver content={text || '--'}>{text || '--'}</PopOver>
    }
  },
  {
    title: '操作',
    dataIndex: 'action',
    customRender: ({ record }: { record: { processInstanceId: string; }; }): JSX.Element => {
      return (
        <>
          <Button type='link' size='small' onClick={() => {
            todetail(record.processInstanceId)
          }}>详情</Button>

        </>
      )
    }
  }
]
const tabs = [
  { title: '待我处理的', key: 'WAITING' },
  { title: '我发起的', key: 'SUBMIT' },
  { title: '抄送我的', key: 'SERVED' },
  { title: '全部', key: 'ALL' },

]
const activeKey = ref('WAITING')

const loading = ref(false)
const dataSource = ref<unknown[]>([])
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0,

})

const getTableData = async (): Promise<void> => {
  try {
    loading.value = true
    const { data } = await getApplyList(formState)
    dataSource.value = data.records
    pagination.value.total = data.total
  } finally {
    loading.value = false
  }
}
const period = ref([])

const changePick = (value: string[]): void => {
  Object.assign(formState, { ...formState, submitTime: value === null ? '' : value.join(',') })
  getTableData()
}
const pageChange = (pageNumber: number, pageSize: number): void => {
  pagination.value.pageNumber = pageNumber || 1
  pagination.value.pageSize = pageSize
  getTableData()
}
const toflow = (): void => {
  history.pushState({}, '', '/portal/stream-engine-render/index?businessType=PROJECT_APPLY&appName=small-engineering&type=add&title=工程请示')
}
const queryForm = (): void => {
  pagination.value.pageNumber = 1
  getTableData()
}
const reset = (): void => {
  formState.submitTime = ''
  period.value = []
  queryForm()
}
const { scorllY } = useTableScroll()

onMounted(() => {
  getTableData()
  // getstatistics()
})
const tabchange = (): void => {
  Object.assign(formState, { ...formState, type: activeKey.value })
  getTableData()
}

const layoutSlots = {
  'layout-header': (): JSX.Element => {
    return (
      <>
        {hasPermission(permission.create)&&<Button type='primary' onClick={toflow}>新增</Button>}
      </>
    )
  },
  'layout-content': (): JSX.Element => {
    return (
      <>
        <div>
          <Tabs v-model:activeKey={activeKey} onTabChange={tabchange}>
            {
              tabs.map((item) => {
                return (

                  <TabPane key={item.key} tab={item.title}>

                    <div style='display:flex;width:600px;margin-top:10px'>
                      <FormItem label='发起时间:'>
                        <DateRangePicker v-model:value={period.value} onChangePicker={changePick} />
                      </FormItem>

                      <Button type='primary' onClick={queryForm}>查询</Button>
                      <Button style='margin-left:10px' onClick={reset}>重置</Button>

                    </div>
                    <AliasTable
                      columns={columns}
                      loading={loading.value}
                      tableCode='REQUEST'
                      applicationCode='SMALLENFINEERING'
                      dataSource={dataSource.value}
                      pagination={false}
                      scrollY={scorllY.value}
                    />
                  </TabPane>
                )
              })
            }

          </Tabs>

        </div>
      </>
    )
  },
  'footer-page': (): JSX.Element => {
    return (
      <Page
        v-model:current={pagination.value.pageNumber}
        v-model:pageSize={pagination.value.pageSize}
        v-model:total={pagination.value.total}
        onPageChange={pageChange}
      />
    )
  }
}
return (): JSX.Element =>
  <>
    <Layout title={pageTitle} v-slots={layoutSlots} />
  </>
  }
})
