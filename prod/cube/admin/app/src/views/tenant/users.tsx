import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Table,
  Button,
  Space,
  message,
  Modal,
  Select,
  SelectOption,
  Switch,
  type TableColumnsType
} from 'ant-design-vue'
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useAuthRequest } from '@/hooks/auth-request'
import { addTenantUser, deleteTenantUser, listTenantUsers, listUserNotExistTenant, updateTenantUser, type User } from '@ghcloud/cube-ouaa-service'
import { logger } from '@/logger'

interface UserTenant {
  id: string;
  tenant: number;
  userId: string;
  admin: boolean;
  user: {
    username: string;
    name: string;
  };
  enabled: boolean;
}

export const TenantUsers = defineComponent({
  setup () {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const searchAccount = ref('')
    const showAddModal = ref(false)
    const associating = ref(false)
    const filterAdmin = ref<boolean | null>(null)
    const filterEnabled = ref<boolean | null>(null)

    // 从路由参数获取租户信息
    const tenant = computed(() => route.query.tenant as string || '')

    // 可关联的已有用户（下拉候选）
    const candidateLoading = ref(false)
    const candidateKeyword = ref('')
    const candidateUsers = ref<User[]>([])
    const selectedUserIds = ref<string[]>([])

    // 分页配置
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total: number) => `共 ${total} 条`
    })

    // 表格数据
    const tableData = ref<UserTenant[]>([])

    // 表格列配置
    const columns: TableColumnsType<UserTenant> = [
      {
        title: '用户 ID',
        dataIndex: 'userId',
        key: 'userId',
        width: 150
      },
      {
        title: '用户帐号',
        dataIndex: ['user', 'username'],
        key: 'username',
        width: 150
      },
      {
        title: '用户昵称',
        dataIndex: ['user', 'name'],
        key: 'name',
        width: 150
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        key: 'enabled',
        width: 100,
        customRender: ({ record }: { record: UserTenant; }): JSX.Element => {
          return (
            <Switch
              checked={record.enabled}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              onChange={(checked: boolean) => {
                handleStatusChange(record.userId, checked)
              }}
            />
          )
        }
      },
      {
        title: '租户管理员',
        dataIndex: 'admin',
        key: 'admin',
        width: 100,
        customRender: ({ record }: { record: UserTenant; }): JSX.Element => {
          return (
            <Switch
              checked={record.admin}
              checkedChildren="是"
              unCheckedChildren="否"
              onChange={(checked: boolean) => {
                handleAdminChange(record.userId, checked)
              }}
            />
          )
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        fixed: 'right',
        customRender: ({ record }: { record: UserTenant; }): JSX.Element => {
          return (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                handleDelete(record.userId)
              }}
            >
              删除
            </Button>
          )
        }
      }
    ]

    // 获取用户列表
    const fetchUserList = async (): Promise<void> => {
      if (!tenant.value) {
        message.warning('缺少租户信息')
        return
      }

      loading.value = true
      try {
        const adminFilter = filterAdmin.value === null ? undefined : filterAdmin.value
        const enabledFilter = filterEnabled.value === null ? undefined : filterEnabled.value
        const data = await useAuthRequest(() => listTenantUsers({
          tenantId: tenant.value,
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          keyword: searchAccount.value ? searchAccount.value.trim() : undefined,
          admin: adminFilter,
          enabled: enabledFilter
        }))
        pagination.total = data.total
        pagination.current = data.currentPage
        tableData.value = data.records as UserTenant[]
      } catch (error) {
        message.error('获取用户列表失败')
        logger.error('Failed to fetch user list', error)
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = (): void => {
      pagination.current = 1
      fetchUserList()
    }

    const handleAdminFilterChange = (value: boolean | null): void => {
      filterAdmin.value = value
      pagination.current = 1
      fetchUserList()
    }

    const handleEnabledFilterChange = (value: boolean | null): void => {
      filterEnabled.value = value
      pagination.current = 1
      fetchUserList()
    }

    // 分页变化
    const handleTableChange = (pag: { current: number; pageSize: number; }): void => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      fetchUserList()
    }

    // 打开关联用户弹窗
    const handleAdd = (): void => {
      selectedUserIds.value = []
      candidateKeyword.value = ''
      candidateUsers.value = []
      showAddModal.value = true
    }

    // 远程搜索已有用户（模拟数据，预留接口）
    const fetchCandidateUsers = async (keyword: string): Promise<void> => {
      candidateLoading.value = true
      try {
        const data = await useAuthRequest(() => listUserNotExistTenant({
          keyword: keyword,
          tenant: tenant.value,
          pageNumber: pagination.current,
          pageSize: pagination.pageSize
        }))
        pagination.total = data.total
        pagination.current = data.currentPage
        candidateUsers.value = data.records
      } finally {
        candidateLoading.value = false
      }
    }

    // 提交关联
    const handleSubmit = async (): Promise<void> => {
      if (!selectedUserIds.value.length) {
        message.warning('请至少选择一个用户')
        return
      }
      associating.value = true
      try {
        await useAuthRequest(() => addTenantUser({
          tenant: tenant.value,
          userIds: selectedUserIds.value
        }))
        message.success('关联用户成功')
        showAddModal.value = false
        fetchUserList()
      } catch (error) {
        logger.error(error)
      } finally {
        associating.value = false
      }
    }

    // 状态变更
    const handleStatusChange = async (userId: string, status: boolean): Promise<void> => {
      try {
        await useAuthRequest(() => updateTenantUser({
          tenant: tenant.value,
          userId: userId,
          enabled: status
        }))

        const user = tableData.value.find(item => item.userId === userId)
        if (user) {
          user.enabled = status
        }
        message.success(status ? '已启用' : '已禁用')
      } catch (error) {
        message.error('状态更新失败')
        logger.error(error)
      }
    }

    // 租户管理员变更
    const handleAdminChange = async (userId: string, admin: boolean): Promise<void> => {
      try {
        await useAuthRequest(() => updateTenantUser({
          tenant: tenant.value,
          userId: userId,
          admin: admin
        }))

        const user = tableData.value.find(item => item.userId === userId)
        if (user) {
          user.admin = admin
        }
        message.success(admin ? '已设置为租户管理员' : '已取消租户管理员')
      } catch (error) {
        message.error('租户管理员设置失败')
        logger.error(error)
      }
    }

    // 删除用户
    const handleDelete = (userId: string): void => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除该用户吗？',
        onOk: async () => {
          try {
            await useAuthRequest(() => deleteTenantUser({
              tenant: tenant.value,
              userId: userId
            }))
            message.success('删除成功')
            fetchUserList()
          } catch (error) {
            message.error('删除失败')
            logger.error(error)
          }
        }
      })
    }

    onMounted(() => {
      if (tenant.value) {
        fetchUserList()
      } else {
        message.warning('缺少租户信息，将返回租户列表')
        setTimeout(() => {
          router.push('/tenant/list')
        }, 2000)
      }
    })

    return (): JSX.Element => (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
            租户名称：{tenant.value || '-'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space align="center" size={16}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>是否为租户管理员：</span>
                <Select
                  style={{ width: '140px' }}
                  value={filterAdmin.value}
                  onChange={handleAdminFilterChange}
                >
                  <SelectOption value={null}>全部</SelectOption>
                  <SelectOption value={true}>租户管理员</SelectOption>
                  <SelectOption value={false}>普通用户</SelectOption>
                </Select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>启用状态：</span>
                <Select
                  style={{ width: '140px' }}
                  value={filterEnabled.value}
                  onChange={handleEnabledFilterChange}
                >
                  <SelectOption value={null}>全部状态</SelectOption>
                  <SelectOption value={true}>已启用</SelectOption>
                  <SelectOption value={false}>已禁用</SelectOption>
                </Select>
              </div>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              关联用户
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={tableData.value}
          loading={loading.value}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
        <Modal
          title="关联已有用户"
          open={showAddModal.value}
          onOk={handleSubmit}
          onCancel={() => {
            showAddModal.value = false
          }}
          width={600}
          confirmLoading={associating.value}
        >
          <div>
            <div style={{ marginBottom: '8px' }}>选择要关联的用户</div>
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder="搜索并选择已有用户（支持帐号/昵称）"
              v-model:value={selectedUserIds.value}
              loading={candidateLoading.value}
              style={{ width: '100%' }}
              filterOption={false}
              onSearch={(val: string) => {
                candidateKeyword.value = val
                fetchCandidateUsers(val)
              }}
              onDropdownVisibleChange={(open: boolean) => {
                if (open && candidateUsers.value.length === 0) {
                  fetchCandidateUsers(candidateKeyword.value)
                }
              }}
            >
              {candidateUsers.value.map(user => (
                <SelectOption value={user.id} key={user.id}>
                  {user.name}（{user.mobile}）
                </SelectOption>
              ))}
            </Select>
          </div>
        </Modal>
      </div>
    )
  }
})

