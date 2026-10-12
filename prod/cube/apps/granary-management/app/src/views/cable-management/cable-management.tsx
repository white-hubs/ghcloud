import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Input, message, Page, PopOver, Table } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import type {
  LiangcangBoundWarehouseSimpleItem,
  LiangcangWarehouseCableAvailableDeviceItem,
  LiangcangWarehouseCableListItem,
  LiangcangWarehouseCablePointMappingItem,
} from '@ghcloud/cube-granary-management-service'
import { Checkbox, Form, InputNumber, Modal, Popconfirm, Select, type FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { cubeGranaryManagementService } from '@/api/service'
import './cable-management.less'

interface CreateCableFormState {
  warehouseId: number | undefined
  cableNo: string
  pointCount: number
}

const DEFAULT_PAGE_SIZE = 10

const renderCell = (text: string): JSX.Element => (
  <PopOver content={text === '' ? '--' : text}>{text === '' ? '--' : text}</PopOver>
)

const sortPointNos = (rows: LiangcangWarehouseCablePointMappingItem[]): number[] =>
  rows
    .filter((item) => item.deviceId == null || item.status === 'unmapped')
    .map((item) => item.pointNo)
    .sort((a, b) => a - b)

const mapWarehouseToOption = (item: LiangcangBoundWarehouseSimpleItem): { label: string; value: number } => ({
  label: item.name ?? `仓房${item.warehouseId}`,
  value: item.warehouseId,
})

export const CableManagement = defineComponent({
  name: 'CableManagement',
  setup: () => {
    const { pageTitle } = usePageName()

    const warehouseOptions = ref<LiangcangBoundWarehouseSimpleItem[]>([])
    const warehouseId = ref<number | null>(null)

    const cableLoading = ref(false)
    const cableList = ref<LiangcangWarehouseCableListItem[]>([])
    const selectedCableId = ref<number | null>(null)

    const pointLoading = ref(false)
    const pointRows = ref<LiangcangWarehouseCablePointMappingItem[]>([])

    const createCableVisible = ref(false)
    const createCableSubmitting = ref(false)
    const createCableFormRef = ref<FormInstance>()
    const createCableForm = reactive<CreateCableFormState>({
      warehouseId: undefined,
      cableNo: '',
      pointCount: 1,
    })
    const createCableFormRules: Record<string, Rule[]> = {
      warehouseId: [{ required: true, message: '请选择所属仓房', trigger: 'change' }],
      cableNo: [
        {
          validator: async (_rule: Rule, value: string) => {
            if (typeof value === 'string' && value.trim() !== '') {
              return Promise.resolve()
            }
            return await Promise.reject(new Error('请输入业务电缆编号'))
          },
          trigger: 'blur',
        },
      ],
      pointCount: [
        {
          validator: async (_rule: Rule, value: number) => {
            if (Number.isFinite(value) && value > 0) {
              return Promise.resolve()
            }
            return await Promise.reject(new Error('点位数量需大于 0'))
          },
          trigger: 'change',
        },
      ],
    }

    const mappingVisible = ref(false)
    const mappingSubmitting = ref(false)
    const availableLoading = ref(false)
    const availableDevices = ref<LiangcangWarehouseCableAvailableDeviceItem[]>([])
    const availableTotal = ref(0)
    const availableFilters = reactive({
      keyword: '',
      onlyUnmapped: true,
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    })
    const selectedDeviceMap = reactive<Record<string, LiangcangWarehouseCableAvailableDeviceItem>>({})
    const selectedDeviceOrder = ref<string[]>([])
    const draggingDeviceId = ref('')

    const selectedCable = computed(() =>
      cableList.value.find((item) => item.cableId === selectedCableId.value) ?? null,
    )
    const unmappedPointNos = computed(() => sortPointNos(pointRows.value))
    const selectedDevices = computed(() =>
      selectedDeviceOrder.value
        .map((id) => selectedDeviceMap[id])
        .filter((item): item is LiangcangWarehouseCableAvailableDeviceItem => item != null),
    )

    const loadCableList = async (nextWarehouseId: number): Promise<void> => {
      cableLoading.value = true
      try {
        const list = await cubeGranaryManagementService.getWarehouseCableList(nextWarehouseId)
        cableList.value = list
        const previousSelected = selectedCableId.value
        const fallbackCable = list[0]
        const targetCable = list.find((item) => item.cableId === previousSelected) ?? fallbackCable ?? null
        selectedCableId.value = targetCable?.cableId ?? null
      } finally {
        cableLoading.value = false
      }
    }

    const loadPointList = async (): Promise<void> => {
      if (selectedCableId.value == null) {
        pointRows.value = []
        return
      }
      pointLoading.value = true
      try {
        pointRows.value = await cubeGranaryManagementService.getWarehouseCablePointList(selectedCableId.value)
      } finally {
        pointLoading.value = false
      }
    }

    const loadWarehouses = async (): Promise<void> => {
      const list = await cubeGranaryManagementService.getBoundWarehouseSimpleList()
      warehouseOptions.value = list
      if (list.length === 0) {
        warehouseId.value = null
        cableList.value = []
        pointRows.value = []
        return
      }
      const initialWarehouseId = warehouseId.value ?? list[0]?.warehouseId ?? null
      warehouseId.value = initialWarehouseId
      if (initialWarehouseId == null) {
        return
      }
      await loadCableList(initialWarehouseId)
      await loadPointList()
    }

    const refreshCurrentCableData = async (): Promise<void> => {
      if (warehouseId.value == null) {
        return
      }
      await loadCableList(warehouseId.value)
      await loadPointList()
    }

    const handleWarehouseChange = async (value: number): Promise<void> => {
      warehouseId.value = value
      selectedCableId.value = null
      pointRows.value = []
      await loadCableList(value)
      await loadPointList()
    }

    const handleSelectCable = async (cableId: number): Promise<void> => {
      if (selectedCableId.value === cableId) {
        return
      }
      selectedCableId.value = cableId
      await loadPointList()
    }

    const openCreateCableModal = (): void => {
      createCableForm.warehouseId = warehouseId.value ?? undefined
      createCableForm.cableNo = ''
      createCableForm.pointCount = 1
      createCableVisible.value = true
      setTimeout(() => {
        createCableFormRef.value?.clearValidate?.()
      }, 0)
    }

    const submitCreateCable = async (): Promise<void> => {
      try {
        await createCableFormRef.value?.validate()
      } catch {
        return
      }
      const formWarehouseId = createCableForm.warehouseId
      const cableNo = createCableForm.cableNo.trim()
      if (formWarehouseId == null || cableNo === '' || !Number.isFinite(createCableForm.pointCount) || createCableForm.pointCount <= 0) {
        return
      }
      createCableSubmitting.value = true
      try {
        const ok = await cubeGranaryManagementService.createWarehouseCable({
          warehouseId: formWarehouseId,
          cableNo,
          pointCount: createCableForm.pointCount,
        })
        if (!ok) {
          message.error('新增电缆失败')
          return
        }
        createCableVisible.value = false
        warehouseId.value = formWarehouseId
        await loadCableList(formWarehouseId)
        const matched = cableList.value.find((item) => item.cableNo === cableNo)
        if (matched != null) {
          selectedCableId.value = matched.cableId
        }
        await loadPointList()
        message.success('新增电缆成功')
      } finally {
        createCableSubmitting.value = false
      }
    }

    const loadAvailableDevices = async (): Promise<void> => {
      if (warehouseId.value == null) {
        availableDevices.value = []
        availableTotal.value = 0
        return
      }
      availableLoading.value = true
      try {
        const page = await cubeGranaryManagementService.getCableAvailableDevicesPage({
          pageNumber: availableFilters.pageNumber,
          pageSize: availableFilters.pageSize,
          warehouseId: warehouseId.value,
          ...(availableFilters.keyword !== '' ? { deviceName: availableFilters.keyword } : {}),
          onlyUnmapped: availableFilters.onlyUnmapped,
        })
        availableDevices.value = page.records
        availableTotal.value = page.total
      } finally {
        availableLoading.value = false
      }
    }

    const openMappingModal = async (): Promise<void> => {
      if (selectedCable.value == null) {
        message.warning('请先选择电缆')
        return
      }
      if (unmappedPointNos.value.length === 0) {
        message.warning('当前电缆无可映射点位')
        return
      }
      availableFilters.keyword = ''
      availableFilters.onlyUnmapped = true
      availableFilters.pageNumber = 1
      selectedDeviceOrder.value = []
      Object.keys(selectedDeviceMap).forEach((key) => {
        delete selectedDeviceMap[key]
      })
      mappingVisible.value = true
      await loadAvailableDevices()
    }

    const closeMappingModal = (): void => {
      mappingVisible.value = false
      selectedDeviceOrder.value = []
      Object.keys(selectedDeviceMap).forEach((key) => {
        delete selectedDeviceMap[key]
      })
    }

    const handleToggleDevice = (device: LiangcangWarehouseCableAvailableDeviceItem, checked: boolean): void => {
      if (device.mapped && selectedDeviceMap[device.deviceId] == null) {
        return
      }
      if (checked) {
        if (selectedDeviceMap[device.deviceId] == null) {
          selectedDeviceMap[device.deviceId] = device
          selectedDeviceOrder.value = [...selectedDeviceOrder.value, device.deviceId]
        }
        return
      }
      delete selectedDeviceMap[device.deviceId]
      selectedDeviceOrder.value = selectedDeviceOrder.value.filter((id) => id !== device.deviceId)
    }

    const handleRemoveSelectedDevice = (deviceId: string): void => {
      delete selectedDeviceMap[deviceId]
      selectedDeviceOrder.value = selectedDeviceOrder.value.filter((id) => id !== deviceId)
    }

    const handleDragStart = (deviceId: string): void => {
      draggingDeviceId.value = deviceId
    }

    const handleDropTo = (targetDeviceId: string): void => {
      const fromId = draggingDeviceId.value
      if (fromId === '' || fromId === targetDeviceId) {
        return
      }
      const order = [...selectedDeviceOrder.value]
      const fromIndex = order.indexOf(fromId)
      const targetIndex = order.indexOf(targetDeviceId)
      if (fromIndex < 0 || targetIndex < 0) {
        return
      }
      order.splice(fromIndex, 1)
      order.splice(targetIndex, 0, fromId)
      selectedDeviceOrder.value = order
      draggingDeviceId.value = ''
    }

    const submitMappings = async (): Promise<void> => {
      if (selectedCable.value == null) {
        message.warning('请先选择电缆')
        return
      }
      if (selectedDeviceOrder.value.length === 0) {
        message.warning('请至少选择一个设备')
        return
      }
      const pointNos = unmappedPointNos.value
      if (selectedDeviceOrder.value.length > pointNos.length) {
        message.warning('已选设备数超过未映射点位数')
        return
      }
      const mappings = selectedDeviceOrder.value.map((deviceId, index) => ({
        pointNo: pointNos[index] ?? 0,
        deviceId,
      }))
      mappingSubmitting.value = true
      try {
        const ok = await cubeGranaryManagementService.createCablePointMappings({
          cableId: selectedCable.value.cableId,
          mappings,
        })
        if (!ok) {
          message.error('映射保存失败')
          return
        }
        message.success('映射成功')
        closeMappingModal()
        await refreshCurrentCableData()
      } finally {
        mappingSubmitting.value = false
      }
    }

    const cancelMapping = async (row: LiangcangWarehouseCablePointMappingItem): Promise<void> => {
      if (row.pointId == null || selectedCable.value == null) {
        return
      }
      const ok = await cubeGranaryManagementService.unbindCablePoints({
        pointIds: [row.pointId],
      })
      if (!ok) {
        message.error('取消映射失败')
        return
      }
      message.success('已取消映射')
      await refreshCurrentCableData()
    }

    const deleteCable = async (row: LiangcangWarehouseCableListItem): Promise<void> => {
      const ok = await cubeGranaryManagementService.deleteWarehouseCable({
        cableId: row.cableId,
      })
      if (!ok) {
        message.error('删除电缆失败')
        return
      }
      message.success('删除电缆成功')
      await refreshCurrentCableData()
    }

    const statusText = (status: string): string => {
      if (status === 'mapped') {
        return '已映射'
      }
      if (status === 'partial') {
        return '部分映射'
      }
      return '未映射'
    }

    onMounted(() => {
      void loadWarehouses()
    })

    const pointColumns = [
      {
        title: '业务点位',
        dataIndex: 'pointNo',
        width: 160,
        customRender: ({ text }: { text: number }): JSX.Element => renderCell(`${text} 号点`),
      },
      {
        title: '物联设备编号',
        dataIndex: 'deviceCode',
        width: 220,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text || ''),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        customRender: ({ text }: { text: string }): JSX.Element => <span>{statusText(text)}</span>,
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 140,
        customRender: ({ record }: { record: LiangcangWarehouseCablePointMappingItem }): JSX.Element =>
          record.deviceId == null
            ? (
                <span>--</span>
              )
            : (
                <Popconfirm
                  title={`确认取消 ${record.pointNo} 号点位与设备 ${record.deviceCode || '--'} 的映射吗？`}
                  okText='确认'
                  cancelText='取消'
                  onConfirm={() => void cancelMapping(record)}
                >
                  <Button type='link' size='small'>取消映射</Button>
                </Popconfirm>
              ),
      },
    ]

    return (): JSX.Element => (
      <div class='cable-management-root'>
        <CubeLayout
          title={pageTitle ?? '电缆设备映射'}
          showFooter={false}
          v-slots={{
            'layout-header': () => (
              <div class='cable-management-header-actions'>
                <Select
                  class='cable-management-warehouse-select'
                  value={warehouseId.value ?? undefined}
                  placeholder='请选择仓房'
                  options={warehouseOptions.value.map(mapWarehouseToOption)}
                  onChange={(value: number) => {
                    void handleWarehouseChange(value)
                  }}
                />
                <Button type='primary' onClick={openCreateCableModal}>
                  + 新增电缆
                </Button>
              </div>
            ),
            'layout-content': () => (
              <div class='cable-management-page'>
                <div class='cable-management-main'>
                  <div class='cable-management-left'>
                    <div class='cable-management-left-title'>电缆列表</div>
                    <div class='cable-management-cable-list'>
                      {cableLoading.value
                        ? (
                            <div class='cable-management-empty'>加载中...</div>
                          )
                        : cableList.value.length === 0
                          ? (
                              <div class='cable-management-empty'>暂无电缆</div>
                            )
                          : (
                              cableList.value.map((item) => (
                                <div
                                  key={item.cableId}
                                  class={['cable-management-cable-item', item.cableId === selectedCableId.value ? 'is-active' : '']}
                                  onClick={() => {
                                    void handleSelectCable(item.cableId)
                                  }}
                                >
                                  <div class='cable-management-cable-row'>
                                    <span class='cable-management-cable-name'>{item.cableNo || '--'}</span>
                                    <span class={['cable-management-cable-status', `status-${item.status}`]}>{statusText(item.status)}</span>
                                  </div>
                                  <div class='cable-management-cable-desc'>
                                    <span>{item.pointCount} 个点位 · 已映射 {item.mappedCount}/{item.pointCount}</span>
                                    <div
                                      class='cable-management-cable-actions'
                                      onClick={(event: MouseEvent) => {
                                        event.stopPropagation()
                                      }}
                                    >
                                      <Popconfirm
                                        title={`确认删除电缆 ${item.cableNo || '--'} 及其点位映射吗？`}
                                        okText='确认'
                                        cancelText='取消'
                                        onConfirm={() => void deleteCable(item)}
                                      >
                                        <Button type='link' size='small'>删除</Button>
                                      </Popconfirm>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                    </div>
                  </div>
                  <div class='cable-management-right'>
                    <div class='cable-management-right-header'>
                      <div class='cable-management-right-title'>
                        {selectedCable.value == null ? '请选择电缆' : `${selectedCable.value.cableNo} - 点位映射`}
                      </div>
                      <div class='cable-management-right-actions'>
                        <Button type='primary' disabled={selectedCable.value == null} onClick={() => void openMappingModal()}>
                          + 添加映射
                        </Button>
                      </div>
                    </div>
                    <div class='cable-management-table-wrap'>
                      <Table
                        rowKey='pointId'
                        columns={pointColumns}
                        dataSource={pointRows.value}
                        loading={pointLoading.value}
                        pagination={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ),
          }}
        />
        <Modal
          title='新增电缆'
          open={createCableVisible.value}
          width={420}
          onCancel={() => {
            createCableVisible.value = false
            createCableFormRef.value?.clearValidate?.()
          }}
          onOk={() => void submitCreateCable()}
          confirmLoading={createCableSubmitting.value}
        >
          <div class='cable-management-modal-form'>
            <Form ref={createCableFormRef} model={createCableForm} layout='vertical' rules={createCableFormRules}>
              <Form.Item label='所属仓房' name='warehouseId' required>
                <Select
                  value={createCableForm.warehouseId}
                  options={warehouseOptions.value.map(mapWarehouseToOption)}
                  placeholder='请选择仓房'
                  style={{ width: '100%' }}
                  onChange={(value: number) => {
                    createCableForm.warehouseId = value
                  }}
                />
              </Form.Item>
              <Form.Item label='业务电缆编号' name='cableNo' required>
                <Input
                  value={createCableForm.cableNo}
                  maxlength={64}
                  placeholder='请输入业务电缆编号，如：10号缆'
                  onUpdate:value={(value: string) => {
                    createCableForm.cableNo = value
                  }}
                />
              </Form.Item>
              <Form.Item label='点位数量' name='pointCount' required>
                <InputNumber
                  min={1}
                  max={9999}
                  value={createCableForm.pointCount}
                  style={{ width: '100%' }}
                  onChange={(value: string | number | null) => {
                    createCableForm.pointCount = Number(value ?? 0)
                  }}
                />
              </Form.Item>
            </Form>
          </div>
        </Modal>
        <Modal
          title='添加点位映射'
          open={mappingVisible.value}
          width={900}
          onCancel={closeMappingModal}
          onOk={() => void submitMappings()}
          confirmLoading={mappingSubmitting.value}
        >
          <div class='cable-management-mapping-modal'>
            <div class='cable-management-mapping-left'>
              <div class='cable-management-mapping-toolbar'>
                <Input
                  value={availableFilters.keyword}
                  placeholder='搜索设备编号/名称'
                  onUpdate:value={(value: string) => {
                    availableFilters.keyword = value
                  }}
                  onPressEnter={() => {
                    availableFilters.pageNumber = 1
                    void loadAvailableDevices()
                  }}
                />
                <Button
                  type='primary'
                  onClick={() => {
                    availableFilters.pageNumber = 1
                    void loadAvailableDevices()
                  }}
                >
                  查询
                </Button>
              </div>
              <div class='cable-management-mapping-only-unmapped'>
                <Checkbox
                  checked={availableFilters.onlyUnmapped}
                  onChange={(event: { target?: { checked?: boolean } }) => {
                    availableFilters.onlyUnmapped = Boolean(event.target?.checked)
                    availableFilters.pageNumber = 1
                    void loadAvailableDevices()
                  }}
                >
                  仅显示未映射设备
                </Checkbox>
              </div>
              <div class='cable-management-device-list'>
                {availableLoading.value
                  ? (
                      <div class='cable-management-empty'>加载中...</div>
                    )
                  : availableDevices.value.length === 0
                    ? (
                        <div class='cable-management-empty'>暂无设备</div>
                      )
                    : (
                        availableDevices.value.map((device) => {
                          const checked = selectedDeviceMap[device.deviceId] != null
                          const disabled = device.mapped && !checked
                          return (
                            <label key={device.deviceId} class={['cable-management-device-item', disabled ? 'is-disabled' : '']}>
                              <Checkbox
                                checked={checked}
                                disabled={disabled}
                                onChange={(event: { target?: { checked?: boolean } }) => {
                                  handleToggleDevice(device, Boolean(event.target?.checked))
                                }}
                              />
                              <span class='device-code'>{device.deviceCode || device.deviceId}</span>
                              <span class='device-name'>{device.deviceName || '--'}</span>
                            </label>
                          )
                        })
                      )}
              </div>
              <div class='cable-management-device-page'>
                <Page
                  current={availableFilters.pageNumber}
                  pageSize={availableFilters.pageSize}
                  total={availableTotal.value}
                  onPageChange={(pageNumber: number, pageSize: number) => {
                    availableFilters.pageNumber = pageNumber || 1
                    availableFilters.pageSize = pageSize
                    void loadAvailableDevices()
                  }}
                />
              </div>
            </div>
            <div class='cable-management-mapping-right'>
              <div class='cable-management-mapping-right-title'>
                已选设备（{selectedDevices.value.length}）- 拖拽调整顺序
              </div>
              <div class='cable-management-selected-list'>
                {selectedDevices.value.length === 0
                  ? (
                      <div class='cable-management-empty'>请从左侧选择设备</div>
                    )
                  : (
                      selectedDevices.value.map((device, index) => (
                        <div
                          key={device.deviceId}
                          class='cable-management-selected-item'
                          draggable
                          onDragstart={() => {
                            handleDragStart(device.deviceId)
                          }}
                          onDragover={(event: DragEvent) => {
                            event.preventDefault()
                          }}
                          onDrop={() => {
                            handleDropTo(device.deviceId)
                          }}
                        >
                          <span class='device-order'>{index + 1}</span>
                          <span class='device-code'>{device.deviceCode || device.deviceId}</span>
                          <span class='point-text'>→ {unmappedPointNos.value[index] ?? '-'} 号点</span>
                          <Button type='link' size='small' onClick={() => handleRemoveSelectedDevice(device.deviceId)}>
                            移除
                          </Button>
                        </div>
                      ))
                    )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  },
})
