import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, PopConfirm, Table, message } from '@ghcloud/cube-ui'
import { getCoursewarePage, coursewareDel } from '@/api/courseware'
import { useTableScroll } from '@/hook/use-table-scroll'
import { fileDownLoad } from '@/hook/file-download'
import { logger } from '@/logger'
import { useHeadMode } from '@/hook/use-head-mode'
import { formatTime } from '@/utils/index'
export const Courseware = defineComponent({
  setup: () => {
    const formState = reactive({
      keyword: ''
    })
    const { basePath } = useHeadMode()

    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', `${basePath}/courseware-form?action=add`)
    }
    const editRow = (record: { id: string; }, detail?: boolean): void => {
      history.pushState({ current: location.pathname + location.search }, '', `${basePath}/courseware-form?id=${record.id}&action=${detail ? 'detail' : 'edit'}`)
    }
    const delRow = async (record: { id: string; }): Promise<void> => {
      await coursewareDel({ id: record.id })
      message.success('操作成功')
      getTableData()
    }

    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '课件名称',
        dataIndex: 'name',
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '课件主题',
        dataIndex: 'themeName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '附件',
        dataIndex: 'file',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; path: string; }; }): JSX.Element | string => {
          if (!text) {
            return '--'
          }
          const fileName = text.name
          const filePath = text.path
          return (
            <PopOver content={fileName}>
              <Button type='link' onClick={async () => fileDownLoad(fileName, filePath)} style={{ maxWidth: '100%' }}>
                <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
              </Button>
            </PopOver>
          )
        }
      },
      {
        title: '附件大小',
        dataIndex: 'file',
        ellipsis: true,
        customRender: ({ text }: { text: { size: number; }; }): JSX.Element | string => {
          if (!text) {
            return '--'
          }
          const fileSize = (text.size / 1024).toFixed(2)
          return <PopOver content={fileSize.toString()}>{fileSize}KB</PopOver>
        }
      },
      {
        title: '附件时长',
        dataIndex: 'duration',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element | string => {
          if (!text) {
            return '--'
          }
          return <PopOver content={formatTime(text)}>{formatTime(text)}</PopOver>
        }
      },
      {
        title: '课件描述',
        dataIndex: 'remark',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element | string => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        customRender: ({ record }: { record: { id: string; }; }): JSX.Element | string => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                editRow(record, true)
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                editRow(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                delRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
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
        const res = await getCoursewarePage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState
        })
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records
          pagination.value.total = total
        }
      } catch (error) {
        logger.error(error)
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
      formState.keyword = ''
      queryForm()
    }
    const { scrollYAxis } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={add}>新增</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0' }}>
              <FormItem style={{ paddingRight: 0 }}>
                <Input v-model:value={formState.keyword} placeholder='课件名称、课件主题' showCount={false} />
              </FormItem>
              <FormItem>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollYAxis.value} />
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
        <Layout title='课件库' v-slots={layoutSlots} />
      </>
  }
})
