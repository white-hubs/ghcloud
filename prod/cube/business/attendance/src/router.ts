import type { RouteRecordRaw } from "vue-router";
/** 班次管理 */
import ClassManage from "@/routers/classes-mange";
/** 考勤组管理 */
import AttendanceGroup from "@/routers/attendance-group";
/** 排班管理 */
import SchedulingManage from "@/routers/scheduling-manage";
/** 员工打卡 */
import StaffClockIn from "@/routers/staff-clock-in";

/** 员工请假 */
import StaffLeave from "@/routers/staff-leave";
/** 员工加班 */
import StaffOverTime from "@/routers/staff-overtime";
/** 员工补卡 */
import StaffSupplement from "@/routers/staff-supplement";
/** 员工换班 */
import StaffChange from "@/routers/staff-change";
/** 员工离岗 */
import StaffOffDuty from "@/routers/staff-off-duty";
/** 员工出差 */
import StaffBusinessTrip from "@/routers/staff-business-trip";

/** 考勤台账 */
import attendanceLedger from "@/routers/attendance-ledger";
/** 考勤预统计 */
import attendancePreStatistics from "@/routers/attendance-prestatistics";
import messageCenter from "@/routers/message";
/** 操作日志记录 */
import handleRecord from "@/routers/handle-record";
/** 考勤汇总下钻审批记录 */
import attendanceRecord from "@/routers/attendance-record";
/** 考勤流程审批记录 */
import flowApprovalRecord from "@/routers/flow-approval-record";

export const routes: RouteRecordRaw[] = [
  ...messageCenter,
  ...attendancePreStatistics,
  ...attendanceLedger,
  ...ClassManage,
  ...AttendanceGroup,
  ...SchedulingManage,
  ...StaffClockIn,
  ...StaffLeave,
  ...StaffOverTime,
  ...StaffSupplement,
  ...StaffChange,
  ...StaffOffDuty,
  ...StaffBusinessTrip,
  ...handleRecord,
  ...attendanceRecord,
  ...flowApprovalRecord,
];
