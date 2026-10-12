import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, PopConfirm, Table, message, EditOutlined, CheckOutlined, InputNumber, Switch, AntModal } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { deleteArea, getAreaList, updateArea } from '@/apis/region-manage'
import styles from './index.module.less'
export const RegionManage = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        keyword: string;
        period: string;
        state: string;
        sequence: boolean;
      };
    }>({
      loading: false,
      dataSource: [],
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        keyword: '',
        period: '',
        sequence: true,
        state: 'ALL'
      }
    })
    const editableData = reactive<Record<string, unknown>>({})
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
        }
        const data = await getAreaList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '区域名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '区域坐标',
        dataIndex: 'coordinate',
        key: 'coordinate',
      },

      {
        title: '添加时间',
        dataIndex: 'createTime',
        key: 'createTime',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '开关',
        dataIndex: 'state',
        key: 'state',
        customRender: ({ record }: { record: Record<string, string>; }) => {
          return (
            <Switch
              v-model:value={record.state} checkedValue='ENABLE' unCheckedValue='DISABLE' checkedChildren='开' unCheckedChildren='关' onChange={() => {
                AntModal.confirm({
                  title: `是否确认${record.state === 'ENABLE' ? '启用' : '禁用'}区域${record.name}`,
                  onOk: async () => {
                    await updateArea(record)
                    message.success('操作成功')
                    getList()
                  },
                  onCancel: () => {
                    record.state = record.state === 'ENABLE' ? 'DISABLE' : 'ENABLE'
                  }
                })
              }}
            />
          )
        }
      },
      {
        title: '排序',
        dataIndex: 'level',
        key: 'level',
        sorter: true,
        sortOrder: false,
        showSorterTooltip: false,
        sortDirections: ['ascend', 'descend'],
        customHeaderCell: () => {
          return {
            onClick: () => {
              state.searchParams.sequence = !state.searchParams.sequence
              getList()
            }
          }
        },
        customRender: ({ text, record }: { text: number;record: Record<string, string>; }) => {
          return (
            <>

              {editableData[record.id] &&
                <div class={styles['input-wrapper']}>
                  <InputNumber
                    max={999} v-model:value={record.level} placeholder='输入1-999的排序' onPressEnter={async () => handleSaveCell(record)}
                  />
                  <CheckOutlined class={styles['editable-cell-icon-check']} onClick={async () => handleSaveCell(record)} />
                </div>}
              {!editableData[record.id] &&
                <div class={styles['text-wrapper']}>
                  {text}
                  <EditOutlined class={styles['editable-cell-icon']} onClick={() => { handleEditCell(record.id) }} />
                </div>}
            </>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        align: 'center',
        customRender: ({ record }: { record: unknown; }) => {
          return (
            <>
              <Button type='link' onClick={() => { handleEdit(record) }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={async () => { handleDeleteArea(record) }}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const handleEditCell = (key: string): void => {
      editableData[key] = true
    }
    const handleSaveCell = async (record: Record<string, string>): Promise<void> => {
      await updateArea(record)
      editableData[record.id] = null
      message.success('操作成功')
    }
    const handleDeleteArea = async (row: unknown): Promise<void> => {
      await deleteArea((row as { id: string; }).id)
      message.success('删除成功')
      getList()
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(() => {
      getList()
    })
    const handleAddArea = (): void => {
      history.pushState({}, '', '/portal/tj-electronic-guide/region-edit')
    }
    const handleEdit = (row: unknown): void => {
      history.pushState({}, '', `/portal/tj-electronic-guide/region-edit?id=${(row as { id: string; }).id}`)
    }
    const layoutSlots = {
      'header-btn': () => {
        return (
          <Button
            type='primary'
            onClick={handleAddArea}
          >新增
          </Button>
        )
      },
      'content-table': () => {
        return <Table columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} size='small' scrollY={500} />
      },
      'footer-page': () => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return () => <GLayout title='区域管理' v-slots={layoutSlots} />
  }
})
