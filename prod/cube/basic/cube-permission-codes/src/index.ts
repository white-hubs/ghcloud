export const FIRSTCODE_FOR_APPCODE = {
  alarmCenter: "ALARM_CENTER",
  attendance: "ATTENDANCE_MANAGEMENT",
  patrol: "ELECTRONIC_PATROL",
  official: "OFFICIAL_MANAGEMENT",
  property: "PROPERTY_MANAGEMENT",
  riskSource: "RISK_SOURCE",
  riskControl: "RISK_GRADED_CONTROL",
  safetyEducation: "SECURE_EDU",
  project: "SMALLENFINEERING",
  personnel: "PERSONNELMANAGEMENT",
  faultWarranty: "FAULT",
  hiddenDanger: "HIDDENDANGER",
  inspect: "INSPECTION",
  parking: "PARKINGMANAGE",
  dailyTask: "DAILY_TASK",
  formAssessment: "FORM_ASSESSMENT",
};
// 判断是否当前应用有权限
export const hasPermission = (code: string): boolean => {
  const functionCodes = JSON.parse(sessionStorage.getItem("user-function-roles") ?? "[]") as { code: string }[];
  // if(code === 'smallEngineering:projectSupervise:update')
  return functionCodes.map((item) => item.code).includes(code);
};
