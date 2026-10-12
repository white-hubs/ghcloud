import { defineComponent, reactive, ref, onMounted, computed } from 'vue'
import { Modal, Button, Form, FormItem, Input, Select, SelectOption, Page, Table, PopOver } from '@ghcloud/cube-ui'
import { CloseOutlined } from '@ant-design/icons-vue'
import styles from './select-user.module.less'
import { Checkbox } from 'ant-design-vue'
import type { CheckboxChangeEvent } from 'ant-design-vue/es/checkbox/interface'
import { cubeOuaaService } from '@/api/service'
import type { PersonItem, UserInfo } from '@ghcloud/cube-ouaa-service'

interface DepartmentOption {
  label: string;
  value: string;
}

/**
 * 人员选择组件
 */
export const SelectUser = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    defaultSelectedUsers: {
      type: Array as () => UserInfo[],
      default: () => []
    }
  },
  emits: ['cancel', 'confirm'],
  setup: (props, { emit }) => {
    // 部门选项
    const departments = ref<DepartmentOption[]>([])

    // 表单状态
    const formState = reactive({
      department: '',
      userName: ''
    })

    // 用户数据
    const userData = ref<PersonItem[]>([])

    // 选中的用户
    const selectedUsers = ref<UserInfo[]>(props.defaultSelectedUsers || [])

    // 分页信息
    const pagination = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })

    // 全选状态
    const selectAll = ref(false)

    // 加载状态
    const loading = ref(false)

    /**
     * 加载用户数据
     */
    const loadUserData = async (): Promise<void> => {
      loading.value = true
      try {
        const { records, total } = await cubeOuaaService.getStaffPage({
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          keyword: formState.userName || undefined,
          organizationId: formState.department || undefined,
          enabled: true
        })
        userData.value = records
        pagination.total = total
      } finally {
        loading.value = false
      }
    }

    /**
     * 处理搜索
     */
    const handleSearch = (): void => {
      pagination.pageNumber = 1 // 重置到第一页
      loadUserData()
    }

    /**
     * 重置搜索条件
     */
    const handleReset = (): void => {
      formState.department = ''
      formState.userName = ''
      pagination.pageNumber = 1 // 重置到第一页
      loadUserData()
    }

    /**
     * 处理用户选择变化
     */
    const handleUserSelect = (record: PersonItem, checked: boolean): void => {
      if (checked) {
        selectedUsers.value = [...selectedUsers.value, record as unknown as UserInfo]
      } else {
        selectedUsers.value = selectedUsers.value.filter(user => user.id !== record.id)
      }
    }

    /**
     * 处理全选/取消全选
     */
    const handleSelectAll = (checked: boolean): void => {
      selectAll.value = checked
      if (checked) {
        // 将当前页的所有用户添加到选中列表
        const currentPageUsers = userData.value.filter(user =>
          !selectedUsers.value.some(selected => selected.id === user.id))
        selectedUsers.value = [...selectedUsers.value, ...currentPageUsers as unknown as UserInfo[]]
      } else {
        // 从选中列表中移除当前页的所有用户
        const currentPageUserIds = userData.value.map(user => user.id)
        selectedUsers.value = selectedUsers.value.filter(user =>
          !currentPageUserIds.includes(user.id))
      }
    }

    /**
     * 处理分页变化
     */
    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      pagination.pageNumber = pageNumber
      pagination.pageSize = pageSize
      loadUserData()
    }

    /**
     * 取消选择
     */
    const handleCancel = (): void => {
      emit('cancel')
    }

    /**
     * 确认选择
     */
    const handleConfirm = (): void => {
      emit('confirm', selectedUsers.value)
    }

    /**
     * 检查用户是否已选中
     */
    const isUserSelected = (userId: string): boolean => {
      return selectedUsers.value.some(user => user.id === userId)
    }

    /**
     * 检查当前页是否全选
     */
    const isCurrentPageAllSelected = computed(() => {
      if (userData.value.length === 0) return false
      return userData.value.every(user => isUserSelected(user.id))
    })

    // 表格列定义
    const columns = [
      {
        title: (): JSX.Element => (
          <Checkbox
            checked={isCurrentPageAllSelected.value}
            onChange={(e: CheckboxChangeEvent) => handleSelectAll(e.target.checked)}
          />
        ),
        dataIndex: 'selected',
        key: 'selected',
        width: 50,
        customRender: ({ record }: { record: PersonItem; }): JSX.Element => (
          <Checkbox
            checked={isUserSelected(record.id)}
            onChange={(e: CheckboxChangeEvent) => handleUserSelect(record, e.target.checked)}
          />
        )
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '联系方式',
        dataIndex: 'mobile',
        key: 'mobile',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '部门',
        dataIndex: 'organization',
        key: 'organization',
        customRender: ({ record }: { record: PersonItem; }): JSX.Element=> {
          const label = record?.organization
          return <PopOver content={label?.name || '--'}>{label?.name || '--'}</PopOver>
        }
      },
      {
        title: '岗位',
        dataIndex: 'positions',
        key: 'positions',
        customRender: ({ record }: { record: PersonItem; }): JSX.Element=> {
          const label = record?.positions?.map(item => item.name).join('、')
          return <PopOver content={label || '--'}>{label || '--'}</PopOver>
        }
      },
      {
        title: '角色',
        dataIndex: 'roles',
        key: 'roles',
        customRender: ({ record }: { record: PersonItem; }): JSX.Element=> {
          const label = record?.roles?.map(item => item.name).join('、')
          return <PopOver content={label || '--'}>{label.length > 10 ? label.substring(0, 10) + '...' : label || '--'}</PopOver>
        }
      }
    ]

    onMounted(async () => {
      const options = await cubeOuaaService.getDept({ enabled: true })
      departments.value = options.map(option => ({
        label: option.name,
        value: option.id
      }))
      departments.value.unshift({
        label: '全部',
        value: ''
      })
      loadUserData()
    })

    return (): JSX.Element => (
      <Modal
        title="添加人员"
        visible={props.visible}
        width={800}
        onCancel={handleCancel}
        footer={null}
        closeIcon={<CloseOutlined />}
      >
        <div class={styles['select-user']}>
          {/* 搜索表单 */}
          <Form class={styles['search-form']}>
            <div class={styles['form-row']}>
              <FormItem label="部门">
                <Select
                  v-model:value={formState.department}
                  style={{ width: '120px' }}
                >
                  {departments.value.map(dept => (
                    <SelectOption key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectOption>
                  ))}
                </Select>
              </FormItem>
              <FormItem label="人员名称">
                <Input
                  v-model:value={formState.userName}
                  placeholder="请输入人员名称"
                  style={{ width: '200px' }}
                />
              </FormItem>
              <FormItem >
                <div class={styles['form-buttons']}>
                  <Button type="primary" onClick={handleSearch}>
                    查询
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                </div>
              </FormItem>
            </div>
          </Form>

          {/* 用户表格 */}
          <Table
            columns={columns}
            dataSource={userData.value}
            loading={loading.value}
            pagination={false}
            rowKey="id"
            class={styles['user-table']}
            scrollY={380}
          />

          {/* 分页 */}
          <div class={styles['pagination-wrapper']}>
            <Page
              current={pagination.pageNumber}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger={true}
              showQuickJumper={false}
              onPageChange={handlePageChange}
              showTotal={(total: number, range: [number, number]) =>
                `共 ${total} 条 第${range[0]}-${range[1]} 条`
              }
            />
          </div>

          {/* 底部按钮 */}
          <div class={styles['modal-footer']}>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" onClick={handleConfirm}>
              确定
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
})