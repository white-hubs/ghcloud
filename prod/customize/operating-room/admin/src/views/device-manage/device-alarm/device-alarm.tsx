import { defineComponent, provide, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Page, PopOver, Table, DateRangePicker, RadioGroup } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import dayjs from 'dayjs'
import { logger } from '@/logger'
import { cubeDeviceAlarmService } from '@/api/service'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { ProductCategoryTreeSelect } from '@/components/business/product-category-tree-select/product-category-tree-select'
import { AreaCascaderSelect } from '@/components/business/area-cascader-select/area-cascader-select'

/** 设备报警 */
export const DeviceAlarm = defineComponent({
  setup: () => {
    const formState = reactive({
      status: '',
      area: [],
      period: [],
      tenant: undefined,
      prodCategoryId: undefined
    })
    provide('tenantObj', formState)
    const detailRow = (record: { id: string; businessKey: string; alarmStatus: string; }): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/operating-room-admin/device-alarm-detail?id=${record.id}&businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&tenant=${formState.tenant}`)
    }

    const columns = [
      {
        title: '报警编号',
        dataIndex: 'code',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '报警时间',
        dataIndex: 'alarmTime',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '报警对象',
        dataIndex: 'alarmTargetName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '产品品类',
        dataIndex: 'deviceProdCategoryName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属区域',
        dataIndex: 'areaName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备健康值',
        dataIndex: 'alarmThreshold',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '处理状态',
        dataIndex: 'alarmStatusName',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        fixed: 'right',
        customRender: ({ record }: { record: { id: string; businessKey: string; alarmStatus: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailRow(record)
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
        if (!formState.tenant) return
        const res = await cubeDeviceAlarmService.getAlarmRecordsPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          alarmStatus: formState.status,
          areaIds: formState.area ? formState.area.join('-') : '',
          period: formState.period ? formState.period.join(',') : formState.period,
          tenant: formState.tenant,
          applicationCode: 'OPERATING_ROOM'
        })
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
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
      formState.status = ''
      formState.area = []
      formState.period = []
      formState.tenant = undefined
      formState.prodCategoryId = undefined
      queryForm()
    }
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
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <RadioGroup
                  v-model:value={formState.status} buttonStyle='solid' options={[
                    { label: '所有', value: '' },
                    { label: '待接收', value: 'ALARM_UN_CONFIRMED' },
                    { label: '处理中', value: 'ALARM_PROGRESS_CONFIRMED' },
                    { label: '已挂起', value: 'ALARM_SUSPEND' },
                    { label: '已处理', value: 'ALARM_HANDLER' }
                  ]}
                />
              </FormItem>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect
                  style={{ width: '180px' }} v-model:value={formState.tenant} onChange={tenantChange}
                  allowClear={false}
                />
              </FormItem>
              <FormItem label='产品品类' name='prodCategoryId'>
                <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} style={{ width: '100%' }} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='所属区域'>
                <AreaCascaderSelect v-model:value={formState.area} style='width:180px' placeholder='请选择所属区域' />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='报警时间'>
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              size='small'
              scrollY={scrollY.value}
            />
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
        <Layout title='设备报警' v-slots={layoutSlots} />
      </>
  }
})
