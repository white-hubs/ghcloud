import { SessionEnum } from "../models/session";
import { getSessionItemWithObject, getSessionItemWithNumber } from "../utils/session";

export default {
  currentApplication: (state) => getSessionItemWithObject(SessionEnum.currentApplication),
  currentMenus: (state) => getSessionItemWithObject(SessionEnum.currentMenus),
  tabsPane: (state) => state.menu.tabsPane,
  applications: (state) => state.menu.applications,
  userInfo: (state) => getSessionItemWithObject(SessionEnum.userInfo),
  nowEnterprise: (state) => state.enterprise.nowEnterprise,
  unReadNum: (state) => getSessionItemWithNumber(SessionEnum.unReadNum),
  unReadAlarmNum: (state) => getSessionItemWithNumber(SessionEnum.unReadAlarmNum),
  commandDispatch: (state) => state.commandDispatch.commandDispatch,
  // 设备订阅的实时数据
  realTimeData: (state) => state.dataSubscription.realTimeData,
};
