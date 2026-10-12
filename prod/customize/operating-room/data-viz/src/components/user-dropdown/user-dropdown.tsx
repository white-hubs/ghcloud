import { defineComponent } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import { DropDown, Menu, MenuItem, Button } from '@ghcloud/cube-ui'
import { storeUser } from '@/store/user'
import { router } from '@/router'

/** 用户下拉菜单 */
export const UserDropdown = defineComponent({
  setup () {
    const userStore = storeUser()
    const loginOut = (): void => {
      sessionStorage.clear()
      router.push({ path: '/' })
    }
    return (): JSX.Element =>
      <DropDown
        v-slots={{
          default: () => <><span>{userStore.userInfo?.name}</span><DownOutlined /></>,
          overlay: () => {
            return (
              <Menu>
                <MenuItem>
                  <Button type='link' size='small' style={{ width: '100%' }} onClick={loginOut}>安全退出</Button>
                </MenuItem>
              </Menu>
            )
          }
        }}
      />
  }
})
