export interface Organization {
  id: string;
  name: string;
}
export interface SuperviseUser {
  id: string;
  name: string;
  mobile: string;
  gender: string;
  workStatus: string;
  remark: string;
  username: string;
  password: string;
  enabled: boolean;
  entryDate?: number;
  photographKey: string;
  organization: Organization;
  organizations: unknown[];
  positions: unknown[];
  roles: unknown[];
  photographList: unknown[];
  tenants: unknown[];
  admin?: unknown;
}
export interface SuperviseProgressVo {
  id: string;
  recordTime: number;
  username: string;
  depName: string;
  operation: string;
  operationCode: 'FEEDBACK' | 'CHECK_ACCEPT';
  feedbackContent: string;
  checkAcceptContent: string;
}
export interface SuperviseDetailVo {
  id: string;
  projectName: string;
  status: string;
  schedule: number;
  statusCode: string;
  projectNum?: string;
  superviseDepId: string;
  superviseDepList: Organization[];
  constructB: string;
  partyB: string;
  overTime?: number;
  depName: string;
  depId?: string;
  stallCode?: string;
  stallLiaison?: string;
  stallMobile?: string;
  safetyDockUserName?: string;
  partyBMobile?: string;
  duration: string;
  superviseUser: SuperviseUser[];
  safetyDockUser: SuperviseUser[];
  completionTime: string;
  checkAcceptResult: string;
  checkAcceptRemark: string;
  checkFiles: { id: string; }[];
  projectType: string;
  projectTypeName: string;
  constructionSite: string;
  safetyDockUserId: string;
  superviseDep: string;
  superviseUsers: string;
  remarks: string;
  projectFiles: unknown[];
  typeId: string;
}
