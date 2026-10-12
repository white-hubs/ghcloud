import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table,
  Input,
  Button,
  Space,
  message,
  type TableColumnsType
} from 'ant-design-vue'
import { SearchOutlined, UserOutlined } from '@ant-design/icons-vue'
import { listTenants, type Tenant } from '@ghcloud/cube-ouaa-service'
import { useAuthRequest } from '@/hooks/auth-request'
import { logger } from '@/logger'

// 日期格式化函数
const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const TenantList = defineComponent({
  setup () {
    const router = useRouter()
    const loading = ref(false)
    const searchName = ref('')

    // 分页配置
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total: number) => `共 ${total} 条`
    })

    // 表格数据
    const tableData = ref<Tenant[]>([])

    // 表格列配置
    const columns: TableColumnsType<Tenant> = [
      {
        title: '租户编号',
        dataIndex: 'code',
        key: 'code',
        width: 150
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 200
      },
      {
        title: '注册时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
        customRender: ({ text }: { text: string; }): string => {
          return formatDateTime(text)
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 180,
        customRender: ({ text }: { text: string; }): string => {
          return formatDateTime(text)
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right',
        customRender: ({ record }: { record: Tenant; }): JSX.Element => {
          return (
            <Button
              type="link"
              icon={<UserOutlined />}
              onClick={() => {
                router.push(`/tenant/users?tenant=${record.code}`)
              }}
            >
              用户管理
            </Button>
          )
        }
      }
    ]

    // 获取租户列表
    const fetchTenantList = async (): Promise<void> => {
      loading.value = true
      try {
        const searchNameIsNumber = searchName.value !== '' && !isNaN(Number(searchName.value))
        const data = await useAuthRequest(() => listTenants({
          code: searchNameIsNumber ? Number(searchName.value) : undefined,
          name: searchName.value || undefined,
          pageNumber: pagination.current,
          pageSize: pagination.pageSize }))
        tableData.value = data.records
        pagination.total = data.total
        pagination.current = data.currentPage
      } catch (error) {
        logger.error('Failed to fetch tenant list', error)
        message.error('获取租户列表失败')
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = (): void => {
      pagination.current = 1
      fetchTenantList()
    }

    // 分页变化
    const handleTableChange = (pag: { current: number; pageSize: number; }): void => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      fetchTenantList()
    }

    onMounted(() => {
      fetchTenantList()
    })

    return (): JSX.Element => (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input
              v-model:value={searchName.value}
              placeholder="请输入租户名称或编号"
              style={{ width: '300px' }}
              allowClear
              onPressEnter={handleSearch}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={tableData.value}
          loading={loading.value}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </div>
    )
  }
})

