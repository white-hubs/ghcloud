import { defineComponent, provide, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import dayjs from 'dayjs'
import { cubeDeviceCenterService } from '@/api/service'
import { logger } from '@/logger'
import { ProductCategoryTreeSelect } from '@/components/business/product-category-tree-select/product-category-tree-select'

/** 设备日志 */
export const DeviceRecord = defineComponent({
  setup: () => {
    const formState = reactive({
      executeResult: undefined,
      period: undefined,
      tenant: undefined,
      prodCategoryId: []
    })
    provide('tenantObj', formState)

    const columns = [
      {
        title: '操作时间',
        dataIndex: 'createTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '设备编号',
        dataIndex: 'code',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备名称',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '产品品类',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备属性',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作内容',
        dataIndex: 'id',
        ellipsis: true,
        width: 200,
        customRender: ({ record }: { record: { originalValue: { name: string; value: string; }; expectedValue: { value: string; }; }; }): string => {
          if (record.originalValue) {
            return `${record.originalValue.name}从【${record.originalValue.value}】调整为【${record.expectedValue.value}】`
          } else {
            return '--'
          }
        }
      },
      {
        title: '操作人',
        dataIndex: 'createBy',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作结果',
        dataIndex: 'executeResult',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const curState = executeResultOptions.find(e => e.value === text || e.value.includes(text))
          return (
            <>
              <PopOver content={curState?.label || '--'}>
                {curState?.label ? curState.label : '--'}
              </PopOver>
            </>
          )
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
        const res = await cubeDeviceCenterService.getDeviceLogByTenantPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          period: formState.period ? (formState.period as string[]).join(',') : undefined,
          tenant: formState.tenant,
          deviceProdCategoryCodeConcat: categoryId
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
      formState.executeResult = undefined
      formState.tenant = undefined
      formState.prodCategoryId = []
      queryForm()
    }

    const executeResultOptions = [
      { value: 'ARRIVAL', label: '命令送达给物联网平台' },
      { value: 'ISSUING', label: '下发中' },
      // { value: 'ISSUING,ARRIVAL', label: '下发中' },
      { value: 'SUCCESS', label: '成功' },
      { value: 'FAIL', label: '失败' },
      { value: 'EXPIRED', label: '超时' },
    ]
    const { scrollY } = useTableScroll()

    const tenantChange = async (value: string): Promise<void> => {
      logger.debug(value)
      await getTableData()
    }

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect
                  style={{ width: '180px' }} v-model:value={formState.tenant} onChange={tenantChange}
                />
              </FormItem>
              <FormItem label='产品品类' name='prodCategoryId'>
                <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} style={{ width: '100%' }} useType='code' />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='操作结果'>
                <Select style={{ width: '160px' }} v-model:value={formState.executeResult} placeholder='请选择操作对象' options={executeResultOptions} allowClear />
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
    return (): JSX.Element=>
      <>
        <Layout title='设备日志' v-slots={layoutSlots} />
      </>
  }
})
