import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { logger } from '@/logger'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'

/** 工单列表 */
export const OrderList = defineComponent({
  setup: () => {
    const formState = reactive({
      status: undefined,
      period: undefined,
      tenantId: undefined
    })

    const toFlowOrder = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', '/portal/stream-engine-render/index?businessType=LEAVE&processInstanceId=c9bc2100-e755-11ee-81f2-fed0f9197782&currentTaskId=&status=ACTIVE&type=detail&title=请假审批')
    }

    const columns = [
      {
        title: '编号',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属医院',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '工单名称',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '工单类型',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '对象',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '工单来源',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '紧急程度',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '发起时间',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '发起人',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '处理状态',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '处理进度',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '处理结果',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        customRender: (): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                toFlowOrder()
              }}>详情</Button>
            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          ...formState,
          period: formState.period ? (formState.period as string[]).join(',') : undefined,
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize
        }
        logger.debug(params)
      } catch (error) {
        logger.debug(error)
      } finally {
        loading.value = false
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.period = undefined
      formState.status = undefined
      formState.tenantId = undefined
      queryForm()
    }
    const { scrollY } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element=> {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect style={{ width: '180px' }} v-model:value={formState.tenantId} />
              </FormItem>
              <FormItem label='处理状态' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select
                  allowClear
                  options={[
                    { label: '驳回', value: '1' },
                    { label: '撤销', value: '1' },
                    { label: '完成', value: '1' },
                  ]}
                  style={{ width: '180px' }}
                />
              </FormItem>
              <FormItem label='发起时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} scrollX={2000} />
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
        <Layout title='工单列表' v-slots={layoutSlots} />
      </>
  }
})
