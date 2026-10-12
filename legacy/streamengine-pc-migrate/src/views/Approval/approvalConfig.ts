interface DAMNU_ENABLE {
  [key: string]: any; // 字段扩展声明
}

export const RECORD_APP_BUSINESS_TYPE: DAMNU_ENABLE = {
  // 考勤管理
  ATTENDANCE_MANAGEMENT: {
    REPAIR_CLOCK: "补卡申请",
    OVERTIME: "加班申请",
    CHANGE_CLASSES: "换班申请",
    LEAVE: "请假申请",
    LEAVE_THE_POST: "离岗申请",
    CANCEL_LEAVE: "销假申请",
    AWAY_BUSINESS: "出差申请",
  },
  // 人事管理
  PERSONNELMANAGEMENT:{
    PERSONNEL_RECRUIT:'招聘申请',
    PERSONNEL_INDUCTION:'入职审批',
    PERSONNEL_PROBATION_ASSESS:'试用考核',
    PERSONNEL_REGULAR_WORKER:'转正申请',
    PERSONNEL_TRAIN:'培训申请',
    PERSONNEL_LEAVE_OFFICE:'离职申请',
    PERSONNEL_LEAVE_OFFICE_PROCEDURES:'离职手续',
    PERSONNEL_ROTATION_POST:'轮岗申请',
  },
  // 考勤管理
  ATTENDANCE_MANAGE: {
    REPAIR_CLOCK: "补卡申请",
    OVERTIME: "加班申请",
    CHANGE_CLASSES: "换班申请",
    LEAVE: "请假申请",
    LEAVE_THE_POST: "离岗申请",
    CANCEL_LEAVE: "销假申请",
    AWAY_BUSINESS: "出差申请",
  },
  /**工作汇报 */
  WORK_REPORT: {
    REPORT: "工作汇报",

  },
  OUTSOURCE_REPAIR:{
    OUTSOURCE_REPAIR:'委外维修'
  
  },
  // 行政管理
  OFFICIAL_MANAGEMENT: {
    OFFICIAL_FOCUS_WORK: "事项审批",
    OFFICIAL_FOCUS_WORK_REPLY: "处理审批",
    OFFICIAL_FOCUS_WORK_UPDATE: "事项变更",
    OFFICIAL_URGENT_WORK: "事项催办",
    OFFICIAL_REGULATION: "制度征求",
    OFFICIAL_TOPIC: "议题预报",
    OFFICIAL_SEAL: "用印申请",
    OFFICIAL_DOCUMENT_CIRCULATION: "公文传阅",
    OFFICIAL_DOCUMENT_RECEIVED: "来文处理",
    OFFICIAL_KEY_WORK: "部门工作",
  },

};
export const RECORD_APP_FUNCTION_CODES: DAMNU_ENABLE = {
  // 考勤
  ATTENDANCE_MANAGEMENT: {
    // 审批记录
    APPROVAL_RECORD: {
      info: "attendance:approval:record:info",
    },
  },
  // 行政
  OFFICIAL_MANAGEMENT: {
    // 审批记录
    APPROVAL_RECORD: {
      info: "work_order_detials",
    },
  },
  // 人事
  PERSONNELMANAGEMENT:{
    APPROVAL_RECORD:{
      info:'personnel:approval:record:detials'
    }
  },
  // 工作汇报
  WORK_REPORT:{
    APPROVAL_RECORD:{
      info:'work-report:detials'
    }
  },
  OUTSOURCE_REPAIR:{
    APPROVAL_RECORD:{
      info:'work-report:detials'
    }
  }
};
