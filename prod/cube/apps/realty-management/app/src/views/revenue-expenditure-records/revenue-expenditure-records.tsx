import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Select, Table } from '@ghcloud/cube-ui'
import styles from './revenue-expenditure-records.module.less'
import { cubeSecurityService } from '@/api/service.ts'
import type { MeetingRecordType } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'
interface SearchType {
  pageNumber: number;
  pageSize: number;
  classify: string | null;
  type: string | null;
  timePeriod: string;
}
export const RevenueExpenditureRecords = defineComponent({
  setup: () => {
    const total = ref<number>(0)
    const search = reactive<SearchType>({
      pageNumber: 1,
      pageSize: 10,
      classify: null,
      type: null,
      timePeriod: '',
    })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(400)
    const tableData = ref<MeetingRecordType[]>([])
    const options = ref()
    // 查询物业收支记录表格数据===================================================================================================
    // 获取物业收支记录表格数据
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
    const getPointTypeOption = async (): Promise<void> => {
      options.value = [
        {
          label: '全部',
          value: 'ALL',
        },
        {
          label: '收入',
          value: 'INCOME',
        },
        {
          label: '支出',
          value: 'EXPENDITURE',
        },
      ]
    }
    onMounted(() => {
      getEnterpriseRecordPage()
      getPointTypeOption()
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
      search.classify = ''
      search.timePeriod = ''
      getEnterpriseRecordPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '分类',
        dataIndex: 'classification',
        key: 'classification',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '金额',
        dataIndex: 'money',
        key: 'money',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '记录时间',
        dataIndex: 'time1',
        key: 'time1',
        customRender: ({ record }: { record: MeetingRecordType; }): JSX.Element => {
          return <>{dayjs(record?.meetingStartTime ?? '').format('YYYY-MM-DD HH:mm') ?? '--'}-{dayjs(record?.meetingEndTime ?? '').format('HH:mm') ?? '--'}</>
        }
      },
      {
        title: '具体说明',
        dataIndex: 'description',
        key: 'description',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element=> {
        return (
          <Form layout='inline'>
            <FormItem label='分类'>
              <Select options={options.value} style={{ width: '180px' }} placeholder='请选择分类' v-model:value={search.classify} />
            </FormItem>
            <FormItem label='类型'>
              <Select options={options.value} style={{ width: '180px' }} placeholder='请选择类型' v-model:value={search.type} />
            </FormItem>
            <FormItem label='记录时间'>
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
    return (): JSX.Element =>
      <>
        <GLayout title='物业收支记录' showFooter={false} v-slots={gLayoutSlots} />
      </>
  }
})
