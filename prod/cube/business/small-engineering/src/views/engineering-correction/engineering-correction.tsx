
import { defineComponent, reactive } from 'vue'
import { Button, PopOver, Page } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { cubeFlowService } from '@/api/server'
import dayjs from 'dayjs'
import { appFunctionCodes } from '@/permission/index'
import { hasPermission } from '@ghcloud/cube-permission-codes'
const result = {
  PASS: '通过',
  FINISHED: '完成',
  ACTIVE: '处理中',
  REJECT: '拒绝',
  UNDO: '撤销'
}
export const EngineeringCorrection = defineComponent({

  setup: () => {
    const RadioSelectOptions = [
      { label: '待我处理', value: 'WAITING' },
      { label: '我发起的', value: 'SUBMIT' },
      { label: '抄送我的', value: 'SERVED' },
      { label: '全部', value: 'ALL' },
    ]
    const permission = appFunctionCodes.projectCorrection

    const { pageTitle } = usePageName()
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      keyword: '',
      submitTime: '',
      total: 100
    })
    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'Select',
        label: '类型',
        fieldName: 'type',
        defaultValue: 'ALL',
        componentProps: {
          options: RadioSelectOptions,
          onChange: (value: string): void => {
            searchParams.status = value
            tableApi.query()
          }
        },
      },
      {
        component: 'RangePicker',
        label: '发起时间',
        fieldName: 'submitTime',
        componentProps: {
          styles: {
            width: '240px'
          },
          valueFormat: 'YYYY-MM-DD',
        }
      },
    ]
    const [CubeForm] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.status = data.status as string
        searchParams.submitTime = data.submitTime ? (data.submitTime as string[]).join(',') : ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        searchParams.status = ''
        searchParams.submitTime = ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      schema: formSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
    })
    /**
     * 表格
     */
    const columns = [
      {
        title: '表单名称',
        dataIndex: 'instanceName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
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
        title: '发起人',
        dataIndex: 'startUserName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },

      {
        title: '处理状态',
        dataIndex: 'status',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: keyof typeof result; }): JSX.Element => {
          return <PopOver content={result[text] || '--'}>{result[text] || '--'}</PopOver>
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
        customRender: ({ record }: { record: unknown; }): JSX.Element => {
          return (
            <>
              <Button
                type='link' size='small' onClick={() => {
                  const { processInstanceId, currentTaskId, status } = record as { processInstanceId: string; currentTaskId: string; status: string; }
                  history.pushState({ current: location.pathname + location.search }, '', `/portal/stream-engine-render/index?businessType=PROJECT_REFORM&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=工程整改`)
                }}
              >详情
              </Button>
            </>
          )
        }
      }
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'ENGINEERING_CORRECTION_LIST',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeFlowService.getFlowProcessPage({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          status: searchParams.status,
          submitTime: searchParams.submitTime,
          businessType: 'PROJECT_REFORM'
        })
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      }
    })
    tableApi.setSelectedRowKeys(['2'])
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    const slots = {
      'layout-header': (): JSX.Element =>
       <>
      {hasPermission(permission.create)&&  <Button
          type='primary' onClick={() => {
            history.pushState({ current: location.pathname + location.search }, '', '/portal/stream-engine-render/index?businessType=PROJECT_REFORM&type=add&title=工程整改新增')
          }}
        >新增
        </Button>}</>,
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            current={searchParams.pageNumber}
            pageSize={searchParams.pageSize}
            total={searchParams.total}
            onPageChange={handleChange}
          />
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={slots} />
    )
  }
})
