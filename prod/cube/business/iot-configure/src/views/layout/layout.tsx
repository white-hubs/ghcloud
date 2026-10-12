import { Layout, LayoutSider, LayoutHeader, LayoutContent, MenuUnfoldOutlined, MenuFoldOutlined, DropDown, DownOutlined, Menu, MenuItem } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'
import '@/styles/layout.less'
import { RouterView, useRouter } from 'vue-router'
import { LeftMenus } from './components/left-menus'
import { CBreads } from './components/breads'
import { getTenant, removeTenant, removeToken } from '@/tools'
import { storeUser } from '@/pinia-store/user'
import { storeLog } from '@/pinia-store/log'

export const VLayout = defineComponent({
  setup: () => {
    const router = useRouter()
    const collapsed = ref<boolean>(false)
    const log = storeLog()
    const exit = (): void => {
      removeToken()
      removeTenant()
      log.resetLogList()
      router.push('/login')
    }

    const userName = ref<string>('')
    userName.value = storeUser().userInfo.userName
    return (): JSX.Element =>
      <>
        <Layout style='height:100%;' class='layout-wrapper'>
          <LayoutSider v-model:collapsed={collapsed.value} trigger='null'>
            {
              !collapsed.value &&
                <div class='logo'>物联接入OS</div>
            }
            <LeftMenus />
          </LayoutSider>
          <Layout class='layout-right'>
            <LayoutHeader class='layout-header flex-between'>
              <div class='header-left'>
                {
                  collapsed.value
                    ? <MenuUnfoldOutlined class='trigger' onClick={() => {
                      collapsed.value = !collapsed.value
                    }} />
                    : <MenuFoldOutlined class='trigger' onClick={() => {
                      collapsed.value = !collapsed.value
                    }} />
                }
                <CBreads style='display: inline-block;' />
              </div>
              <div class='header-right'>
                <span class='desc'>Tenant: {getTenant()}</span>
                <DropDown v-slots={{
                  default: () => {
                    return (
                      <>
                        {userName.value || ''}
                        <DownOutlined class='ml-5px' />
                      </>
                    )
                  },
                  overlay: () => {
                    return (
                      <>
                        <Menu>
                          <MenuItem onClick={exit}>退出登录</MenuItem>
                        </Menu>
                      </>
                    )
                  }
                }}
                />
              </div>
            </LayoutHeader>
            <LayoutContent class='content'>
              <RouterView />
            </LayoutContent>
          </Layout>
        </Layout>
      </>
  }
})
