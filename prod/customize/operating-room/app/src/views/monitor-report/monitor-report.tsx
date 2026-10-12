import { defineComponent, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import { cubeDeviceCenterService } from '@/api/service'
import dayjs from 'dayjs'
import type { DeviceSamplingHistoryResult } from '@ghcloud/cube-iot-center-service/src/types'
import Excel from 'exceljs'
import { DeviceModalTable } from '@/components/business/device-modal-table/device-modal-table'

/** 监测报表 */
export const MonitorReport = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive<{
      deviceId: string | undefined;
      period: number[] | undefined;
    }>({
      deviceId: undefined,
      period: []
    })
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        ellipsis: true,
        fixed: 'left',
        customRender: (): JSX.Element=> {
          const name = deviceList.value.length > 0 ? deviceList.value[0].deviceName : '--'
          return <PopOver content={name || '--'}>{name || '--'}</PopOver>
        }
      },
      {
        title: '监测时间',
        dataIndex: 'ts',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },

    ]
    const tableColumns = ref<{ title?: string; width?: number; dataIndex?: string;unit?: string; code?: string; }[]>(columns)

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const propVoList = ref<{
      name: string;
      code: string;
      unit: string;
    }[]>([])

    const getTableData = async (): Promise<void> => {
      if (!formState.deviceId?.length) {
        message.warn('请选择设备')
        tableColumns.value = [...columns]
        dataSource.value = []
        return
      }
      try {
        loading.value = true

        // 获取物联中心的数据，从而获取单位
        const { productPropVoList } = await cubeDeviceCenterService.getNorthDeviceDetail({
          deviceId: formState.deviceId,
          withPropertySpec: true
        })
        propVoList.value = productPropVoList.filter(e => e.propCode !== 'effective').map(e => {
          return {
            name: e.propName ?? '',
            code: e.propCode ?? '',
            unit: e.unitName ?? ''
          }
        })

        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          deviceId: formState.deviceId,
          propCodes: propVoList.value.map(p => p.code),
          startTs: formState.period?.length ? new Date(formState.period[0]).getTime() : undefined,
          endTs: formState.period?.length ? new Date(formState.period[1]).getTime() + 86400000 : undefined,
        }
        const res = await cubeDeviceCenterService.getDeviceHistoryPage(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records
          tableColumns.value = [...columns, ...propVoList.value.map((item) => {
            return {
              title: `${item.name}`,
              dataIndex: `${item.code}`,
              ellipsis: true,
              width: 180,
              customRender: ({ record }: { record: DeviceSamplingHistoryResult; }): JSX.Element => {
                let value = ''
                if (record.propValues) {
                  value = (record.propValues[item.code]?.value ?? '') as string
                  value && (value += item.unit)
                }
                return <PopOver content={value ?? '--'}>{value ?? '--'}</PopOver>
              }
            }
          })]
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
      formState.deviceId = undefined
      formState.period = []
      tableColumns.value = [...columns]
      dataSource.value = []
    }

    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const deviceList = ref<{ deviceName: string; deviceId: string; }[]>([])
    const exportLoading = ref(false)
    const getExportData = async (): Promise<void> => {
      if (!formState.deviceId) return
      try {
        exportLoading.value = true
        await getTableData()
        const count = Math.ceil(pagination.value.total / 1000)
        const exportData: DeviceSamplingHistoryResult[] = []
        for (let i = 0; i < count; i++) {
          const params = {
            pageNumber: i + 1,
            pageSize: 1000,
            deviceId: formState.deviceId,
            propCodes: propVoList.value.map(p => p.code),
            startTs: formState.period?.length ? new Date(formState.period[0]).getTime() : undefined,
            endTs: formState.period?.length ? new Date(formState.period[1]).getTime() + 86400000 : undefined,
          }
          const { records } = await cubeDeviceCenterService.getDeviceHistoryPage(params)
          for (const item of records) {
            propVoList.value.forEach(prop => {
              if (prop.code && item.propValues && item.propValues.hasOwnProperty(prop.code)) {
                item.propValues[prop.code].unit = prop.unit
              }
            })
          }
          exportData.push(...records)
        }
        exportExcel(exportData)
      } catch {
      } finally {
        exportLoading.value = false
      }
    }
    const exportExcel = async (data: DeviceSamplingHistoryResult[]): Promise<void> => {
      if (data.length === 0) {
        message.warn('暂无数据')
        return
      }
      const workbook = new Excel.Workbook()
      const worksheet = workbook.addWorksheet()

      // @ts-expect-error
      worksheet.columns = tableColumns.value.map((e) => {
        return { header: e?.title, key: e?.dataIndex, width: 20 }
      })
      const res = data.map((item: DeviceSamplingHistoryResult) => {
        const obj: Record<string, string> = {}
        if (item.propValues) {
          for (const k in item.propValues) {
            let value = ''
            if (item.propValues) {
              value = (item.propValues[k]?.value ?? '') as string
              value && (value += item.propValues[k].unit ?? '')
            }
            obj[k] = value ?? '--'
          }
          obj.deviceName = deviceList.value[0].deviceName
          obj.ts = item.ts ? dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
        return obj
      })

      worksheet.addRows(res)
      const a = document.createElement('a')
      a.download = '洁净手术室历史监测记录.xlsx'
      a.href = window.URL.createObjectURL(
        new Blob([await workbook.xlsx.writeBuffer()], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        })
      )
      a.click()
      exportLoading.value = false
    }
    const downloadExcel = async (): Promise<void> => {
      if (!formState.deviceId) {
        message.warn('请选择设备')
        return
      }
      getExportData()
    }
    const { scrollY } = useTableScroll()

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <div>
            <Button type='primary' loading={exportLoading.value} onClick={downloadExcel}>导出记录</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
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
                    maxTagCount={6}
                    fieldNames={{ label: 'deviceName', value: 'deviceId' }}
                  />
                  <Button type='primary' onClick={() => deviceModalTableRef.value?.openModal()}>选择设备</Button>
                </div>
              </FormItem>
              <FormItem label='选择日期' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              pagination={false} loading={loading.value}
              columns={tableColumns.value} dataSource={dataSource.value} size='small'
              scrollX={tableColumns.value.length * 200}
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
        <Layout title={pageTitle ?? '监测报表'} v-slots={layoutSlots} />
        <DeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          multiple={false}
          searchParams={{ applicationCode: 'OPERATING_ROOM' }}
          onOk={(values: { deviceName: string; deviceId: string; }[]) => {
            deviceList.value = values.map(e => {
              return { deviceName: e.deviceName, deviceId: e.deviceId }
            })
            formState.deviceId = deviceList.value[0].deviceId
          }}
        />
      </>
  }
})
