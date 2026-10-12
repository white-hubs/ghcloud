import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Input, Button, Table, Select, PopConfirm, InputNumber, CheckOutlined, EditOutlined, Switch, message, AntModal } from '@ghcloud/cube-ui'
import { deletePoint, getPointList, updatePoint } from '@/apis/point-manage'
import { getAreaList } from '@/apis/region-manage'
import styles from './index.module.less'
export const PointManage = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      areaOptions: unknown[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        areaId: string | null;
        keyword: string;
        sequence: boolean;
        state: string;
      };
    }>({
      loading: false,
      dataSource: [],
      areaOptions: [],
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        areaId: null,
        keyword: '',
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
        const  data  = await getPointList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const getAreaOption = async (): Promise<void> => {
      const { data } = await getAreaList({ pageNumber: 1, pageSize: 10000 })
      state.areaOptions = data.records
    }
    const handleAddPoint = (): void => {
      history.pushState({}, '', '/portal/tj-electronic-guide/point-edit')
    }
    const columns = [
      {
        title: '点位名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
      },
      {
        title: '点位坐标',
        dataIndex: 'coordinate',
        key: 'coordinate',
      },
      {
        title: '点位地址',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: '点位介绍',
        dataIndex: 'remarks',
        key: 'remarks',
        customRender: ({ text }: { text: string; }) => {
          return text || '--'
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
                  title: `是否确认${record.state === 'ENABLE' ? '启用' : '禁用'}点位${record.name}`,
                  onOk: async () => {
                    await updatePoint(record)
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
                onConfirm={async () => { handleDeletePoint(record) }}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const handleSaveCell = async (record: Record<string, string>): Promise<void> => {
      await updatePoint(record)
      editableData[record.id] = null
      message.success('保存成功')
    }
    const handleEditCell = (key: string): void => {
      editableData[key] = true
    }
    const handleEdit = (row: unknown): void => {
      history.pushState({}, '', `/portal/tj-electronic-guide/point-edit?id=${(row as { id: string; }).id}`)
    }
    const handleDeletePoint = async (row: unknown): Promise< void> => {
      await deletePoint((row as { id: string; }).id)
      message.success('删除成功')
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.keyword = ''
      state.searchParams.areaId = null
      getList()
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(() => {
      getAreaOption()
      getList()
    })
    const layoutSlots = {
      'header-btn': () => {
        return (
          <Button
            type='primary'
            onClick={handleAddPoint}
          >新增
          </Button>
        )
      },
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem label='所在区域'>
              <Select fieldNames={{ value: 'id', label: 'name' }} allowClear v-model:value={state.searchParams.areaId} options={state.areaOptions} style={{ width: '200px' }} />
            </FormItem>
            <FormItem>
              <Input placeholder='点位名称' v-model:value={state.searchParams.keyword} />
            </FormItem>

            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
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
    return () => <GLayout title='点位管理' v-slots={layoutSlots} />
  }
})
