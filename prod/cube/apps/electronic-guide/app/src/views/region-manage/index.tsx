import { defineComponent, reactive, onMounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, PopConfirm, message, EditOutlined, CheckOutlined, InputNumber, Switch, AntModal } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { deleteArea, getAreaListTree, updateArea } from '@/apis/region-manage'
import { useScrollHook } from '@/hooks/table-scroll-hook'
import styles from './index.module.less'
import { usePageName } from '@ghcloud/cube-utils'
import { AliasTable } from '@ghcloud/generic-component'

export const RegionManage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const { scrollY } = useScrollHook()
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
    const defaultExpandedRowKeys = ref<string[]>([])
    const getList = async (): Promise<void> => {
      try {
        try {
          state.loading = true
          const { data } = await getAreaListTree()
          defaultExpandedRowKeys.value = [data[0].id]
          state.dataSource = data
        } catch {
        } finally {
          state.loading = false
        }
      } catch {
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
        customRender: ({ text }: { text: number; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '开关',
        dataIndex: 'state',
        key: 'state',
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
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
        dataIndex: 'sort',
        key: 'sort',
        sorter: true,
        sortOrder: false,
        showSorterTooltip: false,
        sortDirections: ['ascend', 'descend'],
        customHeaderCell: (): { onClick: () => void; }=> {
          return {
            onClick: (): void => {
              state.searchParams.sequence = !state.searchParams.sequence
              getList()
            }
          }
        },
        customRender: ({ text, record }: { text: number;record: Record<string, string>; }): JSX.Element => {
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
                  <EditOutlined class={styles['editable-cell-icon']} onClick={() => {
                    handleEditCell(record.id)
                  }} />
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
        customRender: ({ record }: { record: unknown; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleEdit(record)
              }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={async () => {
                  handleDeleteArea(record)
                }}
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
    onMounted(() => {
      getList()
    })
    const handleAddArea = (): void => {
      history.pushState({}, '', '/portal/electronic-guide/region-edit')
    }
    const handleEdit = (row: unknown): void => {
      history.pushState({}, '', `/portal/electronic-guide/region-edit?id=${(row as { id: string; }).id}`)
    }
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <Button
            type='primary'
            onClick={handleAddArea}
          >新增
          </Button>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            {!!state.dataSource.length && <AliasTable applicationCode='ELECREONIC_GUIDE' defaultExpandedRowKeys={defaultExpandedRowKeys.value} rowKey='id' tableCode='REGION_MANAGE' columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} scrollY={scrollY.value} />}

          </>
        )
      }
    }
    return (): JSX.Element => <GLayout title={pageTitle} v-slots={layoutSlots} />
  }
})
