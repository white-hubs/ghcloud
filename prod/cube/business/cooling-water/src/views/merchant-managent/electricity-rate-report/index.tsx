import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, InputNumber, Table, Button, DateRangePicker, Cascader, TableSummaryRow, TableSummaryCell } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { getDeptList } from '@/api'
import { exportElectricityList, getElectricityList } from '@/api/merchant-managent'
import { GPagination } from '@/components/common/pagination'
import { columnsElectricity } from './index-config'
import { downloadFileByBlob } from '@/utils/common'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
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
export const ElectricityRateReport = defineComponent({
  setup: () => {
    const state = reactive<{ dataSource: object[];formState: {
      departmentId: string[];
      dateValue: string[];
    };
    loading: boolean;
    searchParams: {
      timeFlag: string;
      pageNumber: number;
      pageSize: number;
      gearPositionCode: string;
      shiftMaster: string;
      deviceCode: string;
      code: string;
      total?: number;
      duration: {
        startDuration: string;
        endDuration: string;
      };
      flowParam: {
        startFlow: string;
        endFlow: string;
      };
    };
    deptOption: DeptOptionState[];
    pageTotal: Record<string, number>;
    total: Record<string, string | number>; }>({
      dataSource: [],
      loading: false,
      searchParams: {
        timeFlag: dayjs().format('YYYY'),
        pageNumber: 1,
        pageSize: 10,
        gearPositionCode: '',
        shiftMaster: '',
        deviceCode: '',
        code: '',
        total: 0,
        duration: {
          startDuration: '',
          endDuration: '',
        },
        flowParam: {
          startFlow: '',
          endFlow: '',
        }
      },
      pageTotal: {
        duration: 0,
        total: 0,
        flow: 0
      },
      deptOption: [],
      total: {
        duration: 0,
        total: 0
      },
      formState: {
        departmentId: [],
        dateValue: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      }
    })
    const getDeptOption = async (): Promise<void> => {
      const { data } = await getDeptList()
      state.deptOption = data
    }
    onMounted(() => {
      getList()
      getDeptOption()
    })
    const getList = async (): Promise<void> => {
      try {
        const params = { startTime: state.formState.dateValue[0], endTime: state.formState.dateValue[1], ...state.searchParams, departmentId: state.formState.departmentId ? state.formState.departmentId.join(',') : '' }
        state.loading = true
        const { data } = await getElectricityList(params)
        state.dataSource = data.pageList.records
        state.searchParams.total = data.pageList.total
        state.total = data.total
        const records = data.pageList.records as { duration: number; flow: number;total: number; }[]
        state.pageTotal = handlePageTotal(records)
      } catch {
      } finally {
        state.loading = false
      }
    }
    const handlePageTotal = (records: { duration: number; flow: number;total: number; }[]): { duration: number; flow: number;total: number; } => {
      return records.reduce((previousValue, currentValue) => {
        previousValue.duration = BigNumber.sum(previousValue.duration, currentValue.duration).toNumber()
        previousValue.flow = BigNumber.sum(previousValue.flow, currentValue.flow).toNumber()
        previousValue.total = BigNumber.sum(previousValue.total, currentValue.total).toNumber()
        return previousValue
      }, { duration: 0, flow: 0, total: 0 })
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }

    const handleExport = async (): Promise<void> => {
      const params = { startTime: state.formState.dateValue[0], endTime: state.formState.dateValue[1], ...state.searchParams, departmentId: state.formState.departmentId ? state.formState.departmentId.join(',') : '' }
      const res = await exportElectricityList(params) as BlobPart
      downloadFileByBlob(res, '报表明细')
    }
    const handleReset = (): void => {
      const initSearchParams = {
        timeFlag: dayjs().format('YYYY'),
        pageNumber: 1,
        pageSize: 10,
        gearPositionCode: '',
        shiftMaster: '',
        deviceCode: '',
        code: '',
        duration: {
          startDuration: '',
          endDuration: '',
        },
        flowParam: {
          startFlow: '',
          endFlow: '',
        }
      }
      state.searchParams = initSearchParams
      state.formState.departmentId = []
    }
    const handleChangePicker = (value: string[]): void => {
      state.formState.dateValue = value
    }
    const tableSlot = {
      summary: (): JSX.Element => {
        return (
          <TableSummaryRow>
            <TableSummaryCell>总计</TableSummaryCell>
            {columnsElectricity.filter((item, index) => index !== 0).map((item, i) => {
              return (
                <TableSummaryCell key={i}>
                  {state.pageTotal[item.dataIndex] ? state.pageTotal[item.dataIndex] : ''}
                </TableSummaryCell>
              )
            })}

          </TableSummaryRow>
        )
      }
    }
    const scrollY = ref(500)
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 280
      }
    }
    onMounted(() => {
      getscrollY()
      window.addEventListener('resize', () => {
        getscrollY()
      })
    })
    const layoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <div class={styles['content-search']}>
            <Form layout='inline'>
              <FormItem style={{ width: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <DateRangePicker v-model:value={state.formState.dateValue} onChangePicker={handleChangePicker} picker='date' valueFormat='YYYY-MM-DD' />
                </div>
              </FormItem>
              <FormItem style={{ width: '200px' }}>
                <Cascader options={state.deptOption} v-model:value={state.formState.departmentId} placeholder='请选择部门' fieldNames={{ label: 'name', value: 'id' }} />
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
              <FormItem label='使用时长'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <InputNumber v-model:value={state.searchParams.duration.startDuration} precision={2} style={{ width: '80px' }} />
                  <span>至</span>
                  <InputNumber v-model:value={state.searchParams.duration.endDuration} precision={2} style={{ width: '80px' }} />
                </div>
              </FormItem>
              <FormItem label='冷媒累计使用量'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <InputNumber v-model:value={state.searchParams.flowParam.startFlow} precision={2} style={{ width: '80px' }} />
                  <span>至</span>
                  <InputNumber v-model:value={state.searchParams.flowParam.endFlow} precision={2} style={{ width: '80px' }} />
                </div>
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={handleReset}>重置</Button>
                  <Button type='primary' onClick={handleExport}>导出</Button>
                </div>
              </FormItem>
            </Form>
          </div>

        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <div class={styles['content-table']}>
              <Table
                v-slots={tableSlot}
                rowKey='code'
                dataSource={state.dataSource}
                columns={columnsElectricity}
                loading={state.loading}
                pagination={false}
                scrollX={1000}
                scrollY={scrollY.value}
                size='small'
              />
            </div>

          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class={styles['footer-page']}>
            <div>总计：累计使用时长{state.total.duration ?? 0}小时，累计费用{state.total.total}元</div>
            <GPagination
              current={state.searchParams.pageNumber}
              pageSize={state.searchParams.pageSize}
              total={state.searchParams.total ?? 0}
              onChange={changePage}
            />
          </div>
        )
      }
    }

    return (): JSX.Element => (
      <>
        <GLayout title='电费报表' v-slots={layoutSlots}>
        </GLayout>
      </>
    )
  }
})
