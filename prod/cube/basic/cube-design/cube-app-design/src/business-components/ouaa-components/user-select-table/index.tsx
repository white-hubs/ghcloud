import { Button, Input, PopOver } from '@ghcloud/cube-ui'
import { defineComponent, reactive, watch } from 'vue'
import { useCubeTable } from '../../../base-components/cube-table/use-table'
import styles from './index.module.less'
import { cubeOuaaService } from '../../../api/service'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import { DeptCascaderSelect } from '../dept-cascader-select'
import { RoleSelect } from '../role-select'
import { PostSelect } from '../post-select'

interface Props {
  filterEnabled?: boolean;
  multiple?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedRows: PersonItem[]) => void;
}

/** 用户选择表格组件 */
export const UserSelectTable = defineComponent({
  props: ['filterEnabled', 'multiple', 'selectedKeys', 'onSelectionChange'],
  setup (props: Props) {
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
        current: 1,
        pageSize: 10,
        total: 0,
        size: 'default',
        showSizeChanger: true,
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
      },
      rowSelectionChange: (selectedRowKeys: unknown[], selectedRows: unknown[]) => {
        // selectedRowKeys 未使用，但需要保持函数签名一致
        void selectedRowKeys
        if (props.onSelectionChange) {
          props.onSelectionChange(selectedRows as PersonItem[])
        }
      }
    })

    // 监听 selectedKeys 变化，更新表格选中状态
    watch(() => props.selectedKeys, (newKeys) => {
      if (newKeys && newKeys.length > 0) {
        tableApi.setSelectedRowKeys(newKeys)
      }
    }, { immediate: true })

    return (): JSX.Element => {
      return (
        <div class={styles.tableContainer}>
          <div class={styles.searchBar}>
            <Input v-model:value={state.keyword} placeholder='名称' style={{ width: '180px' }} />
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
          </div>
          <div class={styles.tableWrapper}>
            <TargetTable />
          </div>
        </div>
      )
    }
  }
})

