import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, Select, Table } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import { cubeBooksManagementService } from '@/api/service'

/** 编目综合统计 */
export const CatalogComprehensiveStatistics = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive({
      status: undefined,
      operator: undefined,
      tidyBatch: '',
    })

    const columns = [
      {
        title: '馆藏地',
        dataIndex: 'venues',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '编目批次',
        dataIndex: 'tidyBatch',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '文献状态',
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
      {
        title: '文献语种',
        dataIndex: 'languages',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '文献类型',
        dataIndex: 'bookType',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '中图法分类',
        dataIndex: 'contentType',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作员',
        dataIndex: 'operator',
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
          tidyBatch: formState.tidyBatch,
          status: formState.status ?? '',
          operator: formState.operator ?? '',
        }
        const res = await cubeBooksManagementService.getTidyUpStatisticsPage(params)
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
    const statusOptions = ref([
      { label: '待编目', value: '0' },
      { label: '待接收', value: '1' },
      { label: '已接收', value: '2' },
      { label: '典藏退回', value: '3' },
    ])
    const color: Record<number, string> = {
      0: '#1890ff',
      1: '#1890ff',
      2: '#1890ff',
      3: '#f50',
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
      formState.tidyBatch = ''
      formState.operator = undefined
      formState.status = undefined
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
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='文献状态'>
                <Select options={statusOptions.value} style={{ width: '180px' }} placeholder='请选择设备状态' v-model:value={formState.status} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='编目批次'>
                <Input v-model:value={formState.tidyBatch} placeholder='请输入编目批次' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='操作员'>
                <Input v-model:value={formState.operator} placeholder='请输入姓名' showCount={false} />
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
