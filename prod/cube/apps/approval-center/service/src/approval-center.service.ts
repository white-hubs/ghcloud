import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import {
  PageResult,
  WorkOrderStatisticsModel,
  RowState,
  FormGroupTypeVO,
  FormFlowGroupVO,
  CustomFormFlowTypeVO,
  FormFlowDetailVO,
  FlowProcessVO,
  WorkOrderBusinessTypeModel,
} from "./types";

const baseURL = `${BASE_API}/flow`;

export class CubeApprovalCenterService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  // 获取工单统计列表
  public async getWorkOrderStatisticsList(payload: {
    pageNumber: number;
    pageSize: number;
    applicationCode?: string | undefined;
    businessType?: string | undefined;
    formGroupId?: string | undefined;
    keyword?: string | undefined;
    organizationId?: string | undefined;
    userIds?: string | undefined;
    period?: string | undefined;
  }): Promise<PageResult<WorkOrderStatisticsModel>> {
    const url = `${baseURL}/statistics/group/businessType`;
    const resp = await this.gateway.get<PageResult<WorkOrderStatisticsModel>>({ url, payload });
    return resp;
  }

  // 导出工单统计列表
  public async exportWorkOrderStatisticsList(payload: {
    applicationCode?: string | undefined;
    businessType?: string | undefined;
    formGroupId?: string | undefined;
    keyword?: string | undefined;
    organizationId?: string | undefined;
    userIds?: string | undefined;
    period?: string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/statistics/group/businessType/export`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
    return resp;
  }

  // 获取工单列表
  public async getWorkOrderList(payload: {
    businessType?: string | undefined;
    organizationId?: string | undefined;
    status?: string | undefined;
    submitTime?: string;
    pageNumber: number;
    pageSize: number;
    username?: string;
    applicationCode?: string | undefined;
  }): Promise<PageResult<RowState>> {
    const url = `${baseURL}/process/instance/historical/allPage`;
    const resp = await this.gateway.get<PageResult<RowState>>({ url, payload });
    return resp;
  }

  // 导出工单列表
  public async exportWorkOrderList(payload: {
    applicationCode?: string | undefined;
    businessType?: string | undefined;
    organizationId?: string | undefined;
    username?: string | undefined;
    submitTime?: string | undefined;
    status?: string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/process/instance/historical/export`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
    return resp;
  }

  // 表单流程分组（新增/修改）
  public async updateFormFlowGroup(payload: { id: string | undefined; name: string; application?: string }): Promise<boolean> {
    const url = `${baseURL}/form-flow-group/save-or-update`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }

  // 表单流程分组（删除）
  public async deleteFormFlowGroup(id: string): Promise<void> {
    const url = `${baseURL}/form-flow-group/${id}`;
    return await this.gateway.delete({ url });
  }

  // 获取分组下的工单个数(全量)
  public async getFormFlowGroupCount(payload?: {
    keyword?: string;
    formFlowIds?: string[];
    filterEmpty?: boolean;
    application?: string | undefined;
  }): Promise<FormFlowGroupVO[]> {
    const url = `${baseURL}/custom-form-flow/group/count`;
    const resp = await this.gateway.get<FormFlowGroupVO[]>({ url, payload });
    return resp;
  }

  // 获取分组下的工单个数(全量)-权限校验
  public async getPermissionFormFlowGroupCount(payload?: {
    keyword?: string;
    formFlowIds?: string[];
    filterEmpty?: boolean;
    application?: string | undefined;
  }): Promise<FormFlowGroupVO[]> {
    const url = `${baseURL}/custom-form-flow/group/permission/count`;
    const resp = await this.gateway.get<FormFlowGroupVO[]>({ url, payload });
    return resp;
  }

  // 表单流程分组-列表
  public async getFormFlowGroupList(payload?: { application?: string }): Promise<FormGroupTypeVO[]> {
    const url = `${baseURL}/form-flow-group/list`;
    const resp = await this.gateway.get<FormGroupTypeVO[]>({ url, payload });
    return resp;
  }

  // 获取自定义表单下的业务类型
  public async getCustomFormFlowTypeList(payload?: { application?: string }): Promise<CustomFormFlowTypeVO[]> {
    const url = `${baseURL}/custom-form-flow/business/type`;
    const resp = await this.gateway.get<CustomFormFlowTypeVO[]>({ url, payload });
    return resp;
  }

  // 获取表单配置列表（分页）
  public async getFormFlowPageList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
    type?: string | undefined;
    fromGroupId?: string | number | undefined;
    enable?: boolean | undefined;
    application?: string | undefined;
  }): Promise<PageResult<FormFlowDetailVO>> {
    const url = `${baseURL}/custom-form-flow/page`;
    const resp = await this.gateway.get<PageResult<FormFlowDetailVO>>({ url, payload });
    return resp;
  }

  /** 表单发布-新增 */
  public async addFormFlow(payload: { name: string; code: string; remark?: string }): Promise<string> {
    const url = `${baseURL}/custom-form-flow/save-or-update`;
    const resp = await this.gateway.create<string>({ url, payload });
    return resp;
  }

  /** 启用表单-修改 */
  public async updateFormFlowEnable(payload: { id: string; enable: boolean }): Promise<boolean> {
    const url = `${baseURL}/custom-form-flow/enable?id=${payload.id}&enable=${payload.enable}`;
    const resp = await this.gateway.update<boolean>({ url });
    return resp;
  }

  /** 删除表单 */
  public async deleteFormFlow(id: string): Promise<void> {
    const url = `${baseURL}/custom-form-flow/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }

  /** 获取审批列表 */
  public async getFlowProcessPage(payload: {
    applicationCode?: string | undefined;
    fromGroupId?: string;
    businessType?: string;
    organizationId?: string;
    pageNumber: number;
    pageSize: number;
    processInstanceIds?: string;
    processInstanceIdsList?: string[];
    startUserId?: string;
    status?: string;
    submitTime?: string;
    type?: string;
    username?: string;
  }): Promise<PageResult<FlowProcessVO>> {
    const url = `${baseURL}/process/instance/historical/page`;
    const resp = await this.gateway.get<PageResult<FlowProcessVO>>({ url, payload });
    return resp;
  }

  /** 批量删除工单列表 */
  public async deleteWorkOrder(payload: string[]): Promise<boolean> {
    const url = `${baseURL}/form/instance/form-flows/delete`;
    const resp = await this.gateway.create<boolean>({ url, payload: payload as never });
    return resp;
  }

  /** 获取工单类型列表 */
  public async getWorkOrderBusinessTypeList(payload?: { application?: string }): Promise<WorkOrderBusinessTypeModel[]> {
    const url = `${baseURL}/form-business/type/list`;
    const resp = await this.gateway.get<WorkOrderBusinessTypeModel[]>({ url, payload });
    return resp;
  }

  /** 公开表单分享链接生成二维码 */
  public async getQrCode(payload: { tenant: string; id: string; qrCodeUrl: string; businessType: string }): Promise<{ path: string }> {
    const url = `${baseURL}/form-flow/qr-code`;
    const resp = await this.gateway.get<{ path: string }>({ url, payload });
    return resp;
  }
}
