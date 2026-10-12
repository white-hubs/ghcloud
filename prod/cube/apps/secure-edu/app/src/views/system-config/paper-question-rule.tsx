import dayjs from 'dayjs'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { getPaperQuestionRuleList, removePaperQuestionRule } from '@/api/paper-question-rule'
import { useTableScroll } from '@/hook/use-table-scroll'
import { logger } from '@/logger'
import type { PaperQuestionRuleRow } from '@/types/paper-question-rule'
import type { PageResult } from '@/api/common-type'
import { useHeadMode } from '@/hook/use-head-mode'

export const PaperQuestionRule = defineComponent({
  setup: () => {
    const { basePath } = useHeadMode()
    const formState = reactive({
      keyword: ''
    })

    const loading = ref(false)
    const dataSource = ref<PaperQuestionRuleRow[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await getPaperQuestionRuleList({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState
        })
        if (!res.data) {
          dataSource.value = []
          pagination.value.total = 0
          return
        }
        if (Array.isArray(res.data)) {
          dataSource.value = res.data
          pagination.value.total = res.data.length
          return
        }
        const pageData = res.data as PageResult
        dataSource.value = (pageData.records ?? []) as PaperQuestionRuleRow[]
        pagination.value.total = pageData.total ?? 0
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

    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', `${basePath}/paper-question-rule-form?action=add`)
    }

    const editRow = (record: PaperQuestionRuleRow, detail?: boolean): void => {
      history.pushState({ current: location.pathname + location.search }, '', `${basePath}/paper-question-rule-form?id=${record.id}&action=${detail ? 'detail' : 'edit'}`)
    }

    const delRow = async (record: PaperQuestionRuleRow): Promise<void> => {
      await removePaperQuestionRule(record.id)
      message.success('操作成功')
      getTableData()
    }

    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => {
          const serialNumber = (pagination.value.pageNumber - 1) * pagination.value.pageSize + index + 1
          return `${serialNumber}`
        }
      },
      {
        title: '随机出题规则名称',
        dataIndex: 'ruleName',
        width: 240,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '试卷总分',
        dataIndex: 'totalScore',
        width: 110,
        align: 'center'
      },
      {
        title: '及格分数',
        dataIndex: 'passScore',
        width: 110,
        align: 'center'
      },
      {
        title: '试题数',
        dataIndex: 'questionNum',
        width: 100,
        align: 'center'
      },
      {
        title: '规则说明',
        dataIndex: 'description',
        width: 320,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '编辑时间',
        dataIndex: 'updateTime',
        width: 190,
        customRender: ({ record }: { record: PaperQuestionRuleRow; }): JSX.Element | string => {
          const currentEditTime = record.updateTime || record.editTime || record.updatedAt
          if (!currentEditTime) {
            return '--'
          }
          const formattedTime = dayjs(currentEditTime).format('YYYY.MM.DD HH:mm:ss')
          return <PopOver content={formattedTime}>{formattedTime}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 170,
        customRender: ({ record }: { record: PaperQuestionRuleRow; }): JSX.Element => {
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
                <Input v-model:value={formState.keyword} placeholder='规则名称' showCount={false} />
              </FormItem>
              <FormItem>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollYAxis.value} scrollX={1240} />
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

    return (): JSX.Element => {
      return <Layout title='随机考题规则' v-slots={layoutSlots} />
    }
  }
})
