import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import styles from './enterprise-records.module.less'
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
export const EnterpriseRecord = defineComponent({
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
    // 查询企业记录表格数据===================================================================================================
    // 获取企业记录表格数据
    const getEnterpriseRecordPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const res = await cubeSecurityService.getMeetingPage(search)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } finally {
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
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '企业名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '入驻位置',
        dataIndex: 'location',
        key: 'location',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '入驻时间',
        dataIndex: 'time1',
        key: 'time1',
        customRender: ({ record }: { record: MeetingRecordType; }): JSX.Element=> {
          return <>{dayjs(record?.meetingStartTime ?? '').format('YYYY-MM-DD HH:mm') ?? '--'}-{dayjs(record?.meetingEndTime ?? '').format('HH:mm') ?? '--'}</>
        }
      },
      {
        title: '是否离开',
        dataIndex: 'leave',
        key: 'leave',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '离开时间',
        dataIndex: 'time1',
        key: 'time1',
        customRender: ({ record }: { record: MeetingRecordType; }): JSX.Element => {
          return <>{dayjs(record?.meetingStartTime ?? '').format('YYYY-MM-DD HH:mm') ?? '--'}-{dayjs(record?.meetingEndTime ?? '').format('HH:mm') ?? '--'}</>
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='企业名称'>
              <Input v-model:value={search.keyword} />
            </FormItem>
            <FormItem label='入驻时间'>
              <DateRangePicker v-model:value={search.timePeriod} />
            </FormItem>
            <FormItem label='离开时间'>
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
      'content-table': (): JSX.Element => {
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
    return (): JSX.Element=>
      <>
        <GLayout title='企业记录' showFooter={false} v-slots={gLayoutSlots} />
      </>
  }
})
