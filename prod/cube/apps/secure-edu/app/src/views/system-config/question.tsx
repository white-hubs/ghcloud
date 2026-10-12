import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { getQuestionPage, questionDel } from '@/api/question'
import { useTableScroll } from '@/hook/use-table-scroll'
import { logger } from '@/logger'
import { useHeadMode } from '@/hook/use-head-mode'
import { QuestionImportModel } from './components/question-import/import-modal'
import { cubeSecureEduService } from '@/api/server'
export const Question = defineComponent({
  setup: () => {
    const formState = reactive({
      keyword: ''
    })
    const { basePath } = useHeadMode()

    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', `${basePath}/question-form?action=add`)
    }
    const editRow = (record: { id: string; }, detail?: boolean): void => {
      history.pushState({ current: location.pathname + location.search }, '', `${basePath}/question-form?id=${record.id}&action=${detail ? 'detail' : 'edit'}`)
    }
    const delRow = async (record: { id: string; }): Promise<void> => {
      await questionDel({ id: record.id })
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
        title: '题目',
        dataIndex: 'name',
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '题目主题',
        dataIndex: 'themeName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '题目类型',
        dataIndex: 'questionTypeName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        customRender: ({ record }: { record: { id: string; }; }): JSX.Element => {
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
        const res = await getQuestionPage({
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

    const exportLoading = ref(false)
    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true
        const res = await cubeSecureEduService.exportExamQuestionTemplate()
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '考题库导入模版.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        exportLoading.value = false
      }
    }
    const questionImportModelRef = ref<{ openModal: () => void; }>()
    const importEvent = (): void => {
      questionImportModelRef.value?.openModal()
    }
    const { scrollYAxis } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-header': (): JSX.Element=> {
        return (
          <div>
            <Button style={{ marginRight: '16px' }} type='primary' loading={exportLoading.value} onClick={handleExport}>下载模版</Button>
            <Button style={{ marginRight: '16px' }} type='primary' onClick={importEvent}>批量导入</Button>
            <Button type='primary' onClick={add}>新增</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0' }}>
              <FormItem style={{ paddingRight: 0 }}>
                <Input v-model:value={formState.keyword} placeholder='题目名称、题目主题' showCount={false} />
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
        <Layout title='考题库' v-slots={layoutSlots} />
        <QuestionImportModel ref={questionImportModelRef} onEnter={getTableData} />
      </>
  }
})
