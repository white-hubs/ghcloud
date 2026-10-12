import { forwardRef, useState } from 'react'
import '../components.less'
import type { EnergyAlarmDeviceRef, AlarmDeviceType, DeviceTypeAlarm } from './alarm-device-model'
import { Button, Modal, Table, Cascader, Input, Form, Pagination } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeviceService, type ApplicationDevice } from '@ghcloud/cube-service'
import FormItem from 'antd/es/form/FormItem'
import { useAsyncEffect } from '@ghcloud/cube-iot-center-app/hooks/use-async-effect'
let dataStateList: DeviceTypeAlarm[] = []
export const EnergyModal = forwardRef<EnergyAlarmDeviceRef, { showModel: boolean;selectedList: DeviceTypeAlarm[];sendShowModel: (args: boolean) => void;sendAlarmDevice: (args: AlarmDeviceType) => void; }>(({ showModel, selectedList, sendShowModel, sendAlarmDevice }) => {
  const [changeData, setChangeData] = useState<boolean>(false)
  const [AlarmDevice, setAlarmDevice] = useState<AlarmDeviceType>(
    {
      enabled: true,
      emergencyRuleConditions: []
    }
  )
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalDataSource, setModalDataSource] = useState<ApplicationDevice[]>([])
  const [areas, setAreas] = useState<{ name: string;id: string; }[]>([])
  const [deviceQuery, setDeviceQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    deviceAreaId: '',
    areaId: '',
    keyword: '',
  })
  const modalColumns: ColumnsType<ApplicationDevice> = [
    {
      title: '序号',
      dataIndex: 'key',
      render: (text, record, index): JSX.Element => {
        return <span>{index + 1}</span>
      }
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      render: (text: string): string => {
        return text || '--'
      }
    },
    {
      title: '设备品牌',
      dataIndex: 'productBrandName',
      render: (text: string): string => {
        return text || '--'
      }
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      render: (text: string): string => {
        return text || '--'
      }
    },
    {
      title: '区域',
      dataIndex: 'deviceAreaName',
      render: (text: string): string => {
        return text || '--'
      }
    },

  ]
  useAsyncEffect(async () => {
    DeviceService.getDeviceArea().then(res => {
      setAreas(res)
    })
    setIsModalOpen(showModel)
    if (!showModel) {
      sendAlarmDevice(AlarmDevice)
    }
  }, [AlarmDevice, showModel])
  useAsyncEffect(async () => {
    queryDevice()
    const keys = selectedList.map(x => x.deviceId)
    if (showModel) {
      dataStateList = []
      if (selectedList.length > 0)dataStateList = selectedList
      setSelectedRowKeys(keys)
    }
  }, [changeData, isModalOpen])
  useAsyncEffect(async () => {
    queryDevice()
  }, [deviceQuery.areaId, deviceQuery.pageNumber, deviceQuery.pageSize, showModel])

  return (
    <div>
      <Modal
        width={800}
        title='选择设备'
        open={isModalOpen}
        maskClosable
        cancelText='关闭'
        onCancel={() => {
          sendShowModel(isModalOpen); setIsModalOpen(false)
        }}
        onOk={okModal}
      >
        <Form layout='inline' style={{ marginBottom: '16px' }}>
          <FormItem label='区域'>
            <Cascader
              style={{ width: 200 }}
              placeholder='请选择区域'
              options={areas}
              fieldNames={{ label: 'name', value: 'id' }} onChange={(e) => {
                setDeviceQuery({
                  ...deviceQuery,
                  areaId: e ? e.at(-1) as unknown as string : '',
                  deviceAreaId: e ? e.join(',') : ''
                })
              }}
              changeOnSelect
            />
          </FormItem>
          <FormItem>
            <Input value={deviceQuery.keyword} onChange={(e: { target: { value: string; }; }) => {
              setDeviceQuery({ ...deviceQuery, keyword: e.target.value })
            }} placeholder='请输入设备名称' />
          </FormItem>
          <FormItem>
            <Button type='primary' onClick={() => {
              queryDevice()
            }}>查询</Button>
            <Button onClick={() => {
              reset()
            }} style={{ marginLeft: '20px' }}>重置</Button>
          </FormItem>

        </Form>
        <Table
          pagination={false}
          rowKey='deviceId'
          columns={modalColumns}
          dataSource={modalDataSource}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            preserveSelectedRowKeys: true,
            onChange: (keys: React.Key[]) => {
              setSelectedRowKeys(keys)
            },
            onSelect: (record: ApplicationDevice, selected: boolean) => {
              const findIndex = dataStateList.findIndex(e => e.id === record.id)
              if (selected && findIndex === -1) {
                dataStateList = [...dataStateList, {
                  ...record,
                  conditionType: '',
                  deviceProdCategoryCodeConcat: record.deviceProdCategoryCodeConcat,
                  deviceProdCategoryName: record.deviceType,
                  deviceProdId: record.deviceProdId,
                  deviceProdName: record.productName,
                  deviceId: record.deviceId,
                  deviceName: record.deviceName,
                  deviceAreaId: record.areaId,
                  deviceAreaName: record.deviceAreaName,
                  id: record.id,
                }]
              }
              if (!selected && findIndex !== -1) {
                dataStateList.splice(findIndex, 1)
              }
            },
            onSelectAll: (selected) => {
              modalDataSource.forEach(record => {
                const findIndex = dataStateList.findIndex(e => e.id === (record as { id: string; }).id)
                if (findIndex === -1 && selected) {
                  dataStateList.push({
                    ...record,
                    conditionType: '',
                    deviceProdCategoryCodeConcat: record.deviceProdCategoryCodeConcat,
                    deviceProdCategoryName: record.deviceType,
                    deviceProdId: record.deviceProdId,
                    deviceProdName: record.productName,
                    deviceId: record.deviceId,
                    deviceName: record.deviceName,
                    deviceAreaId: record.areaId,
                    deviceAreaName: record.deviceAreaName,
                    id: record.id,
                  })
                }
                if (findIndex !== -1 && !selected) {
                  dataStateList.splice(findIndex, 1)
                }
              })
            }
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: '16px' }}>
          <Pagination
            onChange={(page, pageSize) => {
              setDeviceQuery({ ...deviceQuery, pageNumber: page, pageSize })
            }} current={deviceQuery.pageNumber} pageSize={deviceQuery.pageSize} showTotal={(total) => `共${total}条数据`} defaultCurrent={deviceQuery.pageNumber} total={deviceQuery.total} showSizeChanger
          />
        </div>
      </Modal>
    </div>
  )
  function okModal (): void {
    setIsModalOpen(false)
    sendShowModel(isModalOpen)
    dataStateList.forEach(x => {
      x.deviceProdCategoryCodeConcat = x.productCategoryPathCode ?? x.deviceProdCategoryCodeConcat
      x.deviceProdCategoryName = x.productCategoryName ?? x.deviceProdCategoryName
      x.deviceProdId = x.productId ?? x.deviceProdId
      x.deviceProdName = x.productName ?? x.deviceProdName
    })
    setAlarmDevice({
      ...AlarmDevice,
      enabled: false,
      emergencyRuleConditions: [...dataStateList]
    })
  }

  async function queryDevice (params?: { pageNumber: number;pageSize: number;areaId: string;keyword: string; }): Promise<void> {
    try {
      setLoading(true)
      const data = await DeviceService.getEnergyApplicationDevice(params ?? { ...deviceQuery })
      setModalDataSource(data.records)
      setDeviceQuery({
        ...deviceQuery,
        total: data.total
      })
    } catch {
    } finally {
      setLoading(false)
    }
  }
  function reset (): void {
    setDeviceQuery({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      areaId: '',
      deviceAreaId: '',
      keyword: ''
    })
    setChangeData(!changeData)
  }
})
