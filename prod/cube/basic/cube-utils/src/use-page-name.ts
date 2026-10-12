import { useRoute } from 'vue-router'
interface UsePageName {
  pageTitle: string;
}
type MenuWith = Partial<Menu> & {
  children?: Menu[];
  alias?: {
    code: string;
    icon: string;
    name: string;
    sort: string;
  };
}
export function usePageName (): UsePageName {
  const route = useRoute()
  const menus: Menu[] = JSON.parse(sessionStorage.getItem('GH-currentMenus') ?? JSON.stringify([])) ?? []
  const menuList = expandMenu(menus)
  let currentMenu = menuList.find(item => `${location.pathname}${location.search}` === item.path)
  if (!currentMenu) {
    currentMenu = menuList.find(item => item.path?.includes(location.pathname))
  }
  const curMenuName = currentMenu?.alias?.name ? currentMenu?.alias?.name : currentMenu?.name
  const pageTitle = curMenuName ?? route?.meta?.title as string

  return {
    pageTitle
  }
}

// 展开菜单
function expandMenu (menuList: MenuWith[]): MenuWith[] {
  const res: MenuWith[] = []
  for (let index = 0; index < menuList.length; index++) {
    const element = menuList[index]
    if (element.children?.length) {
      res.push(...expandMenu(element.children))
    }
    if (element.children) {
      delete element.children
    }
    res.push(element)
  }
  return res
}

interface Menu {
  applicationCode: string;
  applicationId: string;
  applicationName: string;
  categoryId: string | null;
  categoryName: string;
  children: Menu[];
  code: string;
  dataPermissions: unknown[];
  enabled: boolean;
  fileVO: unknown;
  functions: unknown[];
  icon: string;
  id: string;
  level: number;
  name: string;
  parentId: string | null;
  path: string;
  remark: string;
  sort: number;
  terminalId: string;
}
