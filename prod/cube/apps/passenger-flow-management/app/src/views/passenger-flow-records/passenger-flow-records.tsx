import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import styles from './passenger-flow-records.module.less'
import { cubeSecurityService } from '@/api/service.ts'
import type { MeetingRecordType } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'
interface SearchType {
  pageNumber: number;
  pageSize: number;
  visitedPerson: string;
  timePeriod: string;
  keyword: string;
}
export const PassengerFlowRecords = defineComponent({
  setup: () => {
    const total = ref<number>(0)
    const search = reactive<SearchType>({
      pageNumber: 1,
      pageSize: 10,
      visitedPerson: '',
      timePeriod: '',
      keyword: '',
    })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(400)
    const tableData = ref<MeetingRecordType[]>([])
    const exportLoading = ref<boolean>(false)
    // 查询客流记录表格数据===================================================================================================
    // 获取客流记录表格数据
    const getEnterpriseRecordPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const res = await cubeSecurityService.getMeetingPage(search)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
      }
    }
    onMounted(() => {
      getEnterpriseRecordPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      getEnterpriseRecordPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      getEnterpriseRecordPage()
    }
    const handleSearch = (): void => {
      search.pageNumber = 1
      getEnterpriseRecordPage()
    }
    const handleReset = (): void => {
      search.pageNumber = 1
      search.visitedPerson = ''
      search.timePeriod = ''
      getEnterpriseRecordPage()
    }
    const alarmRecordExport = (): void => {
      exportLoading.value = true
      // cubeAlarmStatService.alarmSafetyReportPageExport(search).then(res => {
      //   exportLoading.value = false
      //   if (res) {
      //     const link = document.createElement('a')
      //     const blob = new Blob([res as BlobPart], {
      //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      //     })
      //     link.style.display = 'none'
      //     link.href = URL.createObjectURL(blob)
      //     link.setAttribute('download', '客流纪录.xlsx')
      //     document.body.appendChild(link)
      //     link.click()
      //     document.body.removeChild(link)
      //   }
      // }).catch(() => {
      //   exportLoading.value = false
      //   message.warn('未查询到数据，无法导出')
      // })
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '场所名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '场所类型',
        dataIndex: 'location',
        key: 'location',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '统计时间',
        dataIndex: 'time1',
        key: 'time1',
        customRender: ({ record }: { record: MeetingRecordType; }) => {
          return <>{dayjs(record?.meetingStartTime ?? '').format('YYYY-MM-DD HH:mm') ?? '--'}-{dayjs(record?.meetingEndTime ?? '').format('HH:mm') ?? '--'}</>
        }
      },
      {
        title: '进人数',
        dataIndex: 'leave',
        key: 'leave',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '出人数',
        dataIndex: 'time1',
        key: 'time1',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'header-btn': () => {
        return (
          <Button type='primary' loading={exportLoading.value} onClick={alarmRecordExport}>导出</Button>
        )
      },
      'content-search': () => {
        return (
          <Form layout='inline'>
              <FormItem label='场所名称'>
                  <Input v-model:value={search.keyword} />
              </FormItem>
             <FormItem label='统计时间'>
                <DateRangePicker v-model:value={search.timePeriod} />
             </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': () => {
        return (
          <>
            <div class={styles['content-right']}>
              <Table
                columns={recordTableColumns}
                data-source={tableData.value}
                loading={tableLoading.value}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
              <div class={styles['table-footer']}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={total.value}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div>
            </div>
          </>
        )
      },
    }
    return () =>
      <>
        <GLayout title='客流记录' showFooter={false} v-slots={gLayoutSlots} />
      </>
  }
})
