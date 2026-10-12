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
  //
  webrtcInstance: (state) => state.commandDispatch.webrtcInstance,
  // 会议成员
  conferenceMembers: (state) => state.commandDispatch.conferenceMembers,
  // 本地人员信息
  localUserInfo: (state) => state.userInfo.userInfo,
  // 会议名字
  meetingTitle: (state) => state.commandDispatch.meetingTitle,
  // 获取弹窗
  taskModalList: (state) => state.commandDispatch.taskModalList,
  // 获取是否拥有通讯能力
  hasConfig: (state) => state.commandDispatch.hasConfig,
  // 流媒体配置
  streamConfig: (state) => state.commandDispatch.streamConfig,
  // 地图配置
  mapConfig: (state) => state.commandDispatch.mapConfig,
};
