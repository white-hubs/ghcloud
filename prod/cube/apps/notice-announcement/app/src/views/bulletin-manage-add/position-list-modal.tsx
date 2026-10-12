import { defineComponent, onMounted, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Button, Form, FormItem, Input, PopOver, Table, Page } from '@ghcloud/cube-ui'
import type { BroadcastTemplatePage } from '@ghcloud/cube-broadcast-center-service'
import { cubeAnnouncementService } from '@/api/service'
interface Props {
  visible: boolean;
  selectedKeys: string[];
}
export const PositionListModal = defineComponent({
  emits: ['cancel', 'save'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedKeys: {
      type: Array as PropType<string[]>,
      default: []
    },
  },
  setup: (props: Props, { emit }) => {
    const visible = ref(false)
    const dataSource = ref<Record<string, unknown>[]>([])
    const save = (): void => {
      emit('save', selectedRowKeysData.value, selectedRowsData.value)
    }
    const cancel = (): void => {
      visible.value = false
      emit('cancel', false)
    }
    const columns = [
      {
        title: '部门名称',
        dataIndex: 'name',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const loading = ref(false)
    const pagination = ref<{
      pageSize: number;
      pageNumber: number;
      total?: number; }>({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formState = reactive<{ name: string ; }>({
      name: '',
    })
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getBroadcastTemplatePage()
    }
    const reset = (): void => {
      pagination.value.pageNumber = 1
      formState.name = ''
      getBroadcastTemplatePage()
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getBroadcastTemplatePage()
    }
    const getBroadcastTemplatePage = async (): Promise<void> => {
      const params = {
        ...pagination.value,
        ...formState,
      }
      delete params?.total
      loading.value = true
      const res = await cubeAnnouncementService.positionList(params)
      dataSource.value = res.records
      pagination.value.total = res.total
      loading.value = false
    }
    const selectedRowKeysData = ref<string[]>(props.selectedKeys || [])
    const selectedRowsData = ref<BroadcastTemplatePage[]>([])

    watch(() => props.visible, (val) => {
      visible.value = val
      if (val) {
        getBroadcastTemplatePage()
      }
    }, { immediate: true })

    watch(() => props.selectedKeys, (val) => {
      selectedRowKeysData.value = val
    }, { immediate: true })
    onMounted(() => {
    })
    return (): JSX.Element =>
      <>
        <Modal v-model:visible={visible.value} title='选择部门列表' onOk={save} onCancel={cancel} width={800}>
          <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
            <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Input style={{ width: '220px' }} placeholder='请输入名称搜索' v-model:value={formState.name} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Button type='primary' onClick={queryForm}>查询</Button>
              <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
            </FormItem>
          </Form>
          <Table
            rowKey='id'
            columns={columns}
            dataSource={dataSource.value}
            pagination={false}
            loading={loading.value}
            rowSelection={{
              selectedRowKeys: selectedRowKeysData.value,
              onChange: (selectedRowKeys: string [], selectedRows: BroadcastTemplatePage[]) => {
                selectedRowKeysData.value.length = 0
                selectedRowKeysData.value = JSON.parse(JSON.stringify(selectedRowKeys))
                selectedRowsData.value = selectedRows
              },
            }}
            scrollY={300}
          />
          <Page
            style={{ textAlign: 'right' }}
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        </Modal>
      </>
  }
})
