import type { BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import { Button, Form, FormItem, Input, Page, Table } from '@ghcloud/cube-ui'
import { defineComponent, ref, onMounted, h, computed, unref, reactive } from 'vue'
type Key = string | number
interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
interface Props {
  columns: unknown[];
  apiFunction: (arg0: unknown) => Promise<BaseAPIResult<PageResult>>;
  search: { label: string; key: string; defaultValue?: string; componentProps?: Record<string, unknown>;component?: Component; }[];
  searchParams: Record<string, unknown>;
  multiple: string;
  rowSelection: boolean;
}

export const GlobalTable = defineComponent({
  props: ['multiple', 'columns', 'apiFunction', 'search', 'searchParams', 'rowSelection'],

  setup (props: Props) {
    const dataSource = ref<unknown[]>([])
    const loading = ref(false)
    const formState = ref<Record<string, string | number | undefined>>({})
    const state = reactive<{
      selectedRowKeys: Key[];
      selectedRows: { id: string; }[];
    }>({
      selectedRowKeys: [],
      selectedRows: []
    })
    onMounted(async () => {
      getTableData()
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
    const getTableData = async (): Promise<void> => {
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
    }
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }
    const reset = (): void => {
      props.search.forEach(e => {
        formState.value[e.key] = e.defaultValue ? e.defaultValue : undefined
      })
      queryForm()
    }
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

    return () => {
      return (
    <>

    {(props.search && props.search.length > 0) && form}
          <Table
            columns={props.columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size='small'
            rowSelection={props.rowSelection ? rowSelection.value : props.rowSelection}
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
    </>
      )
    }
  }
})
