import type { BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import { Button, Form, FormItem, Input, Modal, Page, Table } from '@ghcloud/cube-ui'
import { type Component, defineComponent, ref, h, watch, unref, reactive, computed } from 'vue'

type Key = string | number
interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
interface Props {
  title: string;
  show: boolean;
  search: { label: string; key: string; defaultValue?: string; componentProps?: Record<string, unknown>;component?: Component; }[];
  columns: unknown[];
  multiple: boolean;
  apiFunction: (arg0: unknown) => Promise<BaseAPIResult<PageResult>>;
  searchParams: Record<string, unknown>;
  selectRowKeysValue: string[];
  selectRowValue: { id: string; }[];
  width: string;
}

export const ModalTable = defineComponent({
  props: ['title', 'show', 'columns', 'search', 'apiFunction', 'multiple', 'selectRowKeysValue', 'selectRowValue', 'width', 'searchParams'],
  emits: ['update:show', 'ok'],
  setup (props: Props, { emit }) {
    const cancel = (): void => {
      emit('update:show', false)
      pagination.value.pageNumber = 1
    }
    const ok = async (): Promise<void> => {
      emit('ok', JSON.parse(JSON.stringify(state.selectedRows)))
      pagination.value.pageNumber = 1
    }

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formState = ref<Record<string, string | number | undefined>>({})

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const searchParams = props.searchParams ?? {}
        const res = await props.apiFunction({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState.value,
          ...searchParams
        })
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records
          pagination.value.total = total
        }
      } catch (error) {
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
      props.search.forEach(e => {
        formState.value[e.key] = e.defaultValue ? e.defaultValue : undefined
      })
      queryForm()
    }

    const state = reactive<{
      selectedRowKeys: Key[];
      selectedRows: { id: string; }[];
    }>({
      selectedRowKeys: [],
      selectedRows: []
    })

    const rowSelection = computed(() => {
      return {
        preserveSelectedRowKeys: true,
        selectedRowKeys: unref(state.selectedRowKeys),
        type: props.multiple ? 'checkbox' : 'radio',
        onChange: (keys: Key[], selectedRows: { id: string; }[]) => {
          state.selectedRowKeys = keys
          state.selectedRows = JSON.parse(JSON.stringify(selectedRows))
        }
      }
    })

    watch(() => props.show, () => {
      if (props.show) {
        state.selectedRows = props.selectRowValue ?? []
        state.selectedRowKeys = props.selectRowKeysValue ?? []
        state.selectedRows = state.selectedRows.filter(e => state.selectedRowKeys.includes(e.id))
        const formStateParams: Record<string, string | number | undefined> = {}
        if (props.search && props.search.length > 0) {
          props.search.forEach(e => {
            formStateParams[e.key] = undefined
          })
        }
        formState.value = formStateParams
        getTableData()
      }
    })

    return () => {
      const form = (
        <Form layout='inline' style={{ marginBottom: '20px' }}>
          {
            props.search.map((e) => {
              e.component = e.component ?? Input
              return (
                <FormItem label={e.label} style={{ paddingRight: 0 }}>
                  {
                    h(e.component, {
                      ...e.componentProps,
                      value: formState.value[e.key],
                      'onUpdate:value': (val: string | number) => {
                        formState.value[e.key] = val
                      }
                    })
                  }
                </FormItem>
              )
            })
          }
          <FormItem>
            <Button type='primary' onClick={queryForm}>查询</Button>
            <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
          </FormItem>
        </Form>
      )

      return (
        <Modal visible={props.show} title={props.title ?? ' '} width={props.width ?? '1000px'} destroyOnClose onOk={ok}onCancel={cancel} >
          {(props.search && props.search.length > 0) && form}
          <Table
            columns={props.columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size='small'
            rowSelection={rowSelection.value}
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
      )
    }
  }
})
