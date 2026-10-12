import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Page, PopOver, Select, Table, Tag, DateRangePicker } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import ThemeSelectInput from '@/components/business/theme-select-input/theme-select-input'
import { useTableScroll } from '@/hook/use-table-scroll'
import { cubeSecureEduHeadQuartersService } from '@/api/server'
import { MarketSelectInput } from '@/components/business/market-select-input/market-select-input'
import { TrainingTaskSelectInput } from '@/components/business/training-task-select-input/training-task-select-input'
import { message } from 'ant-design-vue/es'

export const ExamRecords = defineComponent({
  setup: () => {
    const formState = reactive({
      examTaskId: undefined,
      themeId: undefined,
      examTaskType: undefined,
      examStatus: undefined,
      passed: undefined,
      period: [dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm'), dayjs().endOf('day').format('YYYY-MM-DD HH:mm')],
      keyword: '',
      marketTenant: undefined
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
        width: 150,
        align: 'center',
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
        title: '开始考试时间',
        align: 'center',
        width: 200,
        ellipsis: true,
        customRender: ({ record }: { record: { userExamTime: { startTime: string; } | null; }; }): JSX.Element => {
          const res = record.userExamTime && record.userExamTime.startTime ? dayjs(record.userExamTime.startTime).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={res || '--'}>{res || '--'}</PopOver>
        }
      },
      {
        title: '试卷提交考试时间',
        align: 'center',
        width: 200,
        ellipsis: true,
        customRender: ({ record }: { record: { userExamTime: { endTime: string; }; }; }): JSX.Element => {
          const res = record.userExamTime && record.userExamTime.endTime ? dayjs(record.userExamTime.endTime).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={res || '--'}>{res || '--'}</PopOver>
        }
      },
      {
        title: '考试时长',
        align: 'center',
        width: 200,
        ellipsis: true,
        customRender: ({ record }: { record: { userExamTime: { duration: number; }; }; }): JSX.Element => {
          const time = record.userExamTime ? secondsToHoursMinutes(record.userExamTime.duration) : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '考试分数',
        dataIndex: 'speaker',
        align: 'center',
        width: 80,
        ellipsis: true,
        customRender: ({ record }: { record: { userExamPaper: { score: string; }; }; }): JSX.Element => {
          return <PopOver content={record.userExamPaper.score || '--'}>{record.userExamPaper.score || '--'}</PopOver>
        }
      },
      {
        title: '出勤状态',
        width: 100,
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { userExamPaper: { status: string; }; }; }): JSX.Element => {
          const res = record.userExamPaper.status === 'EXAMINED' ? { text: '正常', color: 'green' } : { text: '缺考', color: 'red' }
          return <Tag color={res.color}>{res.text}</Tag>
        }
      },
      {
        title: '考试状态',
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ record }: { record: { userExamPaper: { passed: string; }; }; }): JSX.Element => {
          const res = record.userExamPaper.passed ? { text: '及格', color: 'green' } : { text: '不及格', color: 'red' }
          return <Tag color={res.color}>{res.text}</Tag>
        }
      },
      {
        title: '考试任务',
        width: 150,
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { examTask: { name: string; }; }; }): JSX.Element => {
          return <PopOver content={record.examTask.name || '--'}>{record.examTask.name || '--'}</PopOver>
        }
      },
      {
        title: '考试主题',
        width: 100,
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { examTask: { themeName: string; }; }; }): JSX.Element => {
          return <PopOver content={record.examTask.themeName || '--'}>{record.examTask.themeName || '--'}</PopOver>
        }
      },
      {
        title: '负责人',
        align: 'center',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { examTask: { chargeUserName: string; }; }; }): JSX.Element => {
          return <PopOver content={record.examTask.chargeUserName || '--'}>{record.examTask.chargeUserName || '--'}</PopOver>
        }
      },
      {
        title: '总分',
        align: 'center',
        width: 80,
        ellipsis: true,
        customRender: ({ record }: { record: { examPaper: { score: string; }; }; }): JSX.Element => {
          return <PopOver content={record.examPaper.score}>{record.examPaper.score}</PopOver>
        }
      },
      {
        title: '及格分',
        align: 'center',
        width: 80,
        ellipsis: true,
        customRender: ({ record }: { record: { examPaper: { gradeScore: string; }; }; }): JSX.Element => {
          return <PopOver content={record.examPaper.gradeScore}>{record.examPaper.gradeScore}</PopOver>
        }
      },
      {
        title: '任务开始时间',
        align: 'center',
        ellipsis: true,
        width: 200,
        customRender: ({ record }: { record: { examTime: { startTime: string; }; }; }): JSX.Element => {
          const time = record.examTime.startTime ? dayjs(record.examTime.startTime).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '任务结束时间',
        align: 'center',
        ellipsis: true,
        width: 200,
        customRender: ({ record }: { record: { examTime: { endTime: string; }; }; }): JSX.Element => {
          const time = record.examTime.endTime ? dayjs(record.examTime.endTime).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
    ]
    const secondsToHoursMinutes = (seconds: number): string => {
      // 1、获取小时
      // 秒数 / 60 / 60  ——》小时
      // 只需要获取小时的整数部分——》需要取整——》parseInt()
      let hours = Math.floor(seconds / 60 / 60)
      hours < 1 && (hours = 0)
      // 2、获取分钟
      // 秒数 / 60 ——》分钟
      // 如果还剩70分钟，用户此时看到的应该是：1小时 10分钟 ——》70 % 60
      let minutes = Math.floor(seconds / 60 % 60)
      minutes < 1 && (minutes = 0)
      // 3、获取秒数
      // 如果还剩70秒，用户此时看到的应该是：1分钟 10秒 ——》70 % 60
      const second = Math.floor(seconds % 60)
      return `${hours}小时${minutes}分钟${second}秒`
    }
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
        const data = await cubeSecureEduHeadQuartersService.geExamUserRecordsPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
          period: (formState.period && formState.period.length) ? `${formState.period[0]},${formState.period[1]}` : '',
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
      formState.examTaskId = undefined
      formState.themeId = undefined
      formState.period = []
      formState.keyword = ''
      formState.marketTenant = undefined
      formState.examTaskType = undefined
      formState.passed = undefined
      formState.examStatus = undefined
      queryForm()
    }

    const { scrollYAxis } = useTableScroll()

    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true
        await cubeSecureEduHeadQuartersService.exportExamUserRecords({
          ...formState,
          period: (formState.period && formState.period.length) ? `${formState.period[0]},${formState.period[1]}` : '',
        }).then(data => {
          const link = document.createElement('a')
          const blob = new Blob([data as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '考试记录.xlsx')
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
              <FormItem label='考试主题' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <ThemeSelectInput v-model:value={formState.themeId} style={{ width: '140px' }} />
              </FormItem>
              <FormItem label='考试任务' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <TrainingTaskSelectInput v-model:value={formState.examTaskId} style={{ width: '140px' }} themeId={formState.themeId} />
              </FormItem>
              <FormItem label='出勤状态' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <Select
                  style={{ width: '140px' }}
                  v-model:value={formState.examStatus}
                  allowClear
                  options={[
                    { label: '正常', value: 'EXAMINED' },
                    { label: '缺考', value: 'MISS_EXAM' },
                  ]}
                />
              </FormItem>
              <FormItem label='考试状态' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
                <Select
                  style={{ width: '140px' }}
                  v-model:value={formState.passed}
                  allowClear
                  options={[
                    { label: '及格', value: true },
                    { label: '不及格', value: false },
                  ]}
                />
              </FormItem>
              <FormItem label='考试日期' style={{ paddingRight: 0, marginRight: '5px', marginBottom: '10px' }}>
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
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollYAxis.value} scrollX={2400} />
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
        <Layout title='考试记录' v-slots={layoutSlots} />
      </>
  }
})
