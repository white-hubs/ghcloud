export const FaultStatus = new Map([
  ['ACTIVE', '处理中'],
  ['FINISHED', '已完成'],
  ['UNDO', '已撤销'],
  ['REJECT', '已驳回'],
])
export const FaultColorStatus = new Map([
  ['ACTIVE', '#FFAA26'],
  ['FINISHED', '#6AB539'],
  ['UNDO', '#C7C7C7'],
  ['REJECT', '#FF4158'],
])
export const CultivateMode = new Map([
  ['OFFLINE', '线下培训'],
  ['ONLINE', '线上培训'],
])
export const ApproveTask = [
  'LEAVE',
  'CHANGE_CLASSES',
  'OVERTIME',
  'LEAVE_THE_POST',
  'REPAIR_CLOCK',
  'HIDDENDANGER',
  'FAULT',
  'OUTSOURCE_REPAIR',
  'retrofit_ticket',
  'RETROFIT',
  'PERSONNEL_RECRUIT',
  'PERSONNEL_INDUCTION',
  'PERSONNEL_PROBATION_ASSESS',
  'PERSONNEL_REGULAR_WORKER',
  'PERSONNEL_TRAIN',
  'PERSONNEL_LEAVE_OFFICE',
  'PERSONNEL_LEAVE_OFFICE_PROCEDURES',
  'PERSONNEL_ROTATION_POST',
  'OFFICIAL_REGULATION',
  'OFFICIAL_SEAL',
  'OFFICIAL_TOPIC',
  'OFFICIAL_DOCUMENT_CIRCULATION',
  'OFFICIAL_DOCUMENT_RECEIVED',
  'OFFICIAL_KEY_WORK',
  'OFFICIAL_URGENT_WORK',
  'OFFICIAL_FOCUS_WORK',
  'OFFICIAL_FOCUS_WORK_REPLY',
  'OFFICIAL_FOCUS_WORK_UPDATE',
  'WORK_REPORT',
  'CONSUMABLE_ADD',
  'CONSUMABLE_REDUCE',
  'PROPERTY_ALLOT_PERSONAL',
  'PROPERTY_ALLOT_UNIT',
  'PROPERTY_DEPOSITORY',
  'PROPERTY_WEED_OUT'
]
export interface TaskType {
  id: string;
  taskName: string;
  taskTime: number;
  businessKey: string;
  businessTypeName: string;
  businessStatusName: string;
  businessPrincipal: string;
  businessType: string;
  applicationName: string;
  applicationCode: string;
}
export const applicationBackgroundColor = new Map([
  ['OFFICIAL_MANAGEMENT', '#1578ff19'],
  ['PERSONNELMANAGEMENT', '#6ab53919'],
  ['ATTENDANCE_MANAGEMENT', '#F6970319'],
  ['ELECTRONIC_PATROL', '#6AB53919'],
  ['FAULT', '#EA433119'],
  ['HIDDENDANGER', '#EA433119']
])
export const applicationTextColor = new Map([
  ['OFFICIAL_MANAGEMENT', '#1578FF'],
  ['PERSONNELMANAGEMENT', '#6AB539'],
  ['ATTENDANCE_MANAGEMENT', '#F69703'],
  ['ELECTRONIC_PATROL', '#6AB539'],
  ['FAULT', '#EA4331'],
  ['HIDDENDANGER', '#EA4331']
])
