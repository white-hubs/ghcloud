import { Button, Modal, PopOver, Table, message, Tag, Tabs, TabPane, Spin } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'
import { cubeDeviceCenterInternalService } from '@/api/service'
import styles from './device-data-share-modal.module.less'

// ==================== 类型定义 ====================
interface DeviceDataShare {
  id: string;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceProductId: string;
  sourceProductName: string;
  sourceDataType: number;
  sourceDataId: string;
  sourceDataCode: string;
  targetDeviceId: string;
  targetDeviceName?: string;
  targetProductId: string;
  targetProductName: string;
  targetDataId: string;
  targetDataCode?: string;
  shareMode: number;
}

interface Props {
  deviceId: string;
  deviceName: string;
  type: 'source' | 'target'; // source: 关联设备, target: 被关联设备
}

// ==================== 组件 ====================
export const DeviceDataShareModal = defineComponent({
  props: {
    deviceId: {
      type: String,
      default: ''
    },
    deviceName: {
      type: String,
      default: ''
    },
    type: {
      type: String as () => 'source' | 'target',
      default: 'source'
    }
  },
  emits: ['ok'],
  setup (_props: Props, { emit, expose }) {
    const modalVisible = ref(false)
    const loading = ref(false)
    // property: 属性, event: 事件
    const activeTab = ref('property')
    const allDataList = ref<DeviceDataShare[]>([])
    const propertyList = ref<DeviceDataShare[]>([])
    const eventList = ref<DeviceDataShare[]>([])
    const currentDeviceId = ref('')
    const currentDeviceName = ref('')
    const currentType = ref<'source' | 'target'>('source')
    const propertySelectedRowKeys = ref<string[]>([])
    const propertySelectedRows = ref<DeviceDataShare[]>([])
    const eventSelectedRowKeys = ref<string[]>([])
    const eventSelectedRows = ref<DeviceDataShare[]>([])
    
    // ==================== 表格列配置 ====================
    const getColumns = (isSource: boolean) => [
      {
        title: isSource ? '目标设备名称' : '源设备名称',
        dataIndex: isSource ? 'targetDeviceName' : 'sourceDeviceName',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: DeviceDataShare }): JSX.Element => {
          const text = isSource 
            ? (record.targetDeviceName || record.targetDeviceId || '--')
            : (record.sourceDeviceName || record.sourceDeviceId || '--')
          return <PopOver content={text}>{text}</PopOver>
        }
      },
      {
        title: isSource ? '目标设备ID' : '源设备ID',
        dataIndex: isSource ? 'targetDeviceId' : 'sourceDeviceId',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || '--'}>{text || '--'}</PopOver>
        )
      },
      {
        title: isSource ? '目标产品' : '源产品',
        dataIndex: isSource ? 'targetProductName' : 'sourceProductName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || '--'}>{text || '--'}</PopOver>
        )
      },
      {
        title: isSource ? '目标数据标识' : '源数据标识',
        dataIndex: isSource ? 'targetDataCode' : 'sourceDataCode',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || '--'}>{text || '--'}</PopOver>
        )
      },
      {
        title: '数据类型',
        dataIndex: 'sourceDataType',
        ellipsis: true,
        width: 100,
        align: 'center' as const,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const typeText = text === 1 ? '属性' : '事件'
          const typeColor = text === 1 ? 'blue' : 'green'
          return <Tag color={typeColor}>{typeText}</Tag>
        }
      },
      {
        title: '共享模式',
        dataIndex: 'shareMode',
        ellipsis: true,
        width: 100,
        align: 'center' as const,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const modeText = text === 1 ? '共享' : '转换'
          const modeColor = text === 1 ? 'blue' : 'green'
          return <Tag color={modeColor}>{modeText}</Tag>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        align: 'center' as const,
        fixed: 'right' as const,
        customRender: ({ record }: { record: DeviceDataShare }): JSX.Element => (
          <Button 
            type='link' 
            size='small' 
            danger
            onClick={() => handleRemove(record)}
          >
            移除
          </Button>
        )
      }
    ]
    
    // ==================== API 调用 ====================
    /**
     * 获取关联数据列表
     */
    const getDataShareList = async (deviceId: string, type: 'source' | 'target'): Promise<void> => {
      try {
        loading.value = true
        let res: DeviceDataShare[] = []
        
        if (type === 'source') {
          // 查询关联数据接口
          res = await cubeDeviceCenterInternalService.getDeviceDataShare(deviceId)
        } else {
          // 查询被关联数据接口
          res = await cubeDeviceCenterInternalService.getDeviceDataShareTarget(deviceId)
        }
        
        if (res && Array.isArray(res)) {
          allDataList.value = res
          // 根据 sourceDataType 拆分：1-属性 2-事件
          propertyList.value = res.filter(item => item.sourceDataType === 1)
          eventList.value = res.filter(item => item.sourceDataType === 2)
        }
      } catch (error) {
        message.error('获取关联数据失败')
      } finally {
        loading.value = false
      }
    }
    
    // ==================== 事件处理 ====================
    /**
     * 单个移除关联
     */
    const handleRemove = async (record: DeviceDataShare): Promise<void> => {
      try {
        loading.value = true
        await cubeDeviceCenterInternalService.removeDeviceDataShare(record.id)
        message.success('移除成功')
        // 刷新数据列表
        await getDataShareList(currentDeviceId.value, currentType.value)
        // 清空选择
        propertySelectedRowKeys.value = []
        propertySelectedRows.value = []
        eventSelectedRowKeys.value = []
        eventSelectedRows.value = []
        // 通知父组件刷新设备列表
        emit('ok')
      } catch (error) {
        message.error('移除失败')
      } finally {
        loading.value = false
      }
    }
    
    /**
     * 批量移除关联
     */
    const handleBatchRemove = async (): Promise<void> => {
      const selectedKeys = activeTab.value === 'property' 
        ? propertySelectedRowKeys.value 
        : eventSelectedRowKeys.value
      
      if (selectedKeys.length === 0) {
        message.warning('请选择需要移除的关联数据')
        return
      }
      
      try {
        loading.value = true
        await cubeDeviceCenterInternalService.batchRemoveDeviceDataShare({
          ids: selectedKeys
        })
        message.success(`成功移除 ${selectedKeys.length} 条关联数据`)
        // 刷新数据列表
        await getDataShareList(currentDeviceId.value, currentType.value)
        // 清空选择
        propertySelectedRowKeys.value = []
        propertySelectedRows.value = []
        eventSelectedRowKeys.value = []
        eventSelectedRows.value = []
        // 通知父组件刷新设备列表
        emit('ok')
      } catch (error) {
        message.error('批量移除失败')
      } finally {
        loading.value = false
      }
    }
    
    /**
     * 属性列表行选择变化
     */
    const handlePropertySelectChange = (keys: (string | number)[], rows: DeviceDataShare[]): void => {
      propertySelectedRowKeys.value = keys as string[]
      propertySelectedRows.value = rows
    }
    
    /**
     * 事件列表行选择变化
     */
    const handleEventSelectChange = (keys: (string | number)[], rows: DeviceDataShare[]): void => {
      eventSelectedRowKeys.value = keys as string[]
      eventSelectedRows.value = rows
    }
    
    /**
     * 取消/关闭弹窗
     */
    const handleCancel = (): void => {
      modalVisible.value = false
      allDataList.value = []
      propertyList.value = []
      eventList.value = []
      activeTab.value = 'property'
      propertySelectedRowKeys.value = []
      propertySelectedRows.value = []
      eventSelectedRowKeys.value = []
      eventSelectedRows.value = []
    }
    
    /**
     * Tab 切换
     */
    const handleTabChange = (key: string): void => {
      activeTab.value = key
      // 切换tab时清空选择
      propertySelectedRowKeys.value = []
      propertySelectedRows.value = []
      eventSelectedRowKeys.value = []
      eventSelectedRows.value = []
    }
    
    /**
     * 打开弹窗
     */
    const openModal = (deviceId: string, deviceName: string, type: 'source' | 'target'): void => {
      currentDeviceId.value = deviceId
      currentDeviceName.value = deviceName
      currentType.value = type
      modalVisible.value = true
      activeTab.value = 'property'
      getDataShareList(deviceId, type)
    }
    
    expose({
      openModal
    })
    
    return (): JSX.Element => {
      const isSource = currentType.value === 'source'
      const columns = getColumns(isSource)
      
      return (
        <Modal
          visible={modalVisible.value}
          title={`${isSource ? '关联设备' : '被关联设备'} - ${currentDeviceName.value}`}
          width='1200px'
          destroyOnClose
          onCancel={handleCancel}
          footer={null}
        >
          <Spin spinning={loading.value}>
            <Tabs activeKey={activeTab.value} onChange={handleTabChange}>
              <TabPane key='property' tab='关联属性'>
                {propertySelectedRowKeys.value.length > 0 && (
                  <div class={styles['batch-actions']}>
                    <span>已选：{propertySelectedRowKeys.value.length} 条</span>
                    <Button type="primary" danger onClick={handleBatchRemove}>
                      批量移除
                    </Button>
                  </div>
                )}
                <Table
                  columns={columns}
                  loading={loading.value}
                  dataSource={propertyList.value}
                  pagination={false}
                  size='small'
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: propertySelectedRowKeys.value,
                    onChange: handlePropertySelectChange
                  }}
                  rowKey='id'
                  scrollY={450}
                />
                {propertyList.value.length === 0 && !loading.value && (
                  <div class={styles['empty-tip']}>暂无关联属性数据</div>
                )}
              </TabPane>
              <TabPane key='event' tab='关联事件'>
                {eventSelectedRowKeys.value.length > 0 && (
                  <div class={styles['batch-actions']}>
                    <span>已选：{eventSelectedRowKeys.value.length} 条</span>
                    <Button type="primary" danger onClick={handleBatchRemove}>
                      批量移除
                    </Button>
                  </div>
                )}
                <Table
                  columns={columns}
                  loading={loading.value}
                  dataSource={eventList.value}
                  pagination={false}
                  size='small'
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: eventSelectedRowKeys.value,
                    onChange: handleEventSelectChange
                  }}
                  rowKey='id'
                  scrollY={450}
                />
                {eventList.value.length === 0 && !loading.value && (
                  <div class={styles['empty-tip']}>暂无关联事件数据</div>
                )}
              </TabPane>
            </Tabs>
          </Spin>
          
          <div class={styles['button-container']}>
            <Button onClick={handleCancel}>关闭</Button>
          </div>
        </Modal>
      )
    }
  }
})

