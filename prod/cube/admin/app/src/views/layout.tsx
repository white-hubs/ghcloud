import { defineComponent, ref, computed } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Space,
  Button,
  MenuItem
} from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'
import { cleanAuth } from '@/state/auth'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'
import { Content } from 'ant-design-vue/es/layout/layout'

const { Header, Sider } = Layout

export const LayoutView = defineComponent({
  setup () {
    const router = useRouter()
    const route = useRoute()
    const collapsed = ref(false)

    // 从 localStorage 获取用户名，如果没有则显示默认值
    const userName = computed(() => {
      return '用户'
    })

    // 菜单项配置
    const menuItems = [
      {
        key: 'tenant',
        icon: (): JSX.Element => <TeamOutlined />,
        label: '租户管理',
        children: [
          {
            key: '/tenant/list',
            label: '租户列表'
          }
        ]
      }
    ]

    // 选中的菜单项
    const selectedKeys = computed(() => {
      return [route.path]
    })

    // 打开的菜单项
    const openKeys = ref(['tenant'])

    // 菜单点击事件
    const handleMenuClick = (info: MenuInfo): void => {
      if (info.key) {
        router.push(info.key as string)
      }
    }

    // 退出登录
    const handleLogout = (): void => {
      cleanAuth()
      router.push('/login')
    }

    // 用户下拉菜单
    const userMenuItems = [
      {
        key: 'logout',
        label: '退出登录',
        icon: (): JSX.Element => <LogoutOutlined />,
        tooltip: '退出登录'
      }
    ]

    const handleUserMenuClick = (info: MenuInfo): void => {
      if (info.key === 'logout') {
        handleLogout()
      }
    }

    return (): JSX.Element => (
      <Layout style={{ height: '100vh' }}>
        <Sider
          v-model:collapsed={collapsed.value}
          trigger={null}
          collapsible
          theme="dark"
          width={200}
        >
          <div style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: '1px solid #001529'
          }}>
            {!collapsed.value ? 'LOGO' : 'L'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys.value}
            openKeys={openKeys.value}
            items={menuItems}
            onClick={handleMenuClick}
            onOpenChange={(keys: string[]): void => {
              openKeys.value = keys
            }}
          />
        </Sider>
        <Layout>
          <Header style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed.value ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => {
                  collapsed.value = !collapsed.value
                }}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Dropdown
                arrow={true}
                placement="bottomRight"
                trigger={['hover', 'click']}
              >
                {{
                  default: () => <Space style={{ cursor: 'pointer' }}>
                    <Avatar icon={<UserOutlined />} />
                    <span>{userName.value}</span>
                  </Space>,
                  overlay: () => <Menu items={userMenuItems} onClick={handleUserMenuClick}>
                    <MenuItem key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</MenuItem>
                  </Menu>
                }}
              </Dropdown>
            </div>
          </Header>
          <Content style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto'
          }}>
            <RouterView />
          </Content>
        </Layout>
      </Layout>
    );
  },
});
