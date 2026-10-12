import { defineComponent, onMounted, reactive } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Table, Button, type PickerMode, Cascader } from '@ghcloud/cube-ui'
import type { RecordState } from './device-monitor.i'
import { GPagination } from '@/components/common/pagination'
import { getDeviceMonitorList, getAreaOption } from '@/api/device-center'
import { GisMap } from './component/gis-map'
import './device-monitor.less'

type Key = string | number
interface SelectOptionState {
  id: string;
  code: string;
  parentId: null | string;
  children: SelectOptionState[];
}
export const DeviceMonitor = defineComponent({
  setup: () => {
    const state = reactive<{
      dataSource: RecordState[];
      formState: {
        dateType: PickerMode;
      };
      loading: boolean;
      selectOption: SelectOptionState[];
      activeTab: string;
      searchParams: {
        keyword: string;
        pageNumber: number;
        pageSize: number;
        areaIds: string[] | null;
        total?: number;
      };
      selectedRowKeys: Key[]; }>({
      dataSource: [],
      selectedRowKeys: [],
      selectOption: [],
      loading: false,
      activeTab: 'list',
      searchParams: {
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        areaIds: null
      },
      formState: {
        dateType: 'year'
      }
    })
    const columns = [
      {
        title: '钛泡编号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
      },
      {
        title: '产品分类',
        dataIndex: 'deviceProdCategoryName',
        key: 'deviceProdCategoryName',
      },
      {
        title: '设备当前状态',
        dataIndex: 'deviceStatus',
        key: 'deviceStatus',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <span style={{ color: text ? 'rgb(0, 186, 139)' : '' }}>{text ? '在线' : '离线'}</span>
        }
      },
      {
        title: '制冷电磁阀',
        dataIndex: 'solenoidValve',
        key: 'solenoidValve',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <span style={{ color: text === '开' ? 'rgb(0, 186, 139)' : '' }}>{text}</span>
        }
      },
      {
        title: '档位编号',
        dataIndex: 'gearPositionCode',
        key: 'gearPositionCode',
      },
      {
        title: '所属区域',
        dataIndex: 'area',
        key: 'area',
      },
      {
        title: '操作',
        dataIndex: 'atcion',
        key: 'atcion',
        width: 300,
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleView(record)
                }}
              >查看
              </Button>
            </>
          )
        }

      },
    ]
    const getSelectOption = async (): Promise<void> => {
      const { data } = await getAreaOption()
      state.selectOption = data
    }
    const handleView = (record: RecordState): void => {
      if (record.mapCode === 'chilled-water-timer') {
        history.pushState({}, '', `/portal/cooling-water/device-monitor/${record.deviceId}`)
      } else {
        history.pushState({}, '', `/portal/genericEquipmentMonitor/equipmentMoitorDetail?type=detail&deviceId=${record.deviceId}`)
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          areaIds: state.searchParams.areaIds ? state.searchParams.areaIds?.join('-') : null
        }
        const { data } = await getDeviceMonitorList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const handleSearch = (): void => {
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.keyword = ''
      state.searchParams.areaIds = []
      getList()
    }
    onMounted(() => {
      getSelectOption()
      getList()
    })
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <div class='top-tabs'>
            <div
              class={['tab-item', state.activeTab === 'list' && 'active']} onClick={() => {
                state.activeTab = 'list'
              }}
            >列表
            </div>
            <div
              class={['tab-item', state.activeTab === 'gis' && 'active']} onClick={() => {
                state.activeTab = 'gis'
              }}
            >gis地图
            </div>
          </div>
        )
      },
      'content-search': (): JSX.Element => {
        return (
          <>
            {state.activeTab === 'list' &&
              <div class='content-search'>
                <Form layout='inline'>
                  <FormItem>
                    <Input placeholder='设备ID/设备名称' v-model:value={state.searchParams.keyword} />
                  </FormItem>
                  <FormItem style={{ width: '200px' }}>
                    <Cascader options={state.selectOption} placeholder='所属区域' fieldNames={{ label: 'name', value: 'id' }} v-model:value={state.searchParams.areaIds} />
                  </FormItem>
                  <FormItem>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Button type='primary' onClick={handleSearch}>查询</Button>
                      <Button onClick={handleReset}>重置</Button>
                    </div>
                  </FormItem>
                </Form>
              </div>}
          </>

        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            {state.activeTab === 'list' && <Table
              dataSource={state.dataSource}
              columns={columns}
              pagination={false}
              size='small'
              loading={state.loading}
              scrollY={500}
            />}
            {
              state.activeTab === 'gis' && <GisMap />
            }

          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            {state.activeTab === 'list' && <GPagination
              current={state.searchParams.pageNumber}
              pageSize={state.searchParams.pageSize}
              total={state.searchParams.total ?? 0}
              onChange={changePage}
            />}
          </>

        )
      }
    }

    return (): JSX.Element => (
      <> <GLayout title='设备监测' v-slots={layoutSlots} showSearch={state.activeTab === 'list'} /></>
    )
  }
})
