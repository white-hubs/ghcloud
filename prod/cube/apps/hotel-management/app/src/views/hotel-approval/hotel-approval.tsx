import { defineComponent } from 'vue'
import { CubeLayout, useCubeTable, useCubeForm } from '@ghcloud/cube-app-design'
import { Button, PopOver, Space } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { goStreamPage } from '@/utils'
import { cubeHotelManagementService } from '@/api/service'
import type { HotelFlowProcessVO } from '@ghcloud/cube-hotel-management-service'

export const HotelApproval = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const businessType = 'HOTEL_RESERVATION'

    const flowStatus = {
      ACTIVE: '处理中',
      REJECT: '驳回',
      UNDO: '撤销',
      FINISHED: '完成',
    }
    const flowTypes = {
      ALL: '全部',
      WAITING: '待我处理',
      SUBMIT: '我发起的',
      SERVED: '抄送给我',
      PROCESSED: '已处理',
    }
    const statusText = (str: string): string => {
      const statusMap = new Map([
        ['SUBMIT', '提交'],
        ['UNDO', '撤销'],
        ['REPEAT', '重新提交'],
        ['APPROVAL', '审批'],
        ['BACK', '撤回'],
        ['COPY', '抄送'],
        ['REJECT', '驳回'],
        ['FINISHED', '完成']
      ])
      return statusMap.get(str) || '处理中'
    }
    const resultText = (str: string): string => {
      const statusMap = new Map([
        ['RECEIVED', '已接单'],
        ['NOT_ACCEPTED', '未接单']
      ])
      return statusMap.get(str) || '--'
    }

    const searchFormSchema = [
      {
        component: 'Select',
        label: '发起类型',
        fieldName: 'type',
        defaultValue: 'ALL',
        componentProps: {
          allowClear: true,
          placeholder: '请选择发起类型',
          options: [
            ...Object.keys(flowTypes).map((item) => {
              return {
                label: flowTypes[item as keyof typeof flowTypes],
                value: item
              }
            })
          ],
          onChange: (): void => {
            tableApi.query()
          }
        },
      },
      {
        component: 'Select',
        label: '状态',
        fieldName: 'status',
        defaultValue: '',
        componentProps: {
          allowClear: true,
          placeholder: '请选择状态',
          options: [
            {
              label: '全部',
              value: ''
            },
            ...Object.keys(flowStatus).map((item) => {
              return {
                label: flowStatus[item as keyof typeof flowStatus],
                value: item
              }
            })
          ],
          onChange: (): void => {
            tableApi.query()
          }
        },
      },
      {
        component: 'RangePicker',
        label: '发起时间',
        fieldName: 'submitTime',
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
          allowClear: true,
        }
      },
      {
        component: 'Input',
        label: '发起人',
        fieldName: 'username',
        componentProps: {
          placeholder: '请输入发起人姓名'
        }
      }
    ]

    const columns = [
      {
        title: '编号',
        dataIndex: 'formNo',
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
        title: '发起人',
        dataIndex: 'startUserName',
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
        title: '申请名称',
        dataIndex: 'instanceName',
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
        title: '发起时间',
        dataIndex: 'submitedTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
          return (
            <PopOver content={time || ''}>
              {time || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const textVal = text ? statusText(text) : '-'
          return (
            <PopOver content={textVal || ''}>
              {textVal || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '处理进度',
        dataIndex: 'activeNodeName',
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
        title: '处理结果',
        dataIndex: 'orderStatus',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const textVal = text ? resultText(text) : '--'
          return (
            <PopOver content={textVal || ''}>
              {textVal || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'action',
        title: '操作',
        slots: {
          customRender: 'action',
        },
        fixed: 'right',
        width: 180,
        customRender: ({ record }: { record: HotelFlowProcessVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleInfo(record)
              }}>详情</Button>
            </>
          )
        }
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        tableApi.query()
      },
      handleReset: () => {
        tableApi.query()
      },
      schema: searchFormSchema,
      showCollapseButton: true
    })
    const [CubeTable, tableApi] = useCubeTable({
      tableCode: businessType,
      columns,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        size: 'default',
        showSizeChanger: true,
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          tableApi.setState({
            pagination: {
              ...(tableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current
            },
          })
          tableApi.query()
        }
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        const param = {
          pageNumber: params?.current as number,
          pageSize: params?.pageSize as number,
          businessType: businessType,
          ...Object.keys(formApi.formValues).reduce((acc, key) => {
            acc[key] = formApi.formValues[key] !== null ? formApi.formValues[key] : '';
            return acc;
          }, {} as Record<string, unknown>)
        }
        return cubeHotelManagementService.getHotelApprovalRecord(param)
      },
    })
    /** 跳转到详情页 */
    const handleInfo = (record: HotelFlowProcessVO): void => {
      const pathParams = {
        businessType,
        type: 'detail',
        title: pageTitle,
        processInstanceId: record.processInstanceId ?? '',
        currentTaskId: record.currentTaskId ?? '',
        status: record.status ?? '',
      }
      goStreamPage(pathParams)
    }

    const handleCreate = (): void => {
      const pathParams = {
        businessType,
        type: 'add',
        title: pageTitle
      }
      goStreamPage(pathParams)
    }

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Space>
            <Button
              type='primary' onClick={handleCreate}
            >新增
            </Button>
          </Space>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <CubeForm />
            <CubeTable />
          </>
        )
      }
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={layoutSlots} />
    )
  }
})