import type { BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import { Button, Form, FormItem, Input, Modal, Page, Table } from '@ghcloud/cube-ui'
import { type Component, defineComponent, ref, h, watch, unref, reactive, computed } from 'vue'
import { logger } from '../logger'

type Key = string | number
interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
interface Props {
  title: string;
  show: boolean;
  search: { label: string; key: string; defaultValue?: string; componentProps?: Record<string, unknown>; slots?: Record<string, unknown>; component?: Component; }[];
  columns: unknown[];
  multiple: boolean;
  loading: boolean;
  apiFunction: (arg0: unknown) => Promise<BaseAPIResult<PageResult>> & Promise<{ records: unknown[]; total: number; }> ;
  /** 查询条件额外参数 */
  searchParams: Record<string, unknown> | ((arg0: unknown) => Record<string, unknown>);
  selectRowKeysValue: string[];
  selectRowValue: { id: string; }[];
  width: string;
  rowKey?: string;
  showPage?: boolean;
  showSelectedTotal?: boolean;
  getCheckboxProps?: (record: unknown) => { disabled: boolean; };
}

export const ModalTable = defineComponent({
  props: ['title', 'show', 'columns', 'loading', 'search', 'apiFunction', 'multiple', 'selectRowKeysValue', 'selectRowValue', 'width', 'searchParams', 'rowKey', 'showPage', 'showSelectedTotal', 'getCheckboxProps'],
  emits: ['update:show', 'ok', 'cancel', 'changePage'],
  setup (props: Props, { emit, expose }) {
    const cancel = (): void => {
      emit('update:show', false)
      emit('cancel')
      pagination.value.pageNumber = 1
      pagination.value.pageSize = 10
    }
    const ok = async (): Promise<void> => {
      emit('ok', JSON.parse(JSON.stringify(state.selectedRows)))
      pagination.value.pageNumber = 1
      pagination.value.pageSize = 10
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
        const customParams = searchParams instanceof Function ? searchParams(formState.value) : searchParams
        emit('changePage', { pageNumber: pagination.value.pageNumber, pageSize: pagination.value.pageSize })
        const res = await props.apiFunction({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState.value,
          ...customParams
        })
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records
          pagination.value.total = total
        } else if (res) {
          const { records, total } = res
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
        onChange: (keys: Key[]) => {
          state.selectedRowKeys = keys
        },
        onSelect: (record: { id: string; }, selected: boolean) => {
          if (!props.multiple) {
            state.selectedRows.length = 0
          }
          const findIndex = state.selectedRows.findIndex(e => e.id === record.id)
          if (selected && findIndex === -1) {
            state.selectedRows.push(record)
          }
          if (!selected && findIndex !== -1) {
            state.selectedRows.splice(findIndex, 1)
          }
        },
        getCheckboxProps: props.getCheckboxProps,
        onSelectAll: (selected: boolean) => {
          dataSource.value.forEach(item => {
            const findIndex = state.selectedRows.findIndex(e => e.id === (item as { id: string; }).id)
            if (findIndex === -1 && selected) {
              state.selectedRows.push(item as { id: string; })
            }
            if (findIndex !== -1 && !selected) {
              state.selectedRows.splice(findIndex, 1)
            }
          })
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
    expose({
      formState,
      pagination,
      getTableData,
      state
    })
    return () => {
      const form = (
        <Form layout='inline' style={{ marginBottom: '20px' }}>
          {
            props.search.map((e) => {
              e.component = e.component ?? Input
              return (
                <FormItem label={e.label} style={{ paddingRight: 0, marginBottom: '10px' }}>
                  {
                    h(e.component, {
                      ...e.componentProps,
                      value: formState.value[e.key],
                      'onUpdate:value': (val: string | number) => {
                        formState.value[e.key] = val
                      }
                    }, e.slots)
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
        <Modal visible={props.show} title={props.title ?? ' '} width={props.width ?? '1000px'} destroyOnClose confirmLoading={props.loading} onOk={ok} onCancel={cancel} >
          {(props.search && props.search.length > 0) && form}
          <Table
            columns={props.columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size='small'
            rowSelection={rowSelection.value}
            rowKey={props.rowKey ?? 'id'}
            scrollY={430}
          />
          {
            (props.showPage ?? true) &&
               <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <div>{props.showSelectedTotal && <span>已选：{state.selectedRows.length} 条数据</span>}</div>
                <Page
                  v-model:current={pagination.value.pageNumber}
                  v-model:pageSize={pagination.value.pageSize}
                  v-model:total={pagination.value.total}
                  onPageChange={pageChange}
                />
              </div>
          }
        </Modal>
      )
    }
  }
})
