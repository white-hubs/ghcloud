import { defineComponent, reactive, type PropType } from 'vue'
import { Modal, Table, Form, FormItem, Button, Input } from '@ghcloud/cube-ui'
import { getStaffPage, getPositionList, getRoleList, deptList } from '../api/ouaa/index'
import type { TablePaginationConfig } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table/interface'
export const OrgPicker = defineComponent({
  emits: ['close'],
  props: {
    activeId: {
      type: Array,
      default: () => ([])
    },
    title: {
      type: String,
      default: ''
    },
    selectedRows: {
      type: Array as PropType<{ id: string; }[]>,
      default: () => ([])
    },
    url: {
      type: String,
      default: ''
    },
    selectionType: {
      type: String,
      default: ''
    },
    search: {
      type: Array,
      default: () => ([])
    },
    searchParams: {
      type: Array,
      default: () => ([])
    },
    columns: {
      type: Array,
      default: () => ([])
    },
    disabledId: {
      type: Array,
      default: () => ([])
    }
  },
  setup: (props, { expose, emit }) => {
    const urlObj: any = {
      getStaffPage: {
        label: '名称',
        value: 'keyword',
        url: getStaffPage
      },
      getPositionList: {
        label: '岗位',
        value: 'name',
        url: getPositionList
      },
      getRoleList: {
        label: '角色',
        value: 'name',
        url: getRoleList
      },
      deptList: {
        label: '部门',
        value: 'name',
        url: deptList
      },
    }
    const state = reactive<{
      modalVisible: boolean;
      dataSource: unknown[];
      selectedRows: { id: string; }[];
      selectedRowKeys: unknown[];
      selected: { id: string; }[];
      form: Record<string, string>;
      pagination: TablePaginationConfig;
    }>({
      modalVisible: false,
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: props.activeId,
      selected: [],
      form: {},
      pagination: {
        total: 0,
        pageSize: 10,
        current: 1
      }
    })
    const selectionChange = (keys: unknown[], selectedRows: { id: string; }[]): void => {
      state.selectedRowKeys = keys
      selectedRows.forEach((item) => {
        if (item) {
          const index = (state.selectedRows as { id: string; }[]).findIndex(s => s.id === item.id)
          if (index === -1) {
            (state.selectedRows).push(item)
          }
        }
      })
    }
    const getFilter = (): void => {
      state.selected = []
      state.selectedRows.forEach((item: { id: string; }) => {
        if (state.selectedRowKeys.includes(item?.id)) {
          state.selected.push(item)
        }
      })
    }

    const getData = async (): Promise<void> => {
      state.form[urlObj[props.url].value] = state.form.keyword
      const formParams = {
        ...state.form,
        date: null,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize
      }
      if (props.url) {
        const res = await urlObj[props.url].url(formParams)
        if (res.data?.records) {
          state.dataSource = res.data?.records ?? []
          state.pagination.total = res.data?.total ?? 0
        } else {
          state.dataSource = res.data as unknown as unknown[] ?? []
          state.pagination.total = (res.data as unknown as unknown[]).length ?? 0
        }
        getFilter()
      }
    }
    const show = (): void => {
      state.selectedRowKeys.length = 0
      if (props.activeId) {
        state.selectedRowKeys.length = 0
        state.selectedRowKeys.push(...props.activeId)
      }
      state.selectedRows = props.selectedRows
      state.modalVisible = true
      getData()
    }
    const close = (data: unknown) => {
      state.form.keyword = ''
      if (data === 'ok') {
        getFilter()
        emit('close', state.selected)
      } else {
        emit('close')
      }
      reset()
      state.modalVisible = false
    }
    const changePage = (e: TablePaginationConfig): void => {
      state.pagination.current = e.current!
      state.pagination.pageSize = e.pageSize!
      getData()
    }
    const reset = (): void => {
      state.pagination.pageSize = 10
      state.pagination.current = 1
      state.form.keyword = ''
      getData()
    }

    const query = (): void => {
      state.pagination.current = 1
      getData()
    }
    // 使用 expose 暴露组件内部的方法
    expose({ show })
    return (): JSX.Element =>
      <>
        <Modal
          v-model:visible={state.modalVisible} width='1000px' title={`${props.title} 列表`} centered
          class='org-picker-modal'
          onCancel={close} onOk={() => { close('ok') }}
        >
          <Form style='margin-bottom:10px' v-show={props.search.length > 0} layout='inline' model={state.form} class='modal-form'>
            <FormItem label={urlObj[props.url].label}>
              <Input v-model:value={state.form.keyword} />
            </FormItem>
            <FormItem>
              <Button type='primary' onClick={query}>查询</Button>
            </FormItem>
            <FormItem>
              <Button onClick={reset}>重置</Button>
            </FormItem>
          </Form>
          <Table
            rowKey='id' dataSource={state.dataSource} columns={props.columns}
            rowSelection={{ preserveSelectedRowKeys: true, selectedRowKeys: state.selectedRowKeys, onChange: selectionChange }}
            onChange={changePage}
            pagination={state.pagination} size='middle'
          />
        </Modal>
      </>
  }
})
