import { defineComponent, onMounted, reactive } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Table, Button, type PickerMode, Cascader } from '@ghcloud/cube-ui'
import type { RecordState } from './merchant-details.i'
import { GPagination } from '@/components/common/pagination'
import { getDeptList } from '@/api'
import { exportWholesalerDetail, getWholesalerPage } from '@/api/merchant-managent'
import './index.module.less'
import moment from 'moment'
import { downloadFileByBlob } from '@/utils/common'
type Key = string | number
interface DeptOptionState {
  enabled: boolean;
  id: string;
  level: number;
  members: null | string;
  name: string;
  parentId: null | string;
  remark: string;
  sequence: string;
  children: DeptOptionState[];
}
export const MerchantDetails = defineComponent({
  setup: () => {
    const state = reactive<{
      dataSource: RecordState[];
      formState: {
        dateType: PickerMode;
        departmentIds: string[] | null;
      };
      loading: boolean;
      exportLoading: boolean;
      deptOption: DeptOptionState[];
      searchParams: {
        gearPositionCode: string;
        pageNumber: number;
        pageSize: number;
        shiftMaster: string;
        code: string;
        deviceCode: string;
        operator: string;
        total?: number;
      };
      selectedRowKeys: Key[]; }>({
      dataSource: [],
      selectedRowKeys: [],
      deptOption: [],
      loading: false,
      searchParams: {
        gearPositionCode: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        shiftMaster: '',
        code: '',
        deviceCode: '',
        operator: ''
      },
      exportLoading: false,
      formState: {
        dateType: 'year',
        departmentIds: null
      }
    })
    const columns = [
      {
        title: '档主编号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '档主姓名',
        dataIndex: 'shiftMaster',
        key: 'shiftMaster',
      },
      {
        title: '联系电话',
        dataIndex: 'shiftMasterPhone',
        key: 'shiftMasterPhone',
      },
      {
        title: '档位号',
        dataIndex: 'gearPositionCode',
        key: 'gearPositionCode',
      },
      {
        title: '档位区域',
        dataIndex: 'gearPositionArea',
        key: 'gearPositionArea',
      },
      {
        title: '管理部门',
        dataIndex: 'department',
        key: 'department',
      },
      {
        title: '汰泡编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
      },
      {
        title: '冷媒单位流量（m³/h）',
        dataIndex: 'unitTraffic',
        key: 'unitTraffic',
      },
      {
        title: '操作员',
        dataIndex: 'updateBy',
        key: 'updateBy',
      },
      {
        title: '登记日期',
        dataIndex: 'createTime',
        key: 'createTime',
        customRender: ({ text }: { text: number; }): string => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
      },
      {
        title: '修改日期',
        dataIndex: 'updateTime',
        key: 'updateTime',
        customRender: ({ text }: { text: number; }): string => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
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
              >查看详情
              </Button>
            </>
          )
        }

      },
    ]
    // const getSelectOption = async (): Promise<void> => {
    //   const { data } = await getAreaOption()
    //   state.selectOption = data
    // }
    const handleView = (record: RecordState): void => {
      history.pushState({}, '', `/portal/cooling-water/merchant-details/${record.wholesalerId}`)
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
          departmentId: state.formState.departmentIds ? state.formState.departmentIds?.join(',') : null
        }
        const { data } = await getWholesalerPage(params)
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
    const getDeptOption = async (): Promise<void> => {
      const { data } = await getDeptList()
      state.deptOption = data
    }
    const handleReset = (): void => {
      state.searchParams.gearPositionCode = ''
      state.searchParams.shiftMaster = ''
      state.searchParams.code = ''
      state.searchParams.deviceCode = ''
      state.searchParams.operator = ''
      state.formState.departmentIds = null
      getList()
    }
    const handleExport = async (): Promise<void> => {
      state.exportLoading = true
      const { gearPositionCode, shiftMaster, code, deviceCode, operator } = state.searchParams
      const { departmentIds } = state.formState
      const params = {
        gearPositionCode,
        shiftMaster,
        code,
        deviceCode,
        operator,
        departmentId: departmentIds ? departmentIds.join(',') : null
      }
      try {
        const res = await exportWholesalerDetail(params) as BlobPart
        downloadFileByBlob(res, '商户明细')
      } catch {
      } finally {
        state.exportLoading = false
      }
    }
    onMounted(() => {
      getDeptOption()
      getList()
    })
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (<Button type='primary' loading={state.exportLoading} onClick={handleExport}>导出</Button>)
      },
      'content-search': (): JSX.Element => {
        return (
          <div class='content-search'>
            <Form layout='inline'>
              <FormItem style={{ width: '200px' }}>
                <Cascader options={state.deptOption} placeholder='管理部门' fieldNames={{ label: 'name', value: 'id' }} v-model:value={state.formState.departmentIds} />
              </FormItem>
              <FormItem>
                <Input placeholder='档位号' v-model:value={state.searchParams.gearPositionCode} />
              </FormItem>
              <FormItem>
                <Input placeholder='档主姓名' v-model:value={state.searchParams.shiftMaster} />
              </FormItem>
              <FormItem>
                <Input placeholder='档主编号' v-model:value={state.searchParams.code} />
              </FormItem>
              <FormItem>
                <Input placeholder='汰泡编号' v-model:value={state.searchParams.deviceCode} />
              </FormItem>
              <FormItem>
                <Input placeholder='操作员' v-model:value={state.searchParams.operator} />
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={handleReset}>重置</Button>
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
              dataSource={state.dataSource}
              columns={columns}
              pagination={false}
              size='small'
              loading={state.loading}
              scrollY={500}
            />
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
      <> <GLayout title='设备配置' v-slots={layoutSlots} /></>
    )
  }
})
