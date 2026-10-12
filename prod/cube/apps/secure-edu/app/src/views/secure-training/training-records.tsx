import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Page, PopOver, Select, Table, Tag, DateRangePicker } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import ThemeSelectInput from '@/components/business/theme-select-input/theme-select-input'
import { TrainingModeOptions } from '@/types/training-task'
import { useTableScroll } from '@/hook/use-table-scroll'
import { cubeSecureEduHeadQuartersService } from '@/api/server'
import { MarketSelectInput } from '@/components/business/market-select-input/market-select-input'
import { TrainingTaskSelectInput } from '@/components/business/training-task-select-input/training-task-select-input'
import { message } from 'ant-design-vue/es'

export const TrainingRecords = defineComponent({
  setup: () => {
    const formState = reactive({
      cultivateTarget: undefined,
      cultivateTaskId: undefined,
      cultivateMode: undefined,
      themeId: undefined,
      cultivateTaskStatus: undefined,
      taskSource: undefined,
      period: [dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm'), dayjs().endOf('day').format('YYYY-MM-DD HH:mm')],
      keyword: '',
      marketTenant: undefined,
      userSignStatus: undefined
    })
    const exportLoading = ref(false)
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '人员姓名',
        dataIndex: 'name',
        align: 'center',
        width: 150,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属市场',
        dataIndex: 'market',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { market: { marketName: string; }; }; }): JSX.Element => {
          return <PopOver content={record.market.marketName || '--'}>{record.market.marketName || '--'}</PopOver>
        }
      },
      {
        title: '所在部门',
        align: 'center',
        width: 150,
        dataIndex: 'departmentName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '岗位',
        align: 'center',
        width: 150,
        dataIndex: 'postName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '人员打卡时间',
        dataIndex: 'chargeUserName',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { signInfo: { signDate: string; } | null; }; }): JSX.Element => {
          const res = record.signInfo?.signDate ? dayjs(record.signInfo.signDate).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={res || '--'}>{res || '--'}</PopOver>
        }
      },
      {
        title: '学习状态',
        dataIndex: 'speaker',
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ record }: { record: { signInfo: { status: string;belated: boolean; }; }; }): JSX.Element => {
          const res = record.signInfo.status === 'UNSIGNED' ? { text: '缺勤', color: 'red' } : { text: '正常', color: 'green' }
          return <Tag color={res.color}>{res.text}</Tag>
        }
      },
      {
        title: '培训任务',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { cultivateTask: { name: string; }; }; }): JSX.Element => {
          return <PopOver content={record.cultivateTask.name || '--'}>{record.cultivateTask.name || '--'}</PopOver>
        }
      },
      {
        title: '培训主题',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { cultivateTask: { themeName: string; }; }; }): JSX.Element => {
          return <PopOver content={record.cultivateTask.themeName || '--'}>{record.cultivateTask.themeName || '--'}</PopOver>
        }
      },
      {
        title: '培训形式',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { cultivateTask: { cultivateMode: string; }; }; }): JSX.Element => {
          const text = record.cultivateTask.cultivateMode === 'ONLINE' ? '线上培训' : '线下培训'
          return <PopOver content={text}>{text}</PopOver>
        }
      },
      {
        title: '负责人',
        align: 'center',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { cultivateTask: { chargeUserName: string; }; }; }): JSX.Element => {
          return <PopOver content={record.cultivateTask.chargeUserName || '--'}>{record.cultivateTask.chargeUserName || '--'}</PopOver>
        }
      },
      {
        title: '任务开始时间',
        align: 'center',
        width: 200,
        ellipsis: true,
        customRender: ({ record }: { record: { cultivateTask: { startTime: string; }; }; }): JSX.Element => {
          const time = record.cultivateTask.startTime ? dayjs(record.cultivateTask.startTime).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '任务结束时间',
        align: 'center',
        width: 200,
        ellipsis: true,
        customRender: ({ record }: { record: { cultivateTask: { endTime: string; }; }; }): JSX.Element => {
          const time = record.cultivateTask.endTime ? dayjs(record.cultivateTask.endTime).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
    ]
    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const data = await cubeSecureEduHeadQuartersService.geCultivateUserRecordsPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
          period: (formState.period?.length) ? `${formState.period[0]},${formState.period[1]}` : '',
        })
        const { records, total } = data
        dataSource.value = records
        pagination.value.total = total
      } catch (error) {
        message.error((error as { toJSON: () => { errorMessage: string; }; }).toJSON().errorMessage)
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
      formState.cultivateTarget = undefined
      formState.cultivateMode = undefined
      formState.themeId = undefined
      formState.cultivateTaskStatus = undefined
      formState.taskSource = undefined
      formState.period = []
      formState.keyword = ''
      formState.marketTenant = undefined
      formState.userSignStatus = undefined
      queryForm()
    }

    const { scrollYAxis } = useTableScroll()

    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true
        await cubeSecureEduHeadQuartersService.exportCultivateUserRecords({
          ...formState,
          period: (formState.period?.length) ? `${formState.period[0]},${formState.period[1]}` : '',
        }).then(data => {
          const link = document.createElement('a')
          const blob = new Blob([data as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '培训记录.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }).catch(() => {
          message.warn('未查询到数据，无法导出')
        })
      } catch {
      } finally {
        exportLoading.value = false
      }
    }

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={exportExcel} loading={exportLoading.value}>导出</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='培训形式' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <Select v-model:value={formState.cultivateMode} style={{ width: '140px' }} options={TrainingModeOptions} allowClear />
              </FormItem>
              <FormItem label='培训主题' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <ThemeSelectInput v-model:value={formState.themeId} style={{ width: '140px' }} />
              </FormItem>
              <FormItem label='培训任务' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <TrainingTaskSelectInput v-model:value={formState.cultivateTaskId} style={{ width: '140px' }} themeId={formState.themeId} />
              </FormItem>
              <FormItem label='学习状态' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <Select
                  style={{ width: '140px' }}
                  v-model:value={formState.userSignStatus}
                  allowClear
                  options={[
                    { label: '正常', value: 'SIGNED' },
                    { label: '缺勤', value: 'UNSIGNED' }
                  ]}
                />
              </FormItem>
              <FormItem label='培训日期' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} style={{ width: '140px' }} />
              </FormItem>
              <FormItem label='市场' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <MarketSelectInput v-model:value={formState.marketTenant} style={{ width: '140px' }} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollYAxis.value} scrollX={2000} />
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
        <Layout title='培训记录' v-slots={layoutSlots} />
      </>
  }
})
