import { defineComponent, reactive, ref, onMounted } from 'vue'
import { AliasTable, Layout } from '@ghcloud/generic-component'
import { DateRangePicker, Button, PopOver, Page, Tabs, TabPane, FormItem } from '@ghcloud/cube-ui'
import './index.less'
import dayjs from 'dayjs'
import { getsignContract } from '@/api/approve'
import { usePageName } from '@ghcloud/cube-utils'
import { appFunctionCodes } from '@/permission/index'
import { hasPermission } from '@ghcloud/cube-permission-codes'
export const ExamineApprove = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const tabs = [
      { title: '待我处理的', key: 'WAITING' },
      { title: '我发起的', key: 'SUBMIT' },
      { title: '抄送我的', key: 'SERVED' },
      { title: '全部', key: 'ALL' },

    ]
    const activeKey = ref('WAITING')
    const period = ref([])
    const result = {
      PASS: '通过',
      FINISHED: '完成',
      ACTIVE: '处理中',
      REJECT: '拒绝',
      UNDO: '撤销'

    }
    const permission = appFunctionCodes.projectPatrol

    const todetail = (id: string): void => {
      history.pushState({}, '', `/portal/stream-engine-render/index?businessType=PROJECT_SIGN_CONTRACT&appName=small-engineering&processInstanceId=${id}&currentTaskId=&status=ACTIVE&type=detail&title=工程审批`)
    }
type RES = 'PASS' | 'FINISHED' | 'ACTIVE' | 'REJECT' | 'UNDO'
const getresult = (text: RES): string => {
  return result[text]
}
const tableData = reactive<{
  dataSource: unknown[];
  columns: unknown[];
  loading: boolean;
}>({
  columns: [
    {
      title: '工程编号',
      align: 'center',
      dataIndex: 'applyNum',
      customRender: ({ text }: { text: string; }): string => text
    },
    {
      title: '申请名称',
      dataIndex: 'instanceName',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '小散工程名称',
      dataIndex: 'projectName',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '发起人',
      dataIndex: 'startUserName',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '发起部门',
      dataIndex: 'startUserInfo',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: { organizationName: string; }; }): string => {
        return text?.organizationName
      }
    },
    {
      title: '发起时间',
      dataIndex: 'submitedTime',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        return <PopOver content={time}>{time}</PopOver>
      }
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: RES; }): string => {
        return getresult(text)
      }
    },
    {
      title: '处理进度',
      dataIndex: 'activeNodeName',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '操作',
      align: 'center',
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
  ],
  loading: false,
  dataSource: [

  ]
})
const pagination = reactive({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
  submitTime: '',
  businessType: 'PROJECT_SIGN_CONTRACT',
  status: '',
  type: 'WAITING'
})

const getlist = async (): Promise<void> => {
  tableData.loading = true
  const { data } = await getsignContract(pagination)
  tableData.dataSource = data.records
  pagination.total = data.total
  tableData.loading = false
}
const reset = (): void => {
  period.value = []
  Object.assign(pagination, {
    pageSize: 10,
    pageNumber: 1,
    total: 0,
    submitTime: '',
    businessType: 'PROJECT_SIGN_CONTRACT',
    status: '',
    type: 'WAITING'
  })
  activeKey.value = 'WAITING'
  getlist()
}
onMounted(() => {
  getlist()
})
const pageChange = (pageNumber: number, pageSize: number): void => {
  pagination.pageNumber = pageNumber || 1
  pagination.pageSize = pageSize
  getlist()
}
const renderAdd = (): void => {
  history.pushState({}, '', '/portal/stream-engine-render/index?businessType=PROJECT_SIGN_CONTRACT&appName=small-engineering&type=add&title=工程审批')
}
const tabchange = (key: string): void => {
  activeKey.value = key
  Object.assign(pagination, { ...pagination, type: activeKey.value })
  getlist()
}

const changePick = (value: string[]): void => {
  Object.assign(pagination, { ...pagination, submitTime: value === null ? '' : value.join(',') })
  getlist()
}
const layoutSlots = {
  'layout-content': (): JSX.Element => {
    return (
      <>
        <Tabs v-model:activeKey={activeKey.value} onTabChange={tabchange}>
          {
            tabs.map((item) => {
              return (

                <TabPane key={item.key} tab={item.title}>

                  <div style='display:flex;'>
                    <div style='width:400px;'>
                      <FormItem label='发起时间:'>
                        <DateRangePicker v-model:value={period.value} onChangePicker={changePick} />

                      </FormItem>

                    </div>
                    <Button type='primary' onClick={getlist}>查询</Button>
                    <Button style='margin-left:10px' onClick={reset}>重置</Button>
                  </div>
                  <AliasTable
                    columns={tableData.columns}
                    loading={tableData.loading}
                    tableCode='APPROVE'
                    applicationCode='SMALLENFINEERING'
                    dataSource={tableData.dataSource}
                    pagination={false}
                  />
                </TabPane>
              )
            })
          }

        </Tabs>

      </>
    )
  },
  'layout-header': (): JSX.Element => {
    return (
      <>
        {hasPermission(permission.create)&&<Button type='primary' onClick={renderAdd}>新增</Button>}
      </>
    )
  },
  'footer-page': (): JSX.Element => {
    return (
      <Page
        v-model:current={pagination.pageNumber}
        v-model:pageSize={pagination.pageSize}
        v-model:total={pagination.total}
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
