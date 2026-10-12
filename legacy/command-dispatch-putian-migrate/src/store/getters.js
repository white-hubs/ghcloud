export default {
  currentApplication: (state) => state.menu.currentApplication,
  currentMenus: (state) => state.menu.currentMenus,
  tabsPane: (state) => state.menu.tabsPane,
  applications: (state) => state.menu.applications,
  userInfo: (state) => state.userInfo.userInfo,
  nowEnterprise: (state) => state.enterprise.nowEnterprise,
  unReadNum: (state) => state.unReadMsgNum.unReadNum,
  unReadAlarmNum: (state) => state.unReadMsgNum.unReadAlarmNum,
  commandDispatch: (state) => state.commandDispatch.commandDispatch,
  // 设备订阅的实时数据
  realTimeData: (state) => state.dataSubscription.realTimeData,
};
