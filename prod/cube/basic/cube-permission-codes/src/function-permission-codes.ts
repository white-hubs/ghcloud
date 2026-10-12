export const FUNCTION_PERMISSION_CODES = [
  // 业务设置
  {
    applicationCode: "BUSINESS_CONFIG",
    children: [
      {
        groupCode: "businessTag",
        groupName: "业务标签",
        features: [
          {
            featureCode: "businessConfig:businessTag:add",
            featureName: "新增",
          },
          {
            featureCode: "businessConfig:businessTag:edit",
            featureName: "修改",
          },
          {
            featureCode: "businessConfig:businessTag:deleted",
            featureName: "删除",
          },
        ],
      },
    ],
  },
  // 审批中心
  {
    applicationCode: "APPROVAL_CENTER",
    children: [
      {
        groupCode: "workOrderRecord",
        groupName: "工单记录",
        features: [
          {
            featureCode: "approvalCenter:workOrderRecord:deleted",
            featureName: "删除",
          },
        ],
      },
    ],
  },
  // 表单审核
  {
    applicationCode: "FORM_ASSESSMENT",
    children: [
      {
        groupCode: "assessmentRules",
        groupName: "考核规则",
        features: [
          {
            featureCode: "formAudit:assessmentRules:list",
            featureName: "查看列表",
          },
          {
            featureCode: "formAudit:assessmentRules:add",
            featureName: "新增",
          },
          {
            featureCode: "formAudit:assessmentRules:edit",
            featureName: "编辑",
          },
          {
            featureCode: "formAudit:assessmentRules:delete",
            featureName: "删除",
          },
          {
            featureCode: "formAudit:assessmentRules:enable",
            featureName: "启用禁用",
          },
        ],
      },
      {
        groupCode: "assessmentScoring",
        groupName: "考核评分",
        features: [
          {
            featureCode: "formAudit:assessmentScoring:list",
            featureName: "查看列表",
          },
          {
            featureCode: "formAudit:assessmentScoring:export",
            featureName: "导出",
          },
        ],
      },
      {
        groupCode: "assessmentStatistics",
        groupName: "考核统计",
        features: [
          {
            featureCode: "formAudit:assessmentStatistics:list",
            featureName: "查看列表",
          },
        ],
      },
    ],
  },
  // 冷冻水
  {
    applicationCode: "COOLINGWATER",
    children: [
      {
        groupCode: "coolingWaterReportDetail",
        groupName: "报表明细",
        features: [
          {
            featureCode: "coolingWater:reportDetail:add",
            featureName: "新增",
          },
          {
            featureCode: "coolingWater:reportDetail:edit",
            featureName: "修改",
          },
          {
            featureCode: "coolingWater:reportDetail:download",
            featureName: "下载模板",
          },
        ],
      },
    ],
  },
  // 会议室管理
  {
    applicationCode: "MEETING_ROOM_MANAGEM",
    children: [
      {
        groupCode: "meetroomReservation",
        groupName: "会议室预约",
        features: [
          {
            featureCode: "meetroom:reservation:cancel",
            featureName: "预约取消",
          },
        ],
      },
    ],
  },
  // 停车管理
  {
    applicationCode: "PARKINGMANAGE",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "illegalParking:cardView:homeCard",
            featureName: "违停工单卡片",
          },
          {
            featureCode: "remainingParking:cardView:homeCard",
            featureName: "剩余车位卡片",
          },
        ],
      },
    ],
  },
  // 人流量检测
  {
    applicationCode: "TRAFFIC_DETECTION",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "peopleFlowTrend:cardView:homeCard",
            featureName: "人流量分析卡片",
          },
        ],
      },
    ],
  },
  // 报警中心
  {
    applicationCode: "ALARM_CENTER",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "alarmCenter:cardView:homeCard",
            featureName: "app报警中心首页卡片",
          },
        ],
      },
      {
        groupCode: "alarmRecord",
        groupName: "报警记录",
        features: [
          {
            featureCode: "alarm:record:delete",
            featureName: "删除",
          },
        ],
      },
    ],
  },
  // 消防管理
  {
    applicationCode: "FIRECONTROL",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "fireManagement:cardView:homeCard",
            featureName: "app消防管理首页卡片",
          },
        ],
      },
    ],
  },
  // 电气管理
  {
    applicationCode: "ELECTRICMANAGE",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "fireManagement:cardView:homeCard",
            featureName: "app电气管理首页卡片",
          },
        ],
      },
    ],
  },
  // 用气管理
  {
    applicationCode: "GAS_MANAGEMENT",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "gasManagement:cardView:homeCard",
            featureName: "app用气管理首页卡片",
          },
        ],
      },
    ],
  },
  // 动环
  {
    applicationCode: "ROTATINGMANAGE",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "rotatingManagement:cardView:homeCard",
            featureName: "app动环首页卡片",
          },
        ],
      },
    ],
  },
  // 安全教育
  {
    applicationCode: "SECURE_EDU",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "educationExamination:cardView:homeCard",
            featureName: "app安全教育首页卡片",
          },
        ],
      },
    ],
  },
  // 医疗洁净
  {
    applicationCode: "OPERATING_ROOM",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "operatingRoom:cardView:homeCard",
            featureName: "app医疗洁净首页卡片",
          },
        ],
      },
    ],
  },
  // 安全监管
  {
    applicationCode: "SAFETY_MANAGE_HEAD",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "safetyManagement:cardView:homeCard",
            featureName: "app安全监管首页卡片",
          },
        ],
      },
    ],
  },
  // 安防监控
  {
    applicationCode: "SECURITY_MONITORING",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "securityMonitoring:cardView:homeCard",
            featureName: "app安防监控首页卡片",
          },
        ],
      },
      {
        groupCode: "aiInspectionPlan",
        groupName: "AI巡检计划",
        features: [
          {
            featureCode: "aiInspection:plan:view",
            featureName: "查看列表",
          },
          {
            featureCode: "aiInspection:plan:create",
            featureName: "新增",
          },
          {
            featureCode: "aiInspection:plan:update",
            featureName: "编辑",
          },
          {
            featureCode: "aiInspection:plan:delete",
            featureName: "删除",
          },
          {
            featureCode: "aiInspection:plan:enable",
            featureName: "启用禁用",
          },
          {
            featureCode: "aiInspection:plan:run",
            featureName: "立即执行",
          },
        ],
      },
      {
        groupCode: "aiInspectionTask",
        groupName: "AI巡检任务",
        features: [
          {
            featureCode: "aiInspection:task:view",
            featureName: "查看列表",
          },
        ],
      },
      {
        groupCode: "aiInspectionEvent",
        groupName: "AI巡检异常事件",
        features: [
          {
            featureCode: "aiInspection:event:view",
            featureName: "查看列表",
          },
          {
            featureCode: "aiInspection:event:ignore",
            featureName: "忽略",
          },
          {
            featureCode: "aiInspection:event:action",
            featureName: "生成处置",
          },
        ],
      },
    ],
  },
  // 预案管理
  {
    applicationCode: "EMERGENCY_CENTER",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "emergencyManagement:cardView:homeCard",
            featureName: "app预案管理首页卡片",
          },
        ],
      },
    ],
  },
  // 资产管理
  {
    applicationCode: "PROPERTY_MANAGEMENT",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "property:cardView:homeCard",
            featureName: "app资产管理首页卡片",
          },
        ],
      },
      {
        groupCode: "consumables",
        groupName: "耗材管理",
        features: [
          {
            featureCode: "riskSource:consumables:download",
            featureName: "耗材管理模版下载",
          },
          {
            featureCode: "riskSource:consumables:upload",
            featureName: "耗材管理导入",
          },
        ],
      },
    ],
  },
  // 风险源管理
  {
    applicationCode: "RISK_SOURCE",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "riskSource:cardView:homeCard",
            featureName: "app风险源首页卡片",
          },
        ],
      },
    ],
  },
  // 小散
  {
    applicationCode: "SMALLENFINEERING",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "smallEngineering:cardView:homeCard",
            featureName: "app小散工程首页卡片",
          },
        ],
      },
      {
        groupCode: "projectSupervise",
        groupName: "工程监管",
        features: [
          {
            featureCode: "smallEngineering:projectSupervise:update",
            featureName: "编辑",
          },
          {
            featureCode: "smallEngineering:projectSupervise:deleted",
            featureName: "删除",
          },
          {
            featureCode: "smallEngineering:projectSupervise:createPatrol",
            featureName: "创建巡检",
          },
          {
            featureCode: "smallEngineering:projectSupervise:createSupervise",
            featureName: "新增",
          },
          {
            featureCode: "smallEngineering:projectSupervise:downloadSupervise",
            featureName: "导出",
          },
        ],
      },
      {
        groupCode: "projectRequest",
        groupName: "工程请示",
        features: [
          {
            featureCode: "smallEngineering:projectRequest:create",
            featureName: "新增",
          },
        ],
      },
      {
        groupCode: "projectExamineApprove",
        groupName: "工程审批",
        features: [
          {
            featureCode: "smallEngineering:projectExamineApprove:create",
            featureName: "新增",
          },
        ],
      },
      {
        groupCode: "projectPatrol",
        groupName: "工程巡查",
        features: [
          {
            featureCode: "smallEngineering:projectPatrol:createTask",
            featureName: "新增巡查任务",
          },
          {
            featureCode: "smallEngineering:projectPatrol:createPlan",
            featureName: "新增巡查计划",
          },
        ],
      },
      {
        groupCode: "projectCorrection",
        groupName: "工程整改",
        features: [
          {
            featureCode: "smallEngineering:projectCorrection:create",
            featureName: "新增",
          },
        ],
      },
      {
        groupCode: "projectManage",
        groupName: "工程管理",
        features: [
          {
            featureCode: "smallEngineering:projectManage:download",
            featureName: "导出",
          },
        ],
      },
    ],
  },
  // 日常巡检
  {
    applicationCode: "INSPECTION",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "patrolInspect:cardView:homeCard",
            featureName: "app日常巡检首页卡片",
          },
        ],
      },
      {
        groupCode: "inspectTask",
        groupName: "巡检任务",
        features: [
          {
            featureCode: "patrolInspect:inspectTask:deleted",
            featureName: "删除",
          },
        ],
      },
    ],
  },
  // 电子巡更
  {
    applicationCode: "ELECTRONIC_PATROL",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "electronicPatrol:cardView:homeCard",
            featureName: "app电子巡更首页卡片",
          },
        ],
      },
      {
        groupCode: "electronicPatrol",
        groupName: "巡更任务",
        features: [
          {
            featureCode: "electronicPatrol:task:deleted",
            featureName: "删除",
          },
        ],
      },
    ],
  },
  // 故障报修
  {
    applicationCode: "FAULT",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "faultReport:cardView:homeCard",
            featureName: "app故障报修首页卡片",
          },
        ],
      },
    ],
  },
  // 隐患排查
  {
    applicationCode: "HIDDENDANGER",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "hiddenDanger:cardView:homeCard",
            featureName: "app隐患排查首页卡片",
          },
        ],
      },
    ],
  },
  // 工作汇报
  {
    applicationCode: "WORK_REPORT",
    children: [
      {
        groupCode: "workReportArrange",
        groupName: "工作安排",
        features: [
          {
            featureCode: "workReport:arrange:delete",
            featureName: "工作安排删除",
          },
        ],
      },
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "workReport:cardView:homeCard",
            featureName: "APP首页工作汇报卡片",
          },
        ],
      },
    ],
  },
  // 考勤
  {
    applicationCode: "ATTENDANCE_MANAGEMENT",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "attendance:cardView:homeCard",
            featureName: "app考勤管理首页卡片",
          },
        ],
      },
      {
        groupCode: "attendanceGroup",
        groupName: "考勤组管理",
        features: [
          {
            featureCode: "attendance:group:add",
            featureName: "新增考勤组",
          },
          {
            featureCode: "attendance:group:update",
            featureName: "编辑考勤组",
          },
          {
            featureCode: "attendance:group:info",
            featureName: "考勤组详情",
          },
          {
            featureCode: "attendance:group:delete",
            featureName: "删除考勤组",
          },
        ],
      },
      {
        groupCode: "attendanceClasses",
        groupName: "班次管理",
        features: [
          {
            featureCode: "attendance:classes:add",
            featureName: "新增班次",
          },
          {
            featureCode: "attendance:classes:update",
            featureName: "编辑班次",
          },
          {
            featureCode: "attendance:classes:delete",
            featureName: "删除班次",
          },
        ],
      },
      {
        groupCode: "attendanceSchedulingRules",
        groupName: "排班规则",
        features: [
          {
            featureCode: "attendance:schedulingRules:add",
            featureName: "新增排班规则",
          },
          {
            featureCode: "attendance:schedulingRules:update",
            featureName: "编辑排班规则",
          },
          {
            featureCode: "attendance:schedulingRules:delete",
            featureName: "删除排班规则",
          },
        ],
      },
      {
        groupCode: "attendanceStaffScheduling",
        groupName: "员工排班",
        features: [
          {
            featureCode: "attendance:staffScheduling:export",
            featureName: "导出排班表",
          },
          {
            featureCode: "attendance:staffScheduling:import",
            featureName: "导入排班表",
          },
          {
            featureCode: "attendance:staffScheduling:download",
            featureName: "下载排班模板",
          },
        ],
      },
      {
        groupCode: "attendanceStaffDuty",
        groupName: "员工值班",
        features: [
          {
            featureCode: "attendance:staffDuty:export",
            featureName: "导出值班表",
          },
          {
            featureCode: "attendance:staffDuty:import",
            featureName: "导入值班表",
          },
          {
            featureCode: "attendance:staffDuty:download",
            featureName: "下载值班模板",
          },
        ],
      },
      {
        groupCode: "attendanceClockInRules",
        groupName: "打卡规则",
        features: [
          {
            featureCode: "attendance:clockInRules:add",
            featureName: "新增打卡规则",
          },
          {
            featureCode: "attendance:clockInRules:update",
            featureName: "编辑打卡规则",
          },
          {
            featureCode: "attendance:clockInRules:delete",
            featureName: "删除打卡规则",
          },
        ],
      },
      {
        groupCode: "attendanceClockInRecord",
        groupName: "打卡记录",
        features: [
          {
            featureCode: "attendance:clockInRecord:add",
            featureName: "新增打卡记录",
          },
          {
            featureCode: "attendance:clockInRecord:export",
            featureName: "导出打卡记录",
          },
          {
            featureCode: "attendance:clockInRecord:update",
            featureName: "编辑打卡记录",
          },
          {
            featureCode: "attendance:clockInRecord:viewPic",
            featureName: "查看图片",
          },
        ],
      },
      {
        groupCode: "attendanceclockInLedger",
        groupName: "打卡台账",
        features: [
          {
            featureCode: "attendance:clockInLedger:export",
            featureName: "导出打卡台账",
          },
        ],
      },
      {
        groupCode: "attendanceLeaveRules",
        groupName: "请假规则",
        features: [
          {
            featureCode: "attendance:leaveRules:add",
            featureName: "新增请假规则",
          },
          {
            featureCode: "attendance:leaveRules:update",
            featureName: "编辑请假规则",
          },
          {
            featureCode: "attendance:leaveRules:delete",
            featureName: "删除请假规则",
          },
        ],
      },
      {
        groupCode: "attendanceVacationBalance",
        groupName: "假期余额",
        features: [
          {
            featureCode: "attendance:vacationBalance:export",
            featureName: "导出假期余额",
          },
          {
            featureCode: "attendance:vacationBalance:batchUpdate",
            featureName: "批量修改假期余额",
          },
          {
            featureCode: "attendance:vacationBalance:batchAdd",
            featureName: "批量新增假期余额",
          },
        ],
      },
      {
        groupCode: "attendanceLeaveApproval",
        groupName: "请假审批",
        features: [
          {
            featureCode: "attendance:leaveApproval:add",
            featureName: "新增请假审批",
          },
          {
            featureCode: "attendance:leaveApproval:info",
            featureName: "请假审批详情",
          },
        ],
      },
      {
        groupCode: "attendanceDisposeLeaveApproval",
        groupName: "销假审批",
        features: [
          {
            featureCode: "attendance:disposeLeaveApproval:add",
            featureName: "新增销假审批",
          },
          {
            featureCode: "attendance:disposeLeaveApproval:info",
            featureName: "销假审批详情",
          },
        ],
      },
      {
        groupCode: "attendanceSupplementRules",
        groupName: "补卡规则",
        features: [
          {
            featureCode: "attendance:supplementRules:add",
            featureName: "新增补卡规则",
          },
          {
            featureCode: "attendance:supplementRules:update",
            featureName: "编辑补卡规则",
          },
          {
            featureCode: "attendance:supplementRules:delete",
            featureName: "删除补卡规则",
          },
        ],
      },
      {
        groupCode: "attendanceSupplementApproval",
        groupName: "补卡审批",
        features: [
          {
            featureCode: "attendance:supplementApproval:add",
            featureName: "新增补卡审批",
          },
          {
            featureCode: "attendance:supplementApproval:info",
            featureName: "补卡审批详情",
          },
        ],
      },
      {
        groupCode: "attendanceOvertimeRules",
        groupName: "加班规则",
        features: [
          {
            featureCode: "attendance:overtimeRules:add",
            featureName: "新增加班规则",
          },
          {
            featureCode: "attendance:overtimeRules:update",
            featureName: "编辑加班规则",
          },
          {
            featureCode: "attendance:overtimeRules:delete",
            featureName: "删除加班规则",
          },
        ],
      },
      {
        groupCode: "attendanceOvertimeApproval",
        groupName: "加班审批",
        features: [
          {
            featureCode: "attendance:overtimeApproval:add",
            featureName: "新增加班审批",
          },
          {
            featureCode: "attendance:overtimeApproval:info",
            featureName: "加班审批详情",
          },
        ],
      },
      {
        groupCode: "attendanceChangeApproval",
        groupName: "换班审批",
        features: [
          {
            featureCode: "attendance:changeApproval:add",
            featureName: "新增换班审批",
          },
          {
            featureCode: "attendance:changeApproval:info",
            featureName: "换班审批详情",
          },
        ],
      },
      {
        groupCode: "attendanceOffDutyRules",
        groupName: "离岗规则",
        features: [
          {
            featureCode: "attendance:offDutyRules:add",
            featureName: "新增离岗规则",
          },
          {
            featureCode: "attendance:offDutyRules:update",
            featureName: "编辑离岗规则",
          },
          {
            featureCode: "attendance:offDutyRules:delete",
            featureName: "删除离岗规则",
          },
        ],
      },
      {
        groupCode: "attendanceOffDutyApproval",
        groupName: "离岗审批",
        features: [
          {
            featureCode: "attendance:offDutyApproval:add",
            featureName: "新增离岗审批",
          },
          {
            featureCode: "attendance:offDutyApproval:info",
            featureName: "离岗审批详情",
          },
        ],
      },
      {
        groupCode: "attendanceBusinessTripRules",
        groupName: "出差规则",
        features: [
          {
            featureCode: "attendance:businessTripRules:add",
            featureName: "新增出差规则",
          },
          {
            featureCode: "attendance:businessTripRules:update",
            featureName: "编辑出差规则",
          },
          {
            featureCode: "attendance:businessTripRules:delete",
            featureName: "删除出差规则",
          },
        ],
      },
      {
        groupCode: "attendanceBusinessTripApproval",
        groupName: "出差审批",
        features: [
          {
            featureCode: "attendance:businessTripApproval:add",
            featureName: "新增出差审批",
          },
          {
            featureCode: "attendance:businessTripApproval:info",
            featureName: "出差审批详情",
          },
        ],
      },
      {
        groupCode: "attendanceAttendanceStatisticsDaily",
        groupName: "考勤每日统计",
        features: [
          {
            featureCode: "attendance:attendanceStatisticsDaily:export",
            featureName: "导出",
          },
        ],
      },
      {
        groupCode: "attendanceAttendanceStatistics",
        groupName: "考勤汇总统计",
        features: [
          {
            featureCode: "attendance:attendanceStatistics:export",
            featureName: "导出",
          },
        ],
      },
      {
        groupCode: "attendanceAttendanceStatisticsPre",
        groupName: "考勤汇总预统计",
        features: [
          {
            featureCode: "attendance:attendanceStatisticsPre:export",
            featureName: "导出",
          },
        ],
      },
      {
        groupCode: "attendanceHandleLogRecord",
        groupName: "操作日志",
        features: [
          {
            featureCode: "attendance:handleLogRecord:export",
            featureName: "导出",
          },
        ],
      },
      {
        groupCode: "flowSetting",
        groupName: "流程配置",
        features: [
          {
            featureCode: "attendance:flowSetting:save",
            featureName: "保存",
          },
        ],
      },
      {
        groupCode: "flowApprovalRecord",
        groupName: "考勤审批记录",
        features: [
          {
            featureCode: "attendance:flowApprovalRecord:info",
            featureName: "详情",
          },
        ],
      },
    ],
  },
  // 行政
  {
    applicationCode: "OFFICIAL_MANAGEMENT",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "administration:cardView:homeCard",
            featureName: "app行政管理首页卡片",
          },
        ],
      },
      {
        groupCode: "officialInstitutionalSolicitation",
        groupName: "制度征求",
        features: [
          {
            featureCode: "official:institutionalSolicitation:add",
            featureName: "新增",
          },
          {
            featureCode: "official:institutionalSolicitation:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialInstitutionalStatistics",
        groupName: "制度统计",
        features: [
          {
            featureCode: "official:institutionalStatistics:export",
            featureName: "导出",
          },
          {
            featureCode: "official:institutionalStatistics:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialIssueApprovalList",
        groupName: "议题申请",
        features: [
          {
            featureCode: "official:issueApprovalList:add",
            featureName: "新增",
          },
          {
            featureCode: "official:issueApprovalList:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialIssueStatistics",
        groupName: "议题预报统计",
        features: [
          {
            featureCode: "official:issueStatistics:export",
            featureName: "导出",
          },
          {
            featureCode: "official:issueStatistics:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialUseSealStatistics",
        groupName: "用印申请统计",
        features: [
          {
            featureCode: "official:useSealStatistics:export",
            featureName: "导出",
          },
          {
            featureCode: "official:useSealStatistics:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialDocumentReceivedStatistics",
        groupName: "来文统计",
        features: [
          {
            featureCode: "official:documentReceivedStatistics:export",
            featureName: "导出",
          },
          {
            featureCode: "official:documentReceivedStatistics:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialFileCircularize",
        groupName: "文件传阅",
        features: [
          {
            featureCode: "official:fileCircularize:add",
            featureName: "新增",
          },
          {
            featureCode: "official:fileCircularize:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialDepartmentWorkStatistics",
        groupName: "部门统计",
        features: [
          {
            featureCode: "official:departmentWorkStatistics:export",
            featureName: "导出",
          },
          {
            featureCode: "official:departmentWorkStatistics:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialDocumentReceived",
        groupName: "来文申请",
        features: [
          {
            featureCode: "official:documentReceived:add",
            featureName: "新增",
          },
          {
            featureCode: "official:documentReceived:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialDepartmentWork",
        groupName: "部门工作重点",
        features: [
          {
            featureCode: "official:departmentWork:add",
            featureName: "新增",
          },
          {
            featureCode: "official:departmentWork:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialUseSealApproval",
        groupName: "用印申请",
        features: [
          {
            featureCode: "official:useSealApproval:add",
            featureName: "新增",
          },
          {
            featureCode: "official:useSealApproval:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialSealManage",
        groupName: "印章管理",
        features: [
          {
            featureCode: "official:sealManage:add",
            featureName: "新增",
          },
          {
            featureCode: "official:sealManage:edit",
            featureName: "编辑",
          },
          {
            featureCode: "official:sealManage:delete",
            featureName: "删除",
          },
        ],
      },
      {
        groupCode: "officialEventApproval",
        groupName: "事项审批",
        features: [
          {
            featureCode: "official:eventApproval:add",
            featureName: "新增",
          },
          {
            featureCode: "official:eventApproval:details",
            featureName: "事项审批详情",
          },
        ],
      },
      {
        groupCode: "officialEventHandleApproval",
        groupName: "事项处理审批",
        features: [
          {
            featureCode: "official:eventHandleApproval:details",
            featureName: "事项处理审批详情",
          },
        ],
      },
      {
        groupCode: "officialApprovalStatistics",
        groupName: "审批统计",
        features: [
          {
            featureCode: "official:approvalStatistics:export",
            featureName: "导出",
          },
          {
            featureCode: "official:approvalStatistics:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialEventHandle",
        groupName: "事项处理",
        features: [
          {
            featureCode: "official:eventHandle:feedback",
            featureName: "反馈",
          },
          {
            featureCode: "official:eventHandle:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialEventChange",
        groupName: "事项变更",
        features: [
          {
            featureCode: "official:eventChange:add",
            featureName: "新增",
          },
          {
            featureCode: "official:eventChange:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialEventExchangeStat",
        groupName: "事项变更统计",
        features: [
          {
            featureCode: "official:eventChangeStat:export",
            featureName: "导出",
          },
          {
            featureCode: "official:eventChangeStat:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "officialMatterUrge",
        groupName: "催办申请",
        features: [
          {
            featureCode: "official:matterUrge:add",
            featureName: "新增",
          },
          {
            featureCode: "official:matterUrge:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "flowSetting",
        groupName: "流程配置",
        features: [
          {
            featureCode: "official:flowSetting:save",
            featureName: "保存",
          },
        ],
      },
      {
        groupCode: "officialWorkOrder",
        groupName: "工单中心",
        features: [
          {
            featureCode: "official:workOrder:details",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "flowApprovalRecord",
        groupName: "行政审批记录",
        features: [
          {
            featureCode: "official:flowApprovalRecord:info",
            featureName: "详情",
          },
        ],
      },
    ],
  },
  // 人事
  {
    applicationCode: "PERSONNELMANAGEMENT",
    children: [
      {
        groupCode: "flowApprovalRecord",
        groupName: "人事审批记录",
        features: [
          {
            featureCode: "personnel:flowApprovalRecord:info",
            featureName: "详情",
          },
        ],
      },
      {
        groupCode: "userInfo",
        groupName: "员工花名册",
        features: [
          {
            featureCode: "personnelManagement:userInfo:userPermission",
            featureName: "业务权限",
          },
        ],
      },
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "personnelManagement:cardView:homeCard",
            featureName: "app人事管理首页卡片",
          },
        ],
      },
    ],
  },
  // APP工作中心
  {
    applicationCode: "AGENCY_CENTER",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "todoCenter:cardView:homeCard",
            featureName: "APP首页工作中心卡片",
          },
        ],
      },
    ],
  },
  // APP通知公告 EQUIPMENT_SUPERVISION
  {
    applicationCode: "TECHNICAL_BULLETIN",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "notice:cardView:homeCard",
            featureName: "APP首页通知公告卡片",
          },
        ],
      },
    ],
  },
  // APP设备监管
  {
    applicationCode: "EQUIPMENT_SUPERVISION",
    children: [
      {
        groupCode: "cardView",
        groupName: "卡片",
        features: [
          {
            featureCode: "deviceCenter:cardView:homeCard",
            featureName: "APP首页设备总览卡片",
          },
        ],
      },
    ],
  },
  // 粮仓管理
  {
    applicationCode: "RESERVE_MONITORING",
    children: [
      {
        groupCode: "mainManagement",
        groupName: "粮仓管理",
        features: [
          {
            featureCode: "granaryManagement:mainManagement:permission",
            featureName: "权限配置",
          },
        ],
      },
    ],
  },
];
