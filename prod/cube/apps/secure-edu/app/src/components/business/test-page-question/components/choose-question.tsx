import { getQuestionPage } from '@/api/question'
import { logger } from '@/logger'
import { Button, Form, FormItem, Input, Modal, Page, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'

type Key = string | number
interface Props {
  questionCategoryIndex: number;
}

export default defineComponent({
  props: ['questionCategoryIndex'],
  emits: ['addExamQuestion'],
  setup (props: Props, { emit }) {
    const showModal = ref(false)
    const handleOkFormModelTable = (): void => {
      emit('addExamQuestion', { values: selectedRowsState.value, questionCategoryIndex: props.questionCategoryIndex })
      cancel()
    }
    const cancel = (): void => {
      showModal.value = false
    }
    const openModal = (): void => {
      showModal.value = true
      reset()
    }

    const formState = reactive({
      keyword: ''
    })
    const columns = [
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
        customRender: ({ text }: { text: string; }): JSX.Element=> {
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
    const selectedRowKeysState = ref<Key[]>([])
    const selectedRowsState = ref<{ id: string; }[]>([])
    const rowSelection = {
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: Key[], selectedRows: { id: string; }[]): void => {
        selectedRowKeysState.value = selectedRowKeys
        selectedRowsState.value = JSON.parse(JSON.stringify(selectedRows))
      },
    }

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

    return (): JSX.Element =>
      <>
        <Button type='link' size='small' onClick={openModal}>调用</Button>
        <Modal
          visible={showModal.value}
          title='选择考题'
          width='1000px'
          destroyOnClose
          onOk={handleOkFormModelTable}
          onCancel={cancel}
        >
          <Form layout='inline' style={{ marginBottom: '20px' }}>
            <FormItem style={{ padding: 0 }}>
              <Input v-model:value={formState.keyword} placeholder='题目名称、题目主题' showCount={false} />
            </FormItem>
            <FormItem>
              <Button type='primary' onClick={queryForm}>查询</Button>
              <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
            </FormItem>
          </Form>
          <Table
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size='small'
            rowSelection={rowSelection}
            rowKey='id'
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Page
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              onPageChange={pageChange}
            />
          </div>
        </Modal>
      </>
  }
})
