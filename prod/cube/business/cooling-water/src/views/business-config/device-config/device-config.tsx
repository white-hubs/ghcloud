import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Table, Button, type PickerMode, PopConfirm, message, InputNumber } from '@ghcloud/cube-ui'
import type { RecordState } from './device-config.i'
import { GPagination } from '@/components/common/pagination'
import { RelateModal } from './relate-modal'
import { getDeviceConfigList, deviceRelateGear, cancelDeviceRelate } from '@/api/business-config'
type Key = string
interface ModalFormState {
  gearPositionId: string;
  unitPrice: string;
  emplaceTemperature: string;
  unitTraffic: string;
}
export const DeviceConfig = defineComponent({
  setup: () => {
    const relateRef = ref<{ handleCancel: () => void;closeLoading: () => void; }>()
    const state = reactive<{
      dataSource: RecordState[];
      formState: {
        dateType: PickerMode;
      };
      loading: boolean;
      searchParams: {
        keyword: string;
        pageNumber: number;
        pageSize: number;
        total?: number;
      };
      selectedRowKeys: Key[];
      visible: boolean;
      actionId: string;
    }>({
      dataSource: [],
      selectedRowKeys: [],
      visible: false,
      loading: false,
      actionId: '',
      searchParams: {
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      formState: {
        dateType: 'year'
      }
    })
    const columns = [
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
      },
      {
        title: '是否关联档位',
        dataIndex: 'gearPositionCode',
        key: 'gearPositionCode',
        customRender: ({ record }: { record: RecordState; }): string => {
          return record.gearPositionCode ? '是' : '否'
        }
      },
      {
        title: '档位号',
        dataIndex: 'gearPositionCode',
        key: 'gearPositionCode',
      },
      {
        title: '所属区域',
        dataIndex: 'gearPositionArea',
        key: 'gearPositionArea',
      },
      {
        title: '单价',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <div>
              {!record.isEdit && <>{record.unitPrice}</>}
              {record.isEdit && <><InputNumber precision={2} v-model:value={record.unitPrice} /></>}
            </div>
          )
        }
      },
      {
        title: '钛泡低温保护设置（℃）',
        dataIndex: 'emplaceTemperature',
        key: 'emplaceTemperature',
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <div>
              {!record.isEdit && <>{record.emplaceTemperature}</>}
              {record.isEdit && <><InputNumber precision={2} v-model:value={record.emplaceTemperature} min={-99} max={99} /></>}
            </div>
          )
        }
      },
      {
        title: '冷媒单位流量（m³/h)',
        dataIndex: 'unitTraffic',
        key: 'unitTraffic',
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <div>
              {!record.isEdit && <>{record.unitTraffic}</>}
              {record.isEdit && <><InputNumber precision={2} v-model:value={record.unitTraffic} /></>}
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'atcion',
        key: 'atcion',
        width: 180,
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <>
              {
                !record.gearPositionCode &&
                <Button
                  type='link'
                  onClick={() => {
                    handleRelate(record)
                  }}
                >关联
                </Button>
              }

              {!record.isEdit && record.gearPositionCode &&
                <Button
                  type='link'
                  onClick={() => {
                    handleEditRow(record)
                  }}
                >编辑
                </Button>}
              {record.isEdit && record.gearPositionCode &&
                <>
                  <Button
                    type='link'
                    onClick={() => {
                      handleSaveRow(record)
                    }}
                  >保存
                  </Button>
                  <Button
                    type='link'
                    onClick={() => {
                      handleCancelRow(record)
                    }}
                  >取消
                  </Button>
                </>}
              {record.gearPositionCode &&
                <PopConfirm
                  title='是否取消关联?'
                  ok-text='确定'
                  cancel-text='取消'
                  onConfirm={async () => handleCancelRelate(record)}
                >
                  <Button type='text' danger>取消关联</Button>
                </PopConfirm>}

            </>
          )
        }

      },
    ]
    onMounted(() => {
      getList()
    })

    const handleCancelRelate = async (record: RecordState): Promise<void> => {
      await cancelDeviceRelate({ gearPositionId: record.gearPositionId, deviceId: record.deviceId })
      message.success('操作成功')
      getList()
    }
    const checkboxProps = (record: RecordState): Record<string, boolean> => {
      return {
        disabled: !!record.gearPositionCode
      }
    }
    const handleRelate = (record: RecordState): void => {
      state.visible = true
      state.actionId = record.deviceId
    }
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getDeviceConfigList(state.searchParams)
        const list = data.records as RecordState[]
        state.dataSource = list.map(item => {
          return {
            ...item,
            isEdit: false
          }
        })
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const handleEditRow = (record: RecordState): void => {
      record.isEdit = !record.isEdit
    }
    const handleCancelRow = (record: RecordState): void => {
      record.isEdit = !record.isEdit
      getList()
    }
    const handleSaveRow = async (record: RecordState): Promise<void> => {
      try {
        state.loading = true
        const params = {
          coldWaterDevice: record.deviceId,
          unitPrice: record.unitPrice,
          emplaceTemperature: record.emplaceTemperature,
          unitTraffic: record.unitTraffic,
          gearPositionId: record.gearPositionId
        }
        await deviceRelateGear([params])
        message.success('操作成功')
        getList()
      } catch {
      } finally {
        state.loading = false
      }
    }
    const onSelectChange = (val: Key[]): void => {
      state.selectedRowKeys = val
    }
    const handleModalOk = async (val: ModalFormState): Promise<void> => {
      let params: {
        coldWaterDevice: string;
        unitPrice: string;
        emplaceTemperature: string;
        unitTraffic: string;
        gearPositionId: string;
      }[] = []
      try {
        if (state.actionId) {
          params = [{ ...val, coldWaterDevice: state.actionId }]
        } else {
          params = state.selectedRowKeys.map(item => {
            return {
              ...val,
              coldWaterDevice: item
            }
          })
        }
        await deviceRelateGear(params)
        message.success('关联成功')
        getList()
        state.actionId = ''
        state.selectedRowKeys = []
        relateRef.value?.handleCancel()
      } catch {
      } finally {
        relateRef.value?.closeLoading()
      }
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams = {
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      }
      getList()
    }
    const handleMultiple = (): void => {
      if (!state.selectedRowKeys.length) {
        message.error('请选择需要设置的设备')
        return
      }
      state.actionId = ''
      state.visible = true
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const layoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <div class='content-search'>
            <Form layout='inline'>
              <FormItem>
                <Input placeholder='档位名称' v-model:value={state.searchParams.keyword} />
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={handleReset}>重置</Button>
                  <Button type='primary' onClick={handleMultiple}>批量设置</Button>
                </div>
              </FormItem>
            </Form>
          </div>

        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <Table
              size='small'
              dataSource={state.dataSource}
              columns={columns}
              pagination={false}
              scrollY={460}
              loading={state.loading}
              rowKey='deviceId'
              rowSelection={{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange, getCheckboxProps: checkboxProps }}
            />
            <RelateModal ref={relateRef} v-model:visible={state.visible} onOk={handleModalOk} />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return (): JSX.Element => (
      <>
        <GLayout title='设备配置' v-slots={layoutSlots} />
      </>
    )
  }
})
