import { defineComponent, ref, watchEffect } from 'vue'
import { Menu, MenuItem, SubMenu } from '@ghcloud/cube-ui'
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router'
import routes from '@/routers/system'
interface Window {
  config: {
    hideMenuList: string | string[];
  };
}

export const LeftMenus = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const openKeys = ref<string[]>(['/access'])
    const selectedKeys = ref<string[]>(['/gateway'])

    const goPath = (data: RouteRecordRaw): void => {
      router.push(data.path)
      selectedKeys.value.push(data.path)
    }
    const urlNameList = new Map<string | undefined, string>([
      ['/gateway', '/gateway'],
      ['/gateway-detail', '/gateway'],
      ['/deviceGroup', '/deviceGroup'],
      ['/device-group-detail', '/deviceGroup'],
      ['/logList', '/log'],
    ])
    watchEffect(async () => {
      if (route.path) {
        openKeys.value = route.path.toLowerCase().includes('config') ? ['/config'] : (route.path.toLowerCase().includes('log') ? ['/log'] : ['/access'])
        selectedKeys.value = [route.path]
        const url = urlNameList.get(route.path)
        if (url) selectedKeys.value = [url]
      }
    })

    return (): JSX.Element =>
      <>
        <Menu class='menus' selectedKeys={selectedKeys.value} openKeys={openKeys.value} theme='dark' mode='inline'>
          {routes.map((item) => {
            return (
              item.children.length === 0 && item.meta.show
                ? <MenuItem eventkey={item.path}>
                  <span>{item.meta.title}</span>
                </MenuItem>
                : <>
                  {
                    (
                      (window as unknown as Window).config?.hideMenuList === undefined ||
                      ((window as unknown as Window).config?.hideMenuList && !(window as unknown as Window).config?.hideMenuList.includes(item.name))
                    ) &&
                    <SubMenu eventkey={item.path} title={item.meta.title}>
                      {item.children.map((sub) => {
                        return (
                          sub.meta.show &&
                            <MenuItem eventkey={sub.path} onClick={() => {
                              goPath(sub)
                            }}>
                              <span>{sub.meta.title}</span>
                            </MenuItem>
                        )
                      })}
                    </SubMenu>
                  }
                </>
            )
          })}
        </Menu>
      </>
  }
})
