/**
 * 全局场景编码由后端初始化定义(新增应用若要上传文件需咨询后端)
 */
export const GLOBAL_SCENE_CODE = {
  // 待治理
  electronicGuide: "ELECREONIC_GUIDE", // 电子导览
  financial: "FINANCIAL", // 滑轨财务管理 前端没做
  merchant: "MERCHANT", // 滑轨商家管理 前端没做
  deviceCenter: "DEVICECENTER", // 物联中心

  // 以下为已经治理了的
  parkingInfo: "PARKING::INFO", // 停车管理,
  parkingVehicle: "PARKING::VEHICLE", // 车辆信息,
  workCenter: "WORK::HANDOVER", // 工作中心
  spaceTag: "MDATA::SPACE_TAG", // 空间管理-标签
  spaceList: "MDATA::SPACE_LIST", // 空间管理
  officialWorkFail: "FOCUS_WORK_FAIL", // 督办事项失败
  visitorManagement: "VISITOR", // 访客管理
  workPlan: "WORK_PLAN", // 工作汇报-工作计划
  visualCenterMenu: "MDATA::BUSINESS_MENU", // 可视化中心-菜单
  inspectionRecord: "INSPECTION_RECORD", // 巡检记录
  propertyRiskSource: "RISK_SOURCE", // 风险源管理
  medicalCleanliness: "MEDICAL_CLEANLINESS", // 洁净医疗
  smallEngineering: "SMALLENFINEERING", // 小散工程
  propertyManagementConsumable: "PROPERTY_MANAGEMENT::CONSUMABLE", // 耗材管理
  propertyManagement: "PROPERTY_MANAGEMENT::PROPERTY", // 资产管理
  technicalBulletin: "CONTENT::ANNOUNCEMENT", // 通知公告
  knowledgeDocument: "KNOWLEDGE_BASE_FILE", // 知识文档
  knowledgeTypeIcon: "KNOWLEDGE_TYPE_ICON", // 知识文档类型图标
  buildData: "CONTENT::BUILDING_DATA", // 知识文档——建筑资料
  deviceDocument: "CONTENT::DEVICE_DOCUMENT", // 知识文档——设备文档
  attendanceManageClockPhoto: "ATTENDANCE_MANAGEMENT::CLOCK_PHOTO", // 考勤管理
  attendanceManagementClockIn: "ATTENDANCE_MANAGEMENT::CLOCK_IN", // 考勤打卡
  flowPropertyManagement: "PROPERTY_MANAGEMENT::PROPERTY::FLOW", // 资产管理_资产流程审批
  flowPropertyManagementConsumable: "PROPERTY_MANAGEMENT::CONSUMABLE::FLOW", // 资产管理_耗材流程审批
  smallEngineeringFlow: "SMALLENFINEERING::FLOW", // 小散工程-流引擎
  temporaryFile: "TEMPORARY_FILE", // 临时文件
  workReport: "WORK_REPORT::FLOW", // 工作汇报
  qrCodeBackground: "QRCODE:STYLE", // 二维码管理
  ouaaTenant: "OUAA::TENANT", // 租户信息
  ouaaUser: "OUAA::USER", // 用户信息
  ouaaAppVersion: "OUAA::APP_VERSION", // APP版本
  officialRegulation: "OFFICIAL_REGULATION::FLOW", // 制度征求
  officialSeal: "OFFICIAL_SEAL::FLOW", // 用印申请
  officialTopic: "OFFICIAL_TOPIC::FLOW", // 议题预报
  officialDocumentCirculation: "OFFICIAL_DOCUMENT_CIRCULATION::FLOW", // 文件传阅
  officialDocumentReceived: "OFFICIAL_DOCUMENT_RECEIVED::FLOW", // 来文处理
  officialKeyWork: "OFFICIAL_KEY_WORK::FLOW", // 重点工作
  officialUrgentWork: "OFFICIAL_URGENT_WORK::FLOW", // 催办工作
  officialFocusWork: "OFFICIAL_FOCUS_WORK::FLOW", // 督办事项
  officialFocusWorkReply: "OFFICIAL_FOCUS_WORK_REPLY::FLOW", // 督办事项反馈
  officialFocusWorkUpdate: "OFFICIAL_FOCUS_WORK_UPDATE::FLOW", // 督办事项更新
  safetyEducationCourseWare: "SAFETY_EDUCATION::COURSEWARE", // 安全教育_课间库,
  safetyEducationCultivatePhoto: "SAFETY_EDUCATION::CULTIVATE_PHOTO", // 安全教育_培训记录照片
  emergencyDevice: "EMERGENCY::DEVICE", // 应急设备
  emergencyFile: "EMERGENCY::FILE", // 预案文件
  emergencyKnowledge: "EMERGENCY::KNOWLEDGE", // 应急知识
  stallInfo: "STALL::INFO", // 档位管理
  electPatrolSubmitResult: "ELECT_PATROL:SUBMIT_RESULT", // 电子巡更巡更结果提交
  faultOrderCase: "FAULT_ORDER:CASE", // 故障案例
  faultFlow: "FAULT::FLOW", // 故障单提交
  hiddenDangerFlow: "HIDDENDANGER::FLOW", // 隐患单提交
  complaintFlow: "COMPLAINT::FLOW", // 投诉建议提交
  retrofitFlow: "RETROFIT::FLOW", // 更新改造提交
  outsourceRepairFlow: "OUTSOURCE_REPAIR::FLOW", // 委外维修提交
  alarmLevelPlayConfig: "ALARM:LEVEL_PLAY_CONFIG", // 报警级别播放配置
  alarmRecordFollowUp: "ALARM:RECORD_FOLLOW_UP", // 报警记录跟进配置
  alarmRecordHandler: "ALARM:RECORD_HANDLER", // 报警记录处理
  alarmRecordSuspend: "ALARM:RECORD_SUSPEND", // 报警记录挂起
  personnelManagement: "PERSONNELMANAGEMENT",
  disinfectiondatatype: "DISINFECTION::DATA_TYPE", // 业务文件
  disinfectionproject: "DISINFECTION::PROJECT", // 项目文件
  disinfectionkeyplace: "DISINFECTION::KEY_PLACE", // 关键场所文件
  disinfectionmaterial: "DISINFECTION::MATERIAL", // 资料
  disinfectiontask: "DISINFECTION::TASK", // 任务
  approvalCenter: "APPROVAL_CENTER", // 审批中心
  dailyTask: "DAILY_TASK", // 日常任务
  safetyCredit: "SAFETY_CREDIT", // 安全信用
  gridManagement: "GRID_MANAGEMENT", // 网格管理
  securityKeyPersonPhoto: "KEY::PERSON_SECURITY_KEY_PERSON_PHOTO", // 重点人员照片
  securityKeyPersonAttachment: "KEY::PERSON_SECURITY_KEY_PERSON_ATTACHMENT", // 重点人员附件
  securityKeyPersonReportAttachment: "KEY::PERSON_SECURITY_KEY_PERSON_REPORT_ATTACHMENT", // 重点人员监管上报附件
  safetyPersonnelCommitteeAttachment: "SAFETY_PERSONNEL::COMMITTEE_ATTACHMENT", // 安全人员-安委会附件
  safetyPersonnelCertAttachment: "SAFETY_PERSONNEL::CERT_ATTACHMENT", // 安全人员-员工证书图片/附件
  aiApplicationCenter: "AI_APPLICATION_CENTE::FILE", // AI中心
  staticSiteGenerator: "STATIC_SITE_GENERATOR", // 静态站点生成器
};
export const BUSINESS_KEY_TO_SCENE_CODE = new Map([
  ["CONSUMABLE_REDUCE", GLOBAL_SCENE_CODE.flowPropertyManagementConsumable], // 耗材出库
  ["CONSUMABLE_ADD", GLOBAL_SCENE_CODE.flowPropertyManagementConsumable], // 耗材入库
  ["PROPERTY_DEPOSITORY", GLOBAL_SCENE_CODE.flowPropertyManagement], // 资产入库
  ["PROPERTY_ALLOT_UNIT", GLOBAL_SCENE_CODE.flowPropertyManagement], // 资产管理
  ["PROPERTY_WEED_OUT", GLOBAL_SCENE_CODE.flowPropertyManagement], // 清理报废
  ["PROPERTY_ALLOT_PERSONAL", GLOBAL_SCENE_CODE.flowPropertyManagement], // 资产派发
  ["REPAIR_CLOCK", GLOBAL_SCENE_CODE.attendanceManagementClockIn], // 补卡申请
  ["OVERTIME", GLOBAL_SCENE_CODE.attendanceManagementClockIn], // 加班申请
  ["CHANGE_CLASSES", GLOBAL_SCENE_CODE.attendanceManagementClockIn], // 换班申请
  ["LEAVE", GLOBAL_SCENE_CODE.attendanceManagementClockIn], // 请假申请
  ["CANCEL_LEAVE", GLOBAL_SCENE_CODE.attendanceManagementClockIn], // 销假申请
  ["AWAY_BUSINESS", GLOBAL_SCENE_CODE.attendanceManagementClockIn], // 出差申请
  ["OFFICIAL_REGULATION", GLOBAL_SCENE_CODE.officialRegulation], // 制度征求
  ["OFFICIAL_SEAL", GLOBAL_SCENE_CODE.officialSeal], // 用印申请
  ["OFFICIAL_TOPIC", GLOBAL_SCENE_CODE.officialTopic], // 议题预报
  ["OFFICIAL_DOCUMENT_CIRCULATION", GLOBAL_SCENE_CODE.officialDocumentCirculation], // 文件传阅
  ["OFFICIAL_DOCUMENT_RECEIVED", GLOBAL_SCENE_CODE.officialDocumentReceived], // 来文处理
  ["OFFICIAL_KEY_WORK", GLOBAL_SCENE_CODE.officialKeyWork], // 重点工作
  ["OFFICIAL_URGENT_WORK", GLOBAL_SCENE_CODE.officialUrgentWork], // 催办工作
  ["OFFICIAL_FOCUS_WORK", GLOBAL_SCENE_CODE.officialFocusWork], // 督办事项
  ["OFFICIAL_FOCUS_WORK_REPLY", GLOBAL_SCENE_CODE.officialFocusWorkReply], // 督办事项反馈
  ["OFFICIAL_FOCUS_WORK_UPDATE", GLOBAL_SCENE_CODE.officialFocusWorkUpdate], // 督办事项更新
  ["PROJECT_APPLY", GLOBAL_SCENE_CODE.smallEngineeringFlow], // 工程请示
  ["PROJECT_SIGN_CONTRACT", GLOBAL_SCENE_CODE.smallEngineeringFlow], // 工程签约
  ["PERSONNEL_RECRUIT", GLOBAL_SCENE_CODE.personnelManagement], // 招聘申请
  ["PERSONNEL_INDUCTION", GLOBAL_SCENE_CODE.personnelManagement], // 入职审批
  ["PERSONNEL_PROBATION_ASSESS", GLOBAL_SCENE_CODE.personnelManagement], // 试用考核
  ["PERSONNEL_REGULAR_WORKER", GLOBAL_SCENE_CODE.personnelManagement], // 转正申请
  ["PERSONNEL_TRAIN", GLOBAL_SCENE_CODE.personnelManagement], // 培训申请
  ["PERSONNEL_LEAVE_OFFICE", GLOBAL_SCENE_CODE.personnelManagement], // 离职审批
  ["PERSONNEL_LEAVE_OFFICE_PROCEDURES", GLOBAL_SCENE_CODE.personnelManagement], // 离职手续
  ["PERSONNEL_ROTATION_POST", GLOBAL_SCENE_CODE.personnelManagement], // 轮岗申请
  ["REPORT", GLOBAL_SCENE_CODE.workReport], // 工作汇报
  ["FAULT", GLOBAL_SCENE_CODE.faultFlow], // 故障单提交
  ["HIDDENDANGER", GLOBAL_SCENE_CODE.hiddenDangerFlow], // 隐患单提交
  ["COMPLAINT", GLOBAL_SCENE_CODE.complaintFlow], // 投诉建议提交
  ["RETROFIT", GLOBAL_SCENE_CODE.retrofitFlow], // 更新改造提交
  ["OUTSOURCE_REPAIR", GLOBAL_SCENE_CODE.outsourceRepairFlow], // 委外维修提交
]);
