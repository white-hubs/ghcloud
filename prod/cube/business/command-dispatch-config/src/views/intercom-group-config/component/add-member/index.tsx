import { AntModal, Table, Form, FormItem, Input, Button, PopOver, message } from '@ghcloud/cube-ui'
import { defineComponent, reactive, watch, type PropType } from 'vue'
import { GPagination } from '@/components/common/pagination'
import { getDevicePage, addRelationMember } from '@/apis/intercom-group-config'
import dayjs from 'dayjs'
// type Key = string
export const AddMember = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    groupCode: {
      type: String,
      default: ''
    },
    selectedKeys: {
      type: Array as PropType<string[]>,
      default: []
    }
  },
  emits: ['update:visible', 'getList'],
  setup: (props, { emit }) => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      confirmLoading: boolean;
      selectedRowKeys: string[];
      searchParams: {
        keyword: string;
        pageNumber: number;
        pageSize: number;
        total: number;
      };
    }>({
      loading: false,
      confirmLoading: false,
      dataSource: [],
      selectedRowKeys: [],
      searchParams: {
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      }
    })
    const handleOk = async (): Promise<void> => {
      if (state.selectedRowKeys.length === 0) {
        message.error('请选择成员')
      }
      try {
        state.confirmLoading = true
        await addRelationMember({ code: props.groupCode, deviceCodes: state.selectedRowKeys.join(',') })
        message.success('添加成功')
        state.selectedRowKeys = []
        state.searchParams.pageNumber = 1
        state.searchParams.keyword = ''
        emit('getList')
        emit('update:visible', false)
      } catch {
      } finally {
        state.confirmLoading = false
      }
    }
    const handleCancel = (): void => {
      emit('update:visible', false)
    }
    const getDataSource = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getDevicePage(state.searchParams)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    watch(() => props.visible, () => {
      if (props.visible) {
        state.searchParams.pageNumber = 1
        state.searchParams.pageSize = 10
        state.searchParams.keyword = ''
        getDataSource()
      }
    })
    watch(() => props.selectedKeys, () => {
      state.selectedRowKeys = props.selectedKeys
    })
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getDataSource()
    }
    const columns = [
      {
        title: '账号名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '号码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '账号等级',
        dataIndex: 'deviceLevel',
        key: 'deviceLevel',
      },
      {
        title: '所属对讲组',
        dataIndex: 'groups',
        key: 'groups',
        ellipsis: true,
        width: 300,
        customRender: ({ text }: { text: { id: string; name: string; }[]; }): JSX.Element => {
          const value = text ? text.map(item => item.name).join(',') : '--'
          return (
            <PopOver content={value}>
              {value}
            </PopOver>
          )
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        customRender: ({ text }: { text: string; }): string=> {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
    ]
    const onSelectChange = (record: Record<string, string>, selected: boolean): void => {
      if (selected) {
        state.selectedRowKeys.push(record.code)
      } else {
        const unSelectIndex = state.selectedRowKeys.findIndex(item => item === record.code)
        if (unSelectIndex === -1) return
        state.selectedRowKeys.splice(unSelectIndex, 1)
      }
    }
    const onSelectAllChange = (selected: boolean, selectedRows: Record<string, string>[], changeRows: Record<string, string>[]): void => {
      if (selected) {
        const selectedRowsKeys = changeRows.map(item => item.id)
        state.selectedRowKeys = [...state.selectedRowKeys, ...selectedRowsKeys]
      } else {
        const unSelectedRowsKeys = changeRows.map(item => item.code)
        state.selectedRowKeys = state.selectedRowKeys.filter(item => !unSelectedRowsKeys.includes(item))
      }
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getDataSource()
    }
    return (): JSX.Element=> (
      <>
        <AntModal
          v-model:visible={props.visible}
          title='添加成员'
          width={1000}
          maskClosable={false}
          confirmLoading={state.loading}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div style={{ padding: '10px 0' }}>
            <Form layout='inline'>
              <FormItem>
                <Input placeholder='账号名称/号码' v-model:value={state.searchParams.keyword} />
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={() => {
                    state.searchParams.keyword = ''
                    state.searchParams.pageNumber = 1
                    getDataSource()
                  }}
                  >重置
                  </Button>
                </div>
              </FormItem>
            </Form>
          </div>

          <Table
            columns={columns}
            dataSource={state.dataSource}
            loading={state.loading}
            size='small'
            pagination={false}
            rowKey='code'
            rowSelection={{ selectedRowKeys: state.selectedRowKeys, onSelect: onSelectChange, onSelectAll: onSelectAllChange }}
          />
          <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end' }}>
            <GPagination
              current={state.searchParams.pageNumber}
              pageSize={state.searchParams.pageSize}
              total={state.searchParams.total ?? 0}
              onChange={changePage}
            />
          </div>

        </AntModal>
      </>
    )
  }
})
