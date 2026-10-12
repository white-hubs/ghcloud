import { request } from "@/service";
let baseURL = "/attendance";

//考勤数据
export const getAttendanceStat = (params: {
  userId: string;
  period: string;
  type: string;
}) => {
  return request.get(baseURL + `/personnel/getClockInDetailsByUserId`, { params });
};

// 假期类型列表
export const getHolidayList = () => {
  return request.get('/attendance/att/holiday/rule/list');
};

//假期余额
export const getVacationBalance = (params: {
  staffId: any;
  holidayRuleId: any;
}) => {
  return request.get('/attendance/att/Holiday/balance/total',{params});
};

// 假期详情类型
export const getHolidayDetailType = (params: { type: any }) => {
  return request.get(baseURL + `/detail/type/${params?.type ?? params}`);
};

// 请假时长获取
export const getVacationDuration = (params: any) => {
  return request.get('/attendance/att/askLeave/calcDuration', {params});
};

// 请假单分页
export const getCancelAskFromPage = (params: any) => {
  return request.get('/attendance/att/askLeaveFrom/cancelAskFrom/page', {params});
};

// 查询班次信息
export const getWorkClasses = (params: {
  userId: string | number;
  workType: string;
}) => {
  return request.get(baseURL + `/work/classes`, { params });
};

// 查询班次信息 2.0
export const getExchangeClasses = (params: {
  staffId: string | number;
  workType: string;
  day:string
}) => {
  return request.get(baseURL + `/att/exchange/classes`, { params });
};

// 查询补卡班次信息
export const getClockClasses = (params: {
  userId: string | number;
  repairDate: string;
}) => {
  return request.get(baseURL + `/clock/classes/exp`, { params });
};

/** 查询补卡班次 2.0 */
export const clockInLogByDate = (params: {
  userId: string | number;
  clockInDate: string;
  abnormal?:boolean;
}) => {
  return request.get('/attendance/getClockInLogByDate', { params });
};


// 考勤组获取枚举数据
export const getAttendanceGroupEnumerate = (params: { type: string }) => {
  return request.get(baseURL + `/attendance-group/enumerate/list`, { params });
};
// 查询换班人员
export const getWorkUsers = () => {
  return request.get(baseURL + `/work/users`);
};
// 获取加班时间段
export const getWorkOvertimePeriod = (params: {
  workOvertimeType: string;
  period: string;
}) => {
  return request.get(baseURL + `/work/overtime/period`, { params });
};

// 获取加班时长
export const getWorkOvertimeDuration = (params: {
  workOvertimeType: string;
  period: string;
}) => {
  return request.get(baseURL + `/work/overtime/duration`, { params });
};

// 获取加班补偿
export const getWorkOvertimeCompensation = (params: {
  processInstanceId?: string;
  workOvertimeType:any
}) => {
  return request.get(baseURL + `/work/overtime/compensation`, { params });
};

// 离岗时长
export const leavePostDuration = (params: any) => {
  return request.get(baseURL + `/att/leavePost/duration`, {params});
};

// 出差时长
export const awayBusinessDuration = (params: any) => {
  return request.get(baseURL + `/att/awayBusiness/duration`, {params});
};


// 检查调换的班次是否符合要求
export const postClassesChangeCheck = (params: any) => {
  // return request.post(baseURL + `/work/classes/change/check`, params);
  return request.post(baseURL + `/att/exchange/check`, params);
};

// 补卡检查（检查是否能够提交补卡
export const postClockRepairCheck = (params: any) => {
  return request.post(baseURL + `/att/approve/verification`, params);
  // return request.post(baseURL + `/clock/repair/check`, params);
};


// 校验是否可再次发起加班申请
export const overtimeCheck = (params: any) => {
  return request.post(baseURL + `/work/overtime/check`, params);
};
// 获取考勤统一提交接口
export const attendanceApprovalSubmit = (params: Record<string,any>) => {
  return request.post(`/attendance/att/approval/submit`, params);
};
