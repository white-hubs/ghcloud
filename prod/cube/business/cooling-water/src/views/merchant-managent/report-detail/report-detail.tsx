import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, message, DatePicker, RadioGroup, Input, InputNumber, Table, Button, DateRangePicker, TableSummaryRow, TableSummaryCell, type PickerMode, Cascader, Upload, type UploadRequestOption, type FileType } from '@ghcloud/cube-ui'
import styles from './report-detail.module.less'
import { getDeptList } from '@/api'
import { getReportDetailByYear, addYearMonthReport, downloadTemplate, editYearMonthReport, getReportDetailByMonth, exportReportDetailByDay, exportReportDetailByMonth, getReportDetailByDay, exportReportDetailByYear } from '@/api/merchant-managent'
import { GPagination } from '@/components/common/pagination'
import { columnsForYear, columnsForDay, columnsForMonth } from './report-detail-config'
import { downloadFileByBlob } from '@/utils/common'
import { appFunctionCodes } from '@/permission'
import { hasPermission } from '@ghcloud/cube-permission-codes'

import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
const dateFormat = 'YYYY-MM-DD'
const monthFormat = 'YYYY-MM'
const permission = appFunctionCodes.coolingWaterReportDetail


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
export const ReportDetail = defineComponent({
  setup: () => {
    const state = reactive<{ dataSource: object[];formState: {
      dateType: PickerMode;
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
    total: Record<string, string | number>;
    addLoading: boolean;
    editLoading: boolean;
    pageTotal: Record<string, number>;
    downloadLoading: boolean;
    }>({
      dataSource: [],
      loading: false,
      downloadLoading: false,
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
      deptOption: [],
      total: {
        duration: 0,
        total: 0
      },
      pageTotal: {
        duration: 0,
        total: 0,
        flow: 0
      },
      formState: {
        dateType: 'year',
        departmentId: [],
        dateValue: []
      },
      addLoading: false,
      editLoading: false
    })
    const getDeptOption = async (): Promise<void> => {
      const { data } = await getDeptList()
      state.deptOption = data
    }
    onMounted(() => {
      getDeptOption()
    })
    const rangePickerFormat = computed(() => {
      const pickerFormatMap = new Map([['month', monthFormat], ['date', dateFormat]])
      return pickerFormatMap.get(state.formState.dateType) ?? monthFormat
    })
    const columns = computed(() => {
      const columnsMap = new Map([['year', columnsForYear], ['month', columnsForMonth], ['date', columnsForDay]])
      return columnsMap.get(state.formState.dateType) ?? []
    })
    const params = computed(() => {
      const paramsForObj: Record<PickerMode, unknown> = {
        year: { ...state.searchParams, departmentId: state.formState.departmentId ? state.formState.departmentId.join(',') : '' },
        month: { startTime: state.formState.dateValue[0], endTime: state.formState.dateValue[1], ...state.searchParams, departmentId: state.formState.departmentId ? state.formState.departmentId.join(',') : '' },
        date: { startTime: state.formState.dateValue[0], endTime: state.formState.dateValue[1], ...state.searchParams, departmentId: state.formState.departmentId ? state.formState.departmentId.join(',') : '' },
        time: {},
        week: {},
        quarter: {}
      }
      return paramsForObj[state.formState.dateType] ?? { ...state.searchParams, departmentId: state.formState.departmentId ? state.formState.departmentId.join(',') : '' }
    })
    const getListByYear = async (): Promise<void> => {
      const { data } = await getReportDetailByYear(params.value)
      state.dataSource = data.pageList.records
      state.searchParams.total = data.pageList.total
      state.total = data.total
    }
    const getListByMonth = async (): Promise<void> => {
      const { data } = await getReportDetailByMonth(params.value)
      state.dataSource = data.pageList.records
      state.searchParams.total = data.pageList.total
      state.total = data.total
      const records = data.pageList.records as { duration: number; flow: number;total: number; }[]
      state.pageTotal = handlePageTotal(records)
    }
    const handlePageTotal = (records: { duration: number; flow: number;total: number; }[]): { duration: number; flow: number;total: number; } => {
      return records.reduce((previousValue, currentValue) => {
        previousValue.duration = BigNumber.sum(previousValue.duration, currentValue.duration).toNumber()
        previousValue.flow = BigNumber.sum(previousValue.flow, currentValue.flow).toNumber()
        previousValue.total = BigNumber.sum(previousValue.total, currentValue.total).toNumber()
        return previousValue
      }, { duration: 0, flow: 0, total: 0 })
    }
    const getListByDay = async (): Promise<void> => {
      const { data } = await getReportDetailByDay(params.value)
      state.dataSource = data.pageList.records
      state.searchParams.total = data.pageList.total
      state.total = data.total
      const records = data.pageList.records as { duration: number; flow: number;total: number; }[]
      state.pageTotal = handlePageTotal(records)
    }
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const getListFunMap = new Map([['year', getListByYear], ['month', getListByMonth], ['date', getListByDay]])
        if (!getListFunMap.has(state.formState.dateType)) return
        const fn = getListFunMap.get(state.formState.dateType)
        if (fn) {
          await fn()
        }
      } catch {
      } finally {
        state.loading = false
      }
    }
    watch(() => state.formState.dateType, () => {
      const rangeValueMap = new Map([['month', [dayjs(new Date()).format(monthFormat), dayjs(new Date()).format(monthFormat)]], ['date', [dayjs(new Date()).format(dateFormat), dayjs(new Date()).format(dateFormat)]]])
      state.formState.dateValue = rangeValueMap.get(state.formState.dateType) ?? [dayjs(new Date()).format(monthFormat), dayjs(new Date()).format(monthFormat)]
      getList()
    }, { immediate: true })
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
      const exportFunMap = new Map([['year', exportReportDetailByYear], ['month', exportReportDetailByMonth], ['date', exportReportDetailByDay]])
      if (!exportFunMap.has(state.formState.dateType)) return
      const fn = exportFunMap.get(state.formState.dateType)
      if (!fn) return
      const res = await fn(params.value) as BlobPart
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
      state.formState.dateType = 'year'
    }
    const timeOptions = [
      { label: '年', value: 'year' },
      { label: '月', value: 'month' },
      { label: '日', value: 'date' }
    ]
    const handleChangePicker = (value: string[]): void => {
      state.formState.dateValue = value
    }
    const tableSlot = {
      summary: (): JSX.Element => {
        return (
          <TableSummaryRow>
            <TableSummaryCell>总计</TableSummaryCell>
            {columns.value.filter((item, index) => index !== 0).map((items, i) => {
              return (
                <TableSummaryCell key={i}>
                  {state.pageTotal[items.dataIndex] ? (state.pageTotal[items.dataIndex]) : ''}
                </TableSummaryCell>
              )
            })}

          </TableSummaryRow>
        )
      }
    }
    const handleAddUpload = async (file: UploadRequestOption): Promise< void> => {
      state.addLoading = true
      try {
        const formData = new FormData()
        formData.append('file', file.file)
        await addYearMonthReport(formData)
        message.success('新增成功')
        getList()
      } finally {
        state.addLoading = false
      }
    }
    const handleEditUpload = async (file: UploadRequestOption): Promise< void> => {
      state.editLoading = true
      try {
        const formData = new FormData()
        formData.append('file', file.file)
        await editYearMonthReport(formData)
        message.success('编辑成功')
        getList()
      } finally {
        state.editLoading = false
      }
    }
    const handleBeforeUpload = (file: FileType): boolean => {
      if (!file.name.endsWith('.xlsx')) {
        message.error('请上传指定格式的文件')
        return false
      }
      return true
    }
    const handleDownloadTemplate = async (): Promise<void> => {
      state.downloadLoading = true
      try {
        const res = await downloadTemplate() as BlobPart
        downloadFileByBlob(res, '报表模板')
      } finally {
        state.downloadLoading = false
      }
    }
    const scrollY = ref(500)
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 300
      }
    }
    onMounted(() => {
      getscrollY()
      window.addEventListener('resize', () => {
        getscrollY()
      })
    })
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {
              hasPermission(permission.download) && <Button loading={state.downloadLoading} type='primary' onClick={handleDownloadTemplate}>下载模板</Button>
            }
            {hasPermission(permission.add) &&
              <Upload disabled={state.addLoading} fileList={[]} accept='.xlsx,.xls' before-upload={handleBeforeUpload} customRequest={handleAddUpload}>
                <Button loading={state.addLoading} type='primary'>新增</Button>
              </Upload>}
            {
              hasPermission(permission.add) &&
                <Upload disabled={state.editLoading} fileList={[]} accept='.xlsx,.xls' before-upload={handleBeforeUpload} customRequest={handleEditUpload}>
                  <Button loading={state.editLoading} type='primary'>修改</Button>
                </Upload>
            }

          </div>
        )
      },
      'content-search': (): JSX.Element => {
        return (
          <div class={styles['content-search']}>
            <Form layout='inline'>
              <FormItem style={{ width: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RadioGroup v-model:value={state.formState.dateType} options={timeOptions} style={{ flexShrink: 0 }} />
                  {state.formState.dateType === 'year' && <DatePicker v-model:value={state.searchParams.timeFlag} valueFormat='YYYY' picker={state.formState.dateType} placeholder='请选择' />}
                  {['month', 'date'].includes(state.formState.dateType) && <DateRangePicker v-model:value={state.formState.dateValue} onChangePicker={handleChangePicker} picker={state.formState.dateType} valueFormat={rangePickerFormat.value} />}
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
              {
                state.formState.dateType !== 'year' &&
                  <>
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
                  </>

              }

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
            <Table
              v-slots={state.formState.dateType !== 'year' ? tableSlot : {}}
              dataSource={state.dataSource}
              columns={columns.value}
              loading={state.loading}
              pagination={false}
              scrollY={scrollY.value}
              size='small'
            />
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
        <GLayout title='报表明细' v-slots={layoutSlots}>
        </GLayout>
      </>
    )
  }
})
