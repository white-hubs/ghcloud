import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { logger } from '@/logger'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'

/** 工单报表 */
export const OrderReport = defineComponent({
  setup: () => {
    const formState = reactive({
      status: undefined,
      period: undefined,
      tenantId: undefined
    })

    const columns = [
      {
        title: '日期',
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
        title: '工单类型',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '工单合计',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '进行中',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '处理完成',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
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
      'layout-content': (): JSX.Element => {
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
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} />
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
        <Layout title='工单报表' v-slots={layoutSlots} />
      </>
  }
})
