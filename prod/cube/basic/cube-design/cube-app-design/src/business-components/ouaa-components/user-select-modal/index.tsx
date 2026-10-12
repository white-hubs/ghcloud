import { Button, Input, PopOver, Space } from '@ghcloud/cube-ui'
import { defineComponent, nextTick, reactive } from 'vue'
import { useCubeModal } from '../../../base-components/cube-modal/use-modal'
import { useCubeTable } from '../../../base-components/cube-table/use-table'
import styles from './index.module.less'
import { cubeOuaaService } from '../../../api/service'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import { DeptCascaderSelect } from '../dept-cascader-select'
import { RoleSelect } from '../role-select'
import { PostSelect } from '../post-select'

interface Props {
  title: string;
  filterEnabled?: boolean;
  multiple?: boolean;
}
/** 用户选择弹窗 */
export const UserSelectModal = defineComponent({
  props: ['title', 'filterEnabled', 'multiple'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {


    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: '900px',
      onConfirm: async () => {
        emit('enter', tableApi.getSelectedRows() as PersonItem[] || [])
        modalApi.close()
      },
      onCancel: () => {
        emit('cancel')
        modalApi.close()
      }
    })
    const openModal = (keys?: string[]): void => {
      modalApi.open()
      void nextTick(() => {
        tableApi.setSelectedRowKeys(keys || [])
      })
    }
    expose({
      openModal
    })

    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属部门',
        dataIndex: 'organization',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: PersonItem; }): JSX.Element => {
          const organizationName = record?.organization?.name || '--'
          return <PopOver content={organizationName || '--'}>{organizationName || '--'}</PopOver>
        }
      },
      {
        title: '角色',
        dataIndex: 'roles',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: PersonItem; }): JSX.Element => {
          const roleNames = record?.roles?.map((item) => item.name)?.join(',') || '--'
          return <PopOver content={roleNames || '--'}>{roleNames || '--'}</PopOver>
        }
      },
    ]

    const state = reactive({
      keyword: undefined,
      organizationId: undefined,
      positionId: undefined,
      roleId: undefined,
    })
    const [TargetTable, tableApi] = useCubeTable({
      columns,
      rowSelection: (props.multiple ?? false) ? 'checkbox' : 'radio',
      rowKey: 'id',
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: 'default', // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          tableApi.setState({
            pagination: {
              ...(tableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current
            },
          })
          tableApi.query()
        }
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        return cubeOuaaService.getStaffPage({
          pageSize: params?.pageSize as number || 10,
          pageNumber: params?.current as number || 1,
          enabled: props.filterEnabled ?? true,
          keyword: state.keyword,
          organizationId: state.organizationId,
          positionId: state.positionId,
          roleId: state.roleId,
        })
      }
    })

    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <>
            <Space>
              <Input v-model:value={state.keyword} placeholder='名称' />
              <DeptCascaderSelect
                v-model:value={state.organizationId}
                placeholder='所属部门'
                class={styles['wide-select']}
              />
              <RoleSelect
                v-model:value={state.roleId}
                class={styles['wide-select']}
              />
              <PostSelect
                v-model:value={state.positionId}
                class={styles['wide-select']}
              />
              <Button
                type='primary' onClick={() => {
                  tableApi.resetFetch()
                }}
              >搜索
              </Button>
              <Button onClick={() => {
                state.keyword = undefined
                state.organizationId = undefined
                state.positionId = undefined
                state.roleId = undefined
                tableApi.resetFetch()
              }}
              >重置
              </Button>
            </Space>
            <div style={{ marginTop: '12px' }}>
              <TargetTable />
            </div>
          </>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})
