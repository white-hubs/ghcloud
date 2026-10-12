import { defineComponent, onMounted, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Button, Form, FormItem, Input, PopOver, Table, Page } from '@ghcloud/cube-ui'
import type { BroadcastTemplatePage } from '@ghcloud/cube-broadcast-center-service'
import { cubeBroadcastService } from '@/api/service'
import dayjs from 'dayjs'
interface Props {
  visible: boolean;
  disabledKeys: string[];
  selectedKeys: string[];
}
export const BroadcastModal = defineComponent({
  emits: ['cancel', 'save'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    disabledKeys: {
      type: Array as PropType<string[]>,
      default: []
    },
    selectedKeys: {
      type: Array as PropType<string[]>,
      default: []
    },
  },
  setup: (props: Props, { emit }) => {
    const visible = ref(false)
    const dataSource = ref<BroadcastTemplatePage[]>([])
    const disabledList = ref<string[]>([])
    const save = (): void => {
      emit('save', selectedRowKeysData.value, selectedRowsData.value)
    }
    const cancel = (): void => {
      visible.value = false
      emit('cancel', false)
    }
    const columns = [
      {
        title: '序号',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        width: 60,
        customRender: ({ index }: { index: number; }): JSX.Element => {
          return <PopOver content={index + 1 || '--'}>{index + 1 || '--'}</PopOver>
        }
      },
      {
        title: '模板名称',
        dataIndex: 'name',
        align: 'center',
        width: 120,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '广播内容',
        dataIndex: 'content',
        ellipsis: true,
        align: 'center',
        width: 200,
        customRender: ({ text, record }: { text: string;record: BroadcastTemplatePage; }): JSX.Element => {
          if (record.contentType === 'TEXT') {
            return (
              <PopOver
                content={
                  text
                    ? text
                      .replaceAll('${name}', '{ 姓名 }')
                      .replaceAll('${address}', '{ 地址 }')
                      .replaceAll('${plateNo}', '{车牌号 }')
                      .replaceAll('${curTime}', '{当前时间}')
                      .replaceAll('${curDate}', '{当前日期}')
                      .replaceAll('${phone}', '{ 电话 }')
                      .replaceAll('${genericText}', '{ 通用文本 }')
                    : ''
                }
              >
                {text
                  ? text
                    .replaceAll('${name}', '{ 姓名 }')
                    .replaceAll('${address}', '{ 地址 }')
                    .replaceAll('${plateNo}', '{车牌号 }')
                    .replaceAll('${curTime}', '{当前时间}')
                    .replaceAll('${curDate}', '{当前日期}')
                    .replaceAll('${phone}', '{ 电话 }')
                    .replaceAll('${genericText}', '{ 通用文本 }')
                  : '--'}
              </PopOver>
            )
          } else {
            return (
              <audio
                src={record.fileVOList?.[0] ? record.fileVOList[0].path : ''}
                style='max-width: 100%;max-height: 100%;' controls
              />
            )
          }
        }
      },
      {
        title: '编辑人',
        dataIndex: 'updateByName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最近编辑时间',
        dataIndex: 'updateTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
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
    const formState = reactive<{ keyword: string | undefined; }>({
      keyword: undefined,
    })
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getBroadcastTemplatePage()
    }
    const reset = (): void => {
      pagination.value.pageNumber = 1
      formState.keyword = ''
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
      const res = await cubeBroadcastService.broadcastTemplatePage(params)
      dataSource.value = res.records
      pagination.value.total = res.total
      loading.value = false
    }
    const selectedRowKeysData = ref<string[]>(props.selectedKeys || [])
    const selectedRowsData = ref<BroadcastTemplatePage[]>([])
    const rowSelection = ref({
      type: 'radio',
      selectedRowKeys: selectedRowKeysData.value,
      onChange: (selectedRowKeys: string [], selectedRows: BroadcastTemplatePage[]) => {
        selectedRowKeysData.value = selectedRowKeys
        selectedRowsData.value = selectedRows
      },
      getCheckboxProps: (record: BroadcastTemplatePage) => {
        return {
          disabled: disabledList.value?.length
            ? disabledList.value?.includes(record.id)
            : false,
        }
      }
    })
    watch(() => props.visible, (val) => {
      visible.value = val
      if (val) {
        getBroadcastTemplatePage()
      }
    }, { immediate: true })

    watch(() => props.disabledKeys, (val) => {
      disabledList.value = val
    }, { immediate: true })
    onMounted(() => {
    })
    return (): JSX.Element =>
      <>
        <Modal v-model:visible={visible.value} title='选择广播模板' onOk={save} onCancel={cancel} width={800}>
          <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
            <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Input style={{ width: '220px' }} placeholder='请输入名称搜索' v-model:value={formState.keyword} />
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
            rowSelection={rowSelection.value}
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
