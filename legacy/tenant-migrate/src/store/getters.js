import { getSessionItemWithObject, getSessionItemWithNumber } from '@/utils/session'
import { SessionEnum } from '@/models/session'

export default {
  firstMenu: (state) =>
    state.menu.firstMenu || sessionStorage.getItem("firstMenu"),
  tabsPane: (state) => state.menu.tabsPane,
  userInfo: (state) => getSessionItemWithObject(SessionEnum.userInfo),
  nowEnterprise: (state) => getSessionItemWithObject(SessionEnum.nowEnterprise),
};
