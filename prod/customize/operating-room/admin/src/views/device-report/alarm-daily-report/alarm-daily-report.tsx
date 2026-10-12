import { defineComponent, provide, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { cubeOperatingRoomService } from '@/api/service'
import dayjs from 'dayjs'
import { logger } from '@/logger'
import { ProductCategoryTreeSelect } from '@/components/business/product-category-tree-select/product-category-tree-select'

/** 报警日报表 */
export const AlarmDailyRecord = defineComponent({
  setup: () => {
    const formState = reactive({
      status: undefined,
      period: undefined,
      tenant: undefined,
      prodCategoryId: []
    })
    provide('tenantObj', formState)
    const columns = [
      {
        title: '日期',
        dataIndex: 'createTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '所属医院',
        dataIndex: 'tenantName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '产品品类',
        dataIndex: 'deviceProdCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '报警数量',
        dataIndex: 'totalNum',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>
        }
      },
      {
        title: '待接收数量',
        dataIndex: 'suspendNum',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>
        }
      },
      {
        title: '处理中数量',
        dataIndex: 'progressConfirmedNum',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>
        }
      },
      {
        title: '已挂起次数',
        dataIndex: 'unConfirmedNum',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>
        }
      },
      {
        title: '已处理次数',
        dataIndex: 'handlerNum',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>
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
        if (!formState.tenant) return
        const categoryId = formState.prodCategoryId && Array.isArray(formState.prodCategoryId) ? formState.prodCategoryId[formState.prodCategoryId.length - 1] : formState.prodCategoryId
        const res = await cubeOperatingRoomService.getMedicalAlarmPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          period: formState.period ? (formState.period as string[]).join(',') : undefined,
          tenant: formState.tenant,
          deviceProdCategoryCode: categoryId
        })
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch {
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
      formState.tenant = undefined
      formState.prodCategoryId = []
      queryForm()
    }
    const { scrollY } = useTableScroll()

    const tenantChange = async (value: string): Promise<void> => {
      logger.debug(value)
      await getTableData()
    }

    const layoutSlots = {
      'layout-content': (): JSX.Element=> {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect
                  style={{ width: '180px' }} v-model:value={formState.tenant} onChange={tenantChange}
                />
              </FormItem>
              <FormItem label='产品品类' name='prodCategoryId'>
                <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} style={{ width: '100%' }} />
              </FormItem>
              <FormItem label='时间范围' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
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
        <Layout title='设备日报表' v-slots={layoutSlots} />
      </>
  }
})
