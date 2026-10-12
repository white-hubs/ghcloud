export const Gender = [
  {
    code: 1,
    name: '男',
  },
  {
    code: 2,
    name: '女',
  },
  {
    code: 9,
    name: '未知',
  },
];

export const ResourceType = [
  {
    code: 'MENU',
    name: '菜单',
  },
  {
    code: 'FUNCTION',
    name: '功能',
  },
];

export const TerminalType = [
  {
    code: 0,
    name: '其他',
  },
  {
    code: 1,
    name: 'PC',
  },
  {
    code: 2,
    name: 'APP(安卓)',
  },
  {
    code: 3,
    name: 'APP(苹果)',
  },
];
export const LogBusinessType = [
  {
    code: 0,
    name: '其他',
  },
  {
    code: 1,
    name: '新增',
  },
  {
    code: 2,
    name: '编辑',
  },
  {
    code: 3,
    name: '删除',
  },
];
// -- 设备状态
export const DeviceStatus = [
  { code: 1, name: '正常' },
  { code: 2, name: '故障' },
  { code: 3, name: '报废' },
];
// -- 新建工单实例的时候 执行人的可选类型
export const DutyType = [
  { code: 'USER', name: '用户' },
  { code: 'POST', name: '岗位' },
  { code: 'DEPT', name: '部门' },
];
export const DutyType1 = [
  { code: 'DEPT_POST', name: '指定部门,岗位' },
  { code: 'USER', name: '用户' },
  { code: 'POST', name: '岗位' },
  { code: 'DEPT', name: '部门' },
];
export const DutyType2 = [
  { code: 'DEPT_POST', name: '指定部门,岗位' },
  { code: 'USER', name: '用户' },
  { code: 'POST', name: '岗位' },
  { code: 'DEPT', name: '部门' },
  { code: 'CURRENT_USER', name: '处理人' },
  { code: 'CURRENT_USER_DEPT_POST', name: '处理人所在部门,岗位' },
];
// -- 工单流程设计的时候 执行人的可选类型
export const ProcessDutyType = [
  { code: 'PROCESS_DECISION', name: '流程决定' },
  { code: 'USER', name: '用户' },
  { code: 'POST', name: '岗位' },
  { code: 'DEPT', name: '部门' },
];
/**
 * 
流程预设  ×
发起人    ×
用户  USE:xxx
岗位  POST:xxx
部门  DEPT:xxx
部门负责人  DEPT_MANAGER:xxx
发起人部门负责人        ×
发起人部门分管领导      ×
上一执行人部门负责人    ×
上一执行人部门分管领导  ×
发起人部门负责人 START_USER_DEPT_MANAGER  
发起人部门分管领导 START_USER_DEPT_LEADER 
上一执行人部门负责人 PREV_ASSIGNEE_DEPT_MANAGER  
上一执行人部门分管领导 PREV_ASSIGNEE_DEPT_LEADER
 */
export const ProcessDutyType2 = [
  { code: 'NONE', name: '无' },
  { code: 'PROCESS_DECISION', name: '流程预设' },
  { code: 'START_USER', name: '发起人' },
  { code: 'USER', name: '用户' },
  { code: 'POST', name: '岗位' },
  { code: 'DEPT', name: '部门' },
  { code: 'DEPT_MANAGER', name: '部门负责人' },
  { code: 'START_USER_DEPT_MANAGER', name: '发起人部门负责人' },
  { code: 'START_USER_DEPT_LEADER', name: '发起人部门分管领导' },
  { code: 'PREV_ASSIGNEE', name: '上一步处理人' },
  { code: 'PREV_ASSIGNEE_DEPT_MANAGER', name: '上一步处理人部门负责人' },
  { code: 'PREV_ASSIGNEE_DEPT_LEADER', name: '上一步处理人部门分管领导' },
];
export const ProcessDutyType3 = [
  // { code: 'NONE', name: '无' },
  // { code: 'PROCESS_DECISION', name: '流程预设' },
  { code: 'START_USER', name: '发起人' },
  { code: 'USERS', name: '用户' },
  { code: 'POST', name: '岗位' },
  { code: 'DEPT', name: '部门' },
  { code: 'DEPT_MANAGER', name: '部门负责人' },
  { code: 'DEPT_LEADER', name: '部门分管领导' },
  { code: 'START_USER_DEPT_MANAGER', name: '发起人部门负责人' },
  { code: 'START_USER_DEPT_LEADER', name: '发起人部门分管领导' },
  { code: 'PREV_ASSIGNEE', name: '上一步处理人' },
  { code: 'PREV_ASSIGNEE_DEPT_MANAGER', name: '上一步处理人部门负责人' },
  { code: 'PREV_ASSIGNEE_DEPT_LEADER', name: '上一步处理人部门分管领导' },
];
export const ProcessDutyType4 = [
  // { code: 'NONE', name: '无' },
  // { code: 'PROCESS_DECISION', name: '流程预设' },
  { code: 'START_USER', name: '发起人' },
  { code: 'USERS', name: '用户' },
  { code: 'POST', name: '岗位' },
  { code: 'DEPT', name: '部门' },
  { code: 'DEPT_MANAGER', name: '部门负责人' },
  { code: 'DEPT_LEADER', name: '部门分管领导' },
  { code: 'START_USER_DEPT_MANAGER', name: '发起人部门负责人' },
  { code: 'START_USER_DEPT_LEADER', name: '发起人部门分管领导' },
  { code: 'PREV_ASSIGNEE', name: '上一步处理人' },
  { code: 'PREV_ASSIGNEE_DEPT_MANAGER', name: '上一步处理人部门负责人' },
  { code: 'PREV_ASSIGNEE_DEPT_LEADER', name: '上一步处理人部门分管领导' },
];
// -- 工单内置流程
export const TicketFlow = [
  { code: 'process_ticket_repair', name: '维修流程' },
  { code: 'FLOW20200826', name: 'XX流程' },
  { code: 'FLOW20200827', name: 'CE流程' },
];
// -- 工单内置Form表单
export const TicketForm = [
  { code: 'GeneralForm', name: '通用表单' },
  // { code: 'ABC', name: 'ABC表单' },
  // { code: 'FixForm', name: '修理表单' },
  // { code: 'InspectForm', name: '检查项表单' },
];
// -- customize, builtin
export const TicketFormType = [
  { code: 'builtin', name: '内置表单' },
  { code: 'customize', name: '自定义表单' },
];

export const TicketCategory = [{ code: 'ticket', name: '内置工单?' }];
// -- 巡检 巡检标准->巡检类型
// export const InspType = [
//   { code: 'DEVICE_INSP', name: '设备巡检' },
//   { code: 'CONTENT_INSP', name: '现场巡检' },
// ];
// -- 巡检 巡检项类型
export const InspItemType = [
  { code: 'Text', name: '文本记录' },
  { code: 'Number', name: '数字记录' },
  { code: 'Radio', name: '单选' },
  { code: 'Checkbox', name: '复选' },
];
// -- 巡检 巡检项各个类型的值
export const InspItemTypeValue = [
  { code: 'NORMAL', name: '正常' },
  { code: 'UNNORMAL', name: '异常' },
  { code: 'SELECT_ONE', name: '选项一' },
  { code: 'SELECT_TWO', name: '选项二' },
  { code: 'SELECT_THREE', name: '选项三' },
  { code: 'SELECT_FOUR', name: '选项四' },
];

// -- 巡检 巡检计划 周选择
export const InspPlanWeek = [
  { code: '1', name: '周一' },
  { code: '2', name: '周二' },
  { code: '3', name: '周三' },
  { code: '4', name: '周四' },
  { code: '5', name: '周五' },
  { code: '6', name: '周六' },
  { code: '7', name: '周天' },
];

// 电器火灾

// 隐患信息
// 风险等级
export const DangerLevel = [
  { code: 'securityInfoDangerLevel_high', name: '高' },
  { code: 'securityInfoDangerLevel_middle', name: '中' },
  { code: 'securityInfoDangerLevel_low', name: '低' },
];

// ------ 联动策略 ----------
// 策略类型
export const LinkageCategory = [
  { code: '1', name: '条件策略' },
  { code: '2', name: '事件策略' },
  { code: '3', name: '时间策略' },
];
// 联动 动作类型
export const LinkageActionType = [
  // { code: '1', name: '默认动作' },
  { code: '2', name: '设备控制' },
  { code: '3', name: '视频抓拍/录像' },
  // { code: '4', name: '视频查看' },
  // { code: '5', name: '视频录像' },
  // { code: '4', name: 'APP推送' },
  // { code: '5', name: '短信通知' },
  // { code: '6', name: '视频弹窗' },
];
// 联动 触发器类型
export const LinkageTriggerCategory = [
  { code: '1', name: '条件策略' },
  { code: '2', name: '事件策略' },
  { code: '3', name: '时间策略' },
];
// 联动策略属性
export const LinkageProperties = [
  { code: 'dl', name: '电流', type: 'float' },
  { code: 'dy', name: '电压', type: 'float' },
  { code: 'wd', name: '温度', type: 'float' },
  { code: 'ldl', name: '漏电流', type: 'float' },
];

// 联动规则比较符
export const LinkageOperators = [
  { code: '>=', name: '大于等于(>=)' },
  { code: '>', name: '大于(>)' },
  { code: '<=', name: '小于等于(<=)' },
  { code: '<', name: '小于(<)' },
  { code: '>=&<=', name: '两者之间(>=&<=)' },
  { code: '>&<', name: '两者之间(>&<)' },
  { code: '==', name: '等于' },
];

// 定时任务 执行周期
export const TimedTaskCycleType = [
  { code: 'day', name: '每天' },
  { code: 'week', name: '每周' },
  { code: 'month', name: '每月' },
];

// 设备联动 设备事件类型
export const DeviceEventType = [
  { code: '1', name: '过压报警' },
  { code: '2', name: '过流报警' },
  { code: '3', name: '湿度报警' },
];

// ========== 综合安防 ========
// ------ 综合安防 黑名单布控 --------

export const VideoDurationEnum = [
  { code: 1, name: '1秒' },
  { code: 3, name: '3秒' },
  { code: 5, name: '5秒' },
  { code: 10, name: '10秒' },
  { code: 12, name: '12秒' },
  { code: 16, name: '16秒' },
  { code: 18, name: '18秒' },
  { code: 20, name: '20秒' },
];

// ======== 模型 =========
// 模型构件 关联类型

export const ModelBindType = [
  { code: 'space', name: '空间' },
  { code: 'device', name: '设备' },
];
