import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import dayjs from 'dayjs'
import { usePageName } from '@/hook/use-page-name'
import { cubeOperatingRoomService } from '@/api/service'
import { useTableScroll } from '@/hook/use-table-scroll'
import { DeviceStatusOptions, type MedicalNormRecord, type MedicalOverrunAlarmHistoryRecordVO, type PropNorm } from '@ghcloud/cube-operating-room-service'
import { DeviceModalTable } from '@/components/business/device-modal-table/device-modal-table'
import { useLoopExportExcel } from '@/hook/use-loop-export-excel'
import { NormSelect } from '@/components/business/norm-select/norm-select'
import { ProductSelect } from '@/components/business/product-select/product-select'
import { authStore } from '@/api/auth-store'
import { DeptSelect } from '@/components/business/dept-select/dept-select'

/** 历史监测记录 */
export const HistoryMonitorRecord = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const { exportLoading, exportData } = useLoopExportExcel()
    const formState = reactive<{
      deviceId: string[] | undefined;
      period: number[] | undefined;
      productId: undefined;
      depId: undefined;
      status: undefined;
      norm: string[] | undefined;
    }>({
      depId: undefined,
      status: undefined,
      productId: undefined,
      norm: undefined,
      deviceId: undefined,
      period: []
    })
    const columns = [
      {
        title: '所属医院',
        dataIndex: 'tenantName',
        ellipsis: true,
        fixed: 'left',
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属部门',
        dataIndex: 'depName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '记录时间',
        dataIndex: 'monitoringTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const cur = DeviceStatusOptions.find(s => s.value === text)
          return <PopOver content={cur?.label ?? '--'}><span style={{ color: cur?.color ?? 'inherit' }}>{cur?.label || '--'}</span></PopOver>
        }
      },
    ]
    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const deviceList = ref<{ deviceName: string; deviceId: string; }[]>([])
    const loading = ref(false)
    const dataSource = ref<MedicalOverrunAlarmHistoryRecordVO[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const normList = ref<PropNorm[]>([])
    const handleNormChange = (norms: PropNorm[]): void => {
      normList.value = norms
    }
    const productChange = (): void => {
      formState.norm = undefined
    }
    const propVoSelectList = ref<MedicalNormRecord[]>([])
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          tenant: authStore.tenant ?? '',
          depId: formState.depId ?? '',
          status: formState.status ?? '',
          deviceIds: formState.deviceId ?? [],
          period: formState.period?.length ? formState.period.join(',') : '',
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber
        }
        const res = await cubeOperatingRoomService.getMedicalOverrunAlarmPage(params)
        if (res) {
          const { records, total } = res
          // 获取指标
          if (formState.norm && formState.norm.length > 0) {
            propVoSelectList.value = normList.value.map(n => {
              return {
                normCode: n.code,
                normName: n.name,
                unit: n.unit
              }
            })
          } else {
            // (默认取第一行数据的列)
            propVoSelectList.value = records.find(item => item?.recordData && item?.recordData.length > 0)?.recordData ?? []
          }
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
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      propVoSelectList.value = []
      dataSource.value = []
      queryForm()
    }
    onMounted(() => {
      queryForm()
    })
    // 动态列
    const tableColumns = computed(() => {
      const columnList = [...propVoSelectList.value.map((item) => {
        return {
          title: `${item.normName}${item.unit}`,
          dataIndex: `${item.normCode}`,
          ellipsis: true,
          width: 180,
          customRender: ({ record }: { record: MedicalOverrunAlarmHistoryRecordVO; }): JSX.Element=> {
            let value = null
            let color = ''
            if (record.recordData) {
              const cur = record.recordData.find(i => i.normCode === item.normCode)
              value = cur?.value
              color = DeviceStatusOptions.find(s => s.value === cur?.status)?.color ?? ''
              if (cur?.normCode === 'airconditioner') {
                value = `${cur?.value}` === '0' ? '正常停机' : `${cur?.value}` === '1' ? '开机' : '--'
                color = '#52c41a'
              }
            }
            return <PopOver content={value ?? '--'}><span style={{ color: color ?? 'inherit' }}>{value ?? '--'}</span></PopOver>
          }
        }
      })]
      const uniqueDataList = Array.from(
        new Map([...columns, ...columnList].map(item => [item.dataIndex, item])).values()
      )
      return uniqueDataList
    })
    const downloadExcel = async (): Promise<void> => {
      await exportData({
        fileName: '历史监测记录',
        exportTotal: pagination.value.total,
        pageSize: 1000,
        columns: tableColumns.value,
        getExportDataFunc: async (pageNumber: number, pageSize: number) => getExportData(pageNumber, pageSize)
      })
    }
    const getExportData = async (pageNumber: number, pageSize: number): Promise<{ records: MedicalOverrunAlarmHistoryRecordVO[]; }> => {
      try {
        const params = {
          pageNumber,
          pageSize,
          depId: formState.depId ?? '',
          tenant: authStore.tenant ?? '',
          deviceIds: formState.deviceId ?? [],
          period: formState.period?.length ? formState.period.join(',') : '',
        }
        const res = await cubeOperatingRoomService.getMedicalOverrunAlarmPage(params)
        return res as { records: MedicalOverrunAlarmHistoryRecordVO[]; }
      } catch {
        return { records: [] }
      }
    }
    const { scrollY } = useTableScroll()

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button type='primary' disabled={dataSource.value.length === 0} loading={exportLoading.value} onClick={downloadExcel}>导出记录</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='维护部门' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DeptSelect tenant={authStore.tenant} v-model:value={formState.depId} width='180px' />
              </FormItem>
              <FormItem label='选择日期' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem label='状态' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select options={DeviceStatusOptions} v-model:value={formState.status} placeholder='请选择状态' style={{ width: '180px' }} />
              </FormItem>
              <FormItem label='所属产品' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <ProductSelect tenant={authStore.tenant} v-model:value={formState.productId} onChange={productChange} width='180px' />
              </FormItem>
              <FormItem label='选择指标' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <NormSelect mode='multiple' maxTagCount={3} prodId={formState.productId} filterSpecial={formState} v-model:value={formState.norm} onChange={handleNormChange} width='300px' />
              </FormItem>
              <FormItem style={{ display: 'flex', paddingRight: 0, marginRight: '20px', marginBottom: '10px' }} label='选择设备'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select
                    style={{ minWidth: '160px' }}
                    open={false}
                    showArrow={false}
                    allowClear={false}
                    mode='multiple'
                    options={deviceList.value}
                    v-model:value={formState.deviceId}
                    placeholder='请选择设备'
                    maxTagCount={3}
                    fieldNames={{ label: 'deviceName', value: 'deviceId' }}
                  />
                  <Button type='primary' onClick={() => deviceModalTableRef.value?.openModal()}>选择设备</Button>
                </div>
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              columns={tableColumns.value}
              data-source={dataSource.value}
              loading={loading.value}
              rowKey='id'
              pagination={false}
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
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '历史监测记录'} v-slots={layoutSlots} />
        <DeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          multiple
          searchParams={{ applicationCode: 'OPERATING_ROOM' }}
          onOk={(values: { deviceName: string; deviceId: string; }[]) => {
            deviceList.value = values.map(e => {
              return { deviceName: e.deviceName, deviceId: e.deviceId }
            })
            formState.deviceId = deviceList.value.map(d => d.deviceId)
          }}
        />
      </>
  }
})
