import { type BaseAPIResult, Get, service } from "@ghcloud/ghcloud-business-request";

import type { PageResult } from "./common-type";
export const attendanceApprovePage = async (params: {
  pageNumber: number;
  pageSize: number;
  businessType?: string; // 业务类型
  period?: string;
  sceneCode?: string; // 场景编码
  userId?: number;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get("/attendance/att/getApproveByUserPage", {
    params,
  });
};

export interface FlowApprovalRecordPageParams {
  pageNumber: number;
  pageSize: number;
  applicationCode: string;
  businessType: string | undefined;
  organizationId: string | undefined;
  submitTime: string | undefined;
  businessTime: string | undefined;
  status: string | undefined;
  username: string | undefined;
}

/** 考勤流程审批记录 */
export const flowApprovalRecordPage = async (params: FlowApprovalRecordPageParams): Promise<BaseAPIResult<PageResult>> =>
  Get("/attendance/att/approve/record/page", { params });

export type FlowApprovalRecordExportParams = Omit<FlowApprovalRecordPageParams, "pageNumber" | "pageSize">;

/** 流程审批记录导出 */
export const flowApprovalRecordExport = async (params: FlowApprovalRecordExportParams): Promise<BaseAPIResult> =>
  service.get("/attendance/att/approve/record/export", { params });
