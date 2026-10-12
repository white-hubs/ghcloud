import { useCubeTable } from '../../base-components/cube-table/use-table'
import { useCubeForm } from '../../base-components/cube-form/use-form'
import { cubeFlowService } from '../../api/service'
import { Button, PopOver } from '@ghcloud/cube-ui'
import { defineComponent } from 'vue'
import dayjs from 'dayjs'
import { statusText, flowStatus, flowTypes } from './flow-table'
import { DeptSelect } from '../ouaa-components/dept-select'
import { useRoute } from 'vue-router'

interface Props {
  title: string;
  flowCode: string;
  permission: Record<string, string>;
}
/** 流程列表页表格组件 */
export const FlowTable = defineComponent({
  props: ['title', 'flowCode', 'permission'],
  setup (props: Props, { expose }) {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
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
        component: DeptSelect,
        label: '发起部门',
        fieldName: 'organizationId',
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
    /** 跳转到详情页 */
    const goDetail = (record: unknown): void => {
      const { processInstanceId, currentTaskId, status } = record as { processInstanceId: string; currentTaskId: string; status: string; }
      history.pushState({ current: location.pathname + location.search }, '', `/portal/stream-engine-render/index?businessType=${props.flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${props.title}`)
    }
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
        title: '发起部门',
        dataIndex: 'organizationName',
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
        dataIndex: 'action',
        title: '操作',
        slots: {
          customRender: 'action',
        },
        fixed: 'right',
        width: 180,
        customRender: ({ record }: { record: unknown; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                goDetail(record)
              }}>详情</Button>
            </>
          )
        }
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      tableCode: tableCode,
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
          businessType: props.flowCode,
          ...Object.keys(formApi.formValues).reduce((acc, key) => {
            acc[key] = formApi.formValues[key] !== null ? formApi.formValues[key] : '';
            return acc;
          }, {} as Record<string, unknown>)
        }
        return cubeFlowService.getFlowProcessPage(param)
      },
    })

    expose({
    })
    return (): JSX.Element => (
      <>
        <CubeForm />
        <CubeTable />
      </>
    )
  }
})
