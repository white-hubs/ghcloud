import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Select, Table } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import dayjs from 'dayjs'
import { cubeBooksManagementService } from '@/api/service'

/** 借阅记录 */
export const BorrowRecord = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive({
      name: '',
      period: [],
      status: undefined,
    })

    const columns = [
      {
        title: '借阅证号',
        dataIndex: 'borrowCardNumber',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '借阅日期',
        dataIndex: 'borrowTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '应还日期',
        dataIndex: 'shouldReturnTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '书名',
        dataIndex: 'bookName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '作者',
        dataIndex: 'bookAuthor',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '出版社',
        dataIndex: 'publishingHouse',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: 'ISBN号',
        dataIndex: 'isbnNumber',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '借阅状态',
        dataIndex: 'status',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const textVal = text !== undefined && text !== null ? statusOptions.value.find(s => Number(s.value) === Number(text ?? 0))?.label : ''
          return (
            <PopOver content={textVal || '--'}>
              <span style={{ color: color[text] }}>{textVal || '--'}</span>
            </PopOver>
          )
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
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          name: formState.name,
          status: formState.status ?? '',
          period: formState.period ? formState.period.join(',') : formState.period,
        }
        const res = await cubeBooksManagementService.getBorrowRecordPage(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch {
      } finally {
        loading.value = false
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }
    const statusOptions = ref([
      { label: '已还', value: '1' },
      { label: '未还', value: '2' },
    ])
    const color: Record<string, string> = {
      0: '#00ba8b',
      1: '#1890ff',
      2: '#f50',

    }
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.name = ''
      formState.status = undefined
      formState.period = []
      queryForm()
    }
    const { scrollY } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='借阅日期'>
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='文献状态'>
                <Select options={statusOptions.value} style={{ width: '180px' }} placeholder='请选择设备状态' v-model:value={formState.status} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='书名'>
                <Input v-model:value={formState.name} placeholder='请输入书名' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} />
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
        <Layout title={pageTitle ?? '借阅记录'} v-slots={layoutSlots} />
      </>
  }
})
