
import { defineComponent, onMounted, reactive } from 'vue'
import { Button, PopOver, Page, PopConfirm, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import dayjs from 'dayjs'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'
import { appFunctionCodes } from '@/permission/index'
import { hasPermission } from '@ghcloud/cube-permission-codes'
export const taskStatus = {
  ACCEPT: '待接收',
  EXECUTING: '进行中',
  OVER: '已完成',
  EXPIRE: '已过期',
  STOP: '已终止',
  CONFIRM: '待确认',
  OVERTIME: '超时完成'
}
export const PatrolTask = defineComponent({

  setup: () => {
    const { pageTitle } = usePageName()
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      typeId: '',
      total: 100,
      keyword: '',
      period: '',
    })
    const permission = appFunctionCodes.projectPatrol


    /**
     * 表格
     */
    const columns = [
      {
        dataIndex: 'name',
        title: '任务名称',
        slots: {
          customRender: 'name',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'typeName',
        title: '巡检类型',
        slots: {
          customRender: 'typeName',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'isCheck',
        title: '任务类型',
        slots: {
          customRender: 'isCheck',
        },
        align: 'center',
        ellipsis: true,
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text ? '稽查' : '普通'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'receiveNames',
        title: '执行人',
        slots: {
          customRender: 'receiveNames',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'publisherName',
        title: '发布人',
        slots: {
          customRender: 'publisherName',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'createTime',
        title: '发布时间',
        slots: {
          customRender: 'createTime',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return (
            <PopOver
              content={time || ''}
            >
              {time || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'validEndTime',
        title: '截止时间',
        slots: {
          customRender: 'validEndTime',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return (
            <PopOver
              content={time || ''}
            >
              {time || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'targetNum',
        title: '巡检对象数',
        slots: {
          customRender: 'targetNum',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text || ''}
            >
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'recordCompletionRate',
        title: '进度',
        slots: {
          customRender: 'recordCompletionRate',
        },
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const value = text !== null ? text + '%' : '--'
          return (
            <PopOver
              content={value || ''}
            >
              {value || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'status',
        title: '状态',
        width: 100,
        slots: {
          customRender: 'status',
        },
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): string => {
          return taskStatus[text as keyof typeof taskStatus]
        },
      },
      {
        dataIndex: 'action',
        title: '操作',
        slots: {
          customRender: 'action',
        },
        align: 'center',
        fixed: 'right',
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link' size='small' onClick={() => {
                  history.pushState({}, '', `/portal/small-engineering/engineering-patrol-task-edit?type=info&id=${record.id}`)
                }}
              >详情
              </Button>
              <PopConfirm
                title='确认确认停止该任务？' onConfirm={async () => {
                  await cubeDailyInspectionService.stopInspectTask({
                    id: record.id,
                    businessType: InspectBusinessType.SMALL_ENGINEERING
                  })
                  message.success('操作成功')
                  tableApi.query()
                }}
              >
                <Button size='small' disabled={record.status !== 'EXECUTING'} type='link'>停止</Button>
              </PopConfirm>

            </>
          )
        },
        width: 140,
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'SMALL_INSPECTION_TASK',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeDailyInspectionService.getInspectTaskList({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          status: searchParams.status,
          typeId: searchParams.typeId,
          keyword: searchParams.keyword,
          period: searchParams.period,
          businessType: InspectBusinessType.SMALL_ENGINEERING
        })
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      }
    })
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'Select',
        label: '状态',
        fieldName: 'status',
        defaultValue: '',
        componentProps: {
          allowClear: true,
          options: [
            {
              label: '全部',
              value: ''
            },
            ...Object.keys(taskStatus).map((item) => {
              return {
                label: taskStatus[item as keyof typeof taskStatus],
                value: item
              }
            })
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1
            searchParams.status = value
            tableApi.query()
          }
        },
      },
      {
        component: 'Select',
        label: '巡检类型',
        fieldName: 'typeId',
        componentProps: {

        }
      },
      {
        component: 'RangePicker',
        label: '发布时间',
        fieldName: 'period',
        componentProps: {
          styles: {
            width: '240px'
          },
          valueFormat: 'YYYY-MM-DD',
          allowClear: true,
        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '名称'
        }
      },
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.period = data.period ? (data.period as [string, string]).join(',') : ''
        searchParams.keyword = data.keyword ? data.keyword as string : ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        searchParams.period = ''
        searchParams.keyword = ''
        searchParams.status = ''
        searchParams.typeId = ''
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
    onMounted(async () => {
      const result = await cubeDailyInspectionService.getInspectTypeList({
        businessType: InspectBusinessType.SMALL_ENGINEERING
      })
      const schema = {
        component: 'Select',
        label: '巡检类型',
        fieldName: 'typeId',
        defaultValue: '',
        componentProps: {
          options: result,
          placeholder: '请选择',
          allowClear: true,
          fieldNames: { label: 'name', value: 'id' },
          onChange: (value: string): void => {
            searchParams.typeId = value
            tableApi.query()
          }
        }
      }
      formApi.updateFieldSchema(schema)
    })
    const slots = {
      'layout-header': (): JSX.Element =>
         <>{hasPermission(permission.createTask)&&<Button
          type='primary' onClick={() => {
            history.pushState({}, '', '/portal/small-engineering/engineering-patrol-task-edit?type=create')
          }}
        >新增
         </Button>}</> ,
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
      <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />
    )
  }
})
