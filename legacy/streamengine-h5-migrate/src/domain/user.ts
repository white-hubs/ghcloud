export interface AppUser {
  id: string;
  name: string;
}

export interface StaffUser {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  mobile: string;
  // 性别
  genderName: string;
  // 职位 id
  appointmentId: string;
  // 职位 name
  appointmentName: string;
  // 入职日期
  // TODO(dabnke): 暂时是 13 位时间戳，后续在接口层转换
  inductionDate: number;
  // 员工编号
  jobNumber: string;
  // 员工角色
  roleId: string;
  organizations: { id: string; name: string }[];
}

export interface OuaaUser {
  id: string;
  name: string;
  mobile: string;
  workStatus:string;
  organizations: { id: string; name: string }[];
}
