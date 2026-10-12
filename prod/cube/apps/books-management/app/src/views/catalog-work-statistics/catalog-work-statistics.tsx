import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Table } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import { cubeBooksManagementService } from '@/api/service'
import dayjs from 'dayjs'

/** 编目工作量统计 */
export const CatalogWorkStatistics = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive({
      name: '',
      bookType: undefined,
      period: [],
    })

    const columns = [
      {
        title: '编目日期',
        dataIndex: 'tidyTime',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '操作员',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '编目数量',
        dataIndex: 'tidyNumber',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '修正次数',
        dataIndex: 'updateNumber',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '工作时间（小时）',
        dataIndex: 'workHour',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '图书类别',
        dataIndex: 'bookType',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
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
          bookType: formState.bookType ?? '',
          period: formState.period ? formState.period.join(',') : formState.period,
        }
        const res = await cubeBooksManagementService.getWorkRecordPage(params)
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

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.name = ''
      formState.bookType = undefined
      formState.period = []
      queryForm()
    }
    const typeOptions = ref<{ label: string; value: string; }[]>(
      [
        // { label: '文学', value: 'wenxue' },
        // { label: '历史', value: 'lishi' },
        // { label: '哲学', value: 'zhexue' },
        // { label: '教育', value: 'jiaoyu' },
      ]
    )
    const getTypeList = async (): Promise<void> => {
      try {
        const res = await cubeBooksManagementService.getBooksTypeList()
        if (res && Array.isArray(res)) {
          typeOptions.value = res.map(r => ({ label: r.name, value: r.code }))
        }
      } catch {
      }
    }
    const { scrollY } = useTableScroll()

    onMounted(() => {
      getTableData()
      getTypeList()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='图书类别'>
                <Input v-model:value={formState.bookType} placeholder='请输入图书类别' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='编目日期'>
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='操作员'>
                <Input v-model:value={formState.name} placeholder='请输入姓名' showCount={false} />
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
        <Layout title={pageTitle ?? '编目记录'} v-slots={layoutSlots} />
      </>
  }
})
