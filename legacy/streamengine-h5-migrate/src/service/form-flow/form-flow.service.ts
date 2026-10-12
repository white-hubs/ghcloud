import { showNotify } from "vant";

import { getApiBaseUrL, getAuthHeaders, cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import { ApprovalOpinion, FormFlow, FormFlowInstance, FormOption } from "../../domain/form-flow";
import { HTTPClientImpl } from "../../infrastructure/http-client";
import { getParams } from "../../utils";
import { BaseAPIResult } from "../base-api";
import { cubeParkingLotService, cubePersonnelManagementService } from "../service";
import { staffService } from "../staff/staff.service";
type FlowFormData = Record<string, any>;
interface UserSignState {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey?: any;
  user: string;
  phone: string;
}
const params = getParams();
class FormFlowService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL() ?? "/api",
    headers: getAuthHeaders(),
  });
  //如果为公开表单，不需要header
  private readonly publicClient = new HTTPClientImpl({
    baseURL: getApiBaseUrL() ?? "/api",
    headers: { tenant: params.tenant },
  });

  private getBranchs(obj: any, arr = []): any[] {
    if (obj?.branchs && typeof obj?.branchs !== "undefined" && obj?.branchs.length > 0) {
      for (const key in obj.branchs) {
        // @ts-expect-error
        arr.push(obj.branchs[key]);
        if (typeof obj.branchs[key].children !== "undefined") {
          this.getBranchs(obj.branchs[key].children, arr);
        }
      }
    }
    if (typeof obj?.children !== "undefined") {
      this.getBranchs(obj?.children, arr);
    }
    return arr;
  }
  private getConditions(arr: any): any[] {
    let res: any[] = [];
    arr.forEach((e: any) => {
      if (typeof e.props.groups !== "undefined") {
        e.props.groups.forEach((ele: any) => {
          res = [...res, ...ele.conditions];
        });
      }
    });
    return res;
  }
  private convertConditions(arr: any[], formData: FlowFormData): Record<string, any> {
    const obj: Record<string, any> = {};
    arr.forEach((e) => {
      const key = e.id;
      let value = formData[key];
      obj[key] = value;
      if (key !== "root") {
        obj[key] = value ?? "";
      }
      // 值需要转换
      if (e.name === "OvertimeLength") {
        // 加班时长，目前单位都是小时 需要转换成天
        value = Math.floor((formData[key].name / 8) * 100) / 100;
        obj[key] = parseFloat(value);
      }
      if (e.name === "VacationLength") {
        // 请假时长，DAY 天 HOUR 小时 HALF_DAY半天
        value = Math.floor((formData[key] / 8) * 100) / 100;
        obj[key] = parseFloat(value);
      }
      if (e.name === "DepartureTimeLength") {
        // 离岗时长
        value = Math.floor((formData[key] / 8) * 100) / 100;
        obj[key] = parseFloat(value);
      }
      if (e.name === "DeptPicker") {
        if (formData[key].length) {
          value = formData[key].map((item: any) => item.id);
        } else {
          value = [];
        }
        obj[key] = value;
      }
    });
    return obj;
  }
  private findBackLogTitleFormItem(items: FormOption[] = []): FormOption | undefined {
    for (const item of items) {
      if (item.name === "TextInput" && item.props?.useAsBackLogTitle) {
        return item;
      }

      if (Array.isArray(item.props?.items)) {
        const found = this.findBackLogTitleFormItem(item.props.items);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }
  private getBackLogTitle(formFlowConfig: FormFlow, formData: FlowFormData, defaultTitle: string): string {
    try {
      const formItems = formFlowConfig.formJson ? JSON.parse(formFlowConfig.formJson) : [];
      const titleFormItem = this.findBackLogTitleFormItem(Array.isArray(formItems) ? formItems : []);
      if (!titleFormItem) {
        return defaultTitle;
      }

      const value = formData?.[titleFormItem.id];
      return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
    } catch {
      return defaultTitle;
    }
  }

  public async getFormFlow(type: string): Promise<FormFlow> {
    const result = await this.client.get<FormFlow>(`/flow/form-flow-business/type?businessType=${type}`);
    return result;
  }
  public async getPublicFormFlow(type: string): Promise<FormFlow> {
    const result = await this.publicClient.get<FormFlow>(`/flow/public/form-flow-business/type?businessType=${type}`);
    return result;
  }
  public async getLastUserSign(): Promise<UserSignState> {
    const result = await this.client.post<UserSignState>(`/flow/process/task/user-last-sign`, {});
    return result;
  }

  public async submitForm(businessType: string, formFlowConfig: FormFlow, formData: FlowFormData): Promise<string> {
    const branchArr = this.getBranchs(JSON.parse(formFlowConfig.flowJson));
    const conditions = this.getConditions(branchArr);
    const variables = this.convertConditions(conditions, formData);

    // 隐藏排查、故障报修传参
    if (["FAULT", "HIDDENDANGER"].includes(businessType)) {
      variables["resource"] = "MANUAL_SUBMISSION";
    }
    try {
      if (getEnvironment() === "cubeApp") {
        const appBusinessData = await cubeAppService.getBusinessData();
        if (appBusinessData && appBusinessData.business_source) {
          variables["resource"] = appBusinessData.business_source;
        }
      }
    } catch (error) {}
    // 获取审批和抄送节点
    function getApprovalAndCCNode(obj: any, arr: any[] = []): any[] {
      if (!obj) {
        return arr;
      }
      if (obj?.type === "APPROVAL" || obj?.type === "CC") {
        arr.push(obj);
      }
      if (typeof obj.branchs !== "undefined" && obj.branchs.length > 0) {
        for (const key in obj.branchs) {
          if (obj.branchs[key].type === "APPROVAL" || obj.branchs[key].type === "CC") {
            arr.push(obj.branchs[key]);
          }
          if (typeof obj.branchs[key].children !== "undefined") {
            getApprovalAndCCNode(obj.branchs[key].children, arr);
          }
        }
      }
      if (typeof obj.children !== "undefined") {
        getApprovalAndCCNode(obj.children, arr);
      }
      return arr;
    }
    // 表单内联系人
    const appRovalNodes = getApprovalAndCCNode(JSON.parse(formFlowConfig.flowJson));
    appRovalNodes.forEach((e) => {
      if (e.props.assignedType === "FORM_USER" && e.props.formUser !== "" && formData[e.props.formUser] !== undefined) {
        const formUserValue = JSON.parse(JSON.stringify(formData[e.props.formUser])) ?? "";
        if (formUserValue !== "") {
          variables[e.props.formUser] = formUserValue;
        }
      }
    });
    // 卡片标题
    const user = await staffService.getUserContext();
    const defaultBackLogTitle = user.name + "发起的" + formFlowConfig.businessTypeName;
    const backLogTitle = this.getBackLogTitle(formFlowConfig, formData, defaultBackLogTitle);

    const submitData = {
      data: JSON.stringify(formData),
      application: formFlowConfig.application,
      applicationName: formFlowConfig.applicationName,
      businessType,
      flowKey: formFlowConfig.flowKey,
      formDefinitionId: formFlowConfig.formDefinitionId,
      formDefinitionVersion: formFlowConfig.formDefinitionVersion,
      formKey: formFlowConfig.formKey,
      type: formFlowConfig.type,
      variables,
      backLogTitle,
    };
    // 考勤统一提交到业务方
    if (["LEAVE", "CANCEL_LEAVE", "OVERTIME", "LEAVE_THE_POST", "AWAY_BUSINESS"].includes(businessType)) {
      const res = await this.client.post<string>("/attendance/att/approval/submit", submitData);
      return res;
    } else if (["PERSONNEL_INDUCTION"].includes(businessType)) {
      const res = await cubePersonnelManagementService.personnelFlowSubmit(submitData).catch((error) => {
        const message = (error as { errorMessage: string })?.errorMessage ?? "操作失败";
        showNotify({
          type: "danger",
          message: message,
        });
        throw new Error(error);
      });
      return res;
    } else if (["ILLEGAL_PARKING"].includes(businessType)) {
      const res = await cubeParkingLotService.addIllegalParking(submitData).catch((error) => {
        const message = (error as { errorMessage: string })?.errorMessage ?? "操作失败";
        showNotify({
          type: "danger",
          message: message,
        });
        throw new Error(error);
      });
      return res as string;
    } else {
      const res = await this.client.post<string>("/flow/form-flows/first/submit", submitData);
      return res;
    }
  }
  public async submitPublicForm(
    businessType: string,
    formFlowConfig: FormFlow,
    formData: FlowFormData,
    formBaseData: FlowFormData,
  ): Promise<string> {
    const submitData = {
      data: JSON.stringify(formData),
      name: formBaseData.user,
      phone: formBaseData.phone,
      application: formFlowConfig.application,
      applicationName: formFlowConfig.applicationName,
      businessType,
      flowKey: formFlowConfig.flowKey,
      formDefinitionId: formFlowConfig.formDefinitionId,
      formDefinitionVersion: formFlowConfig.formDefinitionVersion,
      formKey: formFlowConfig.formKey,
      type: formFlowConfig.type,
      backLogTitle: this.getBackLogTitle(formFlowConfig, formData, `${formBaseData.user}发起的${formFlowConfig.businessTypeName}`),
    };
    const res: string = await this.publicClient.post<string>("/flow/public/form-flows/first/submit", submitData);
    return res;
  }

  public async getFormFlowProcess(formInstanceId: string, hideError = false): Promise<FormFlowInstance> {
    const result = await this.client.get<FormFlowInstance>(`/flow/process/task/form/id/${formInstanceId}`, { hideError });
    return result;
  }
  public async getPublicFormFlowProcess(formInstanceId: string, hideError = false): Promise<FormFlowInstance> {
    const result = await this.publicClient.get<FormFlowInstance>(`/flow/public/process/task/form/id/${formInstanceId}`, { hideError });
    return result;
  }

  /** 流程同意 */
  public async processApprove(
    taskId: string,
    formData: FlowFormData,
    approvalOpinion: ApprovalOpinion | null,
    formFlowProcess: FormFlowInstance,
    hideError = false,
  ): Promise<void> {
    const branchArr = this.getBranchs(JSON.parse(formFlowProcess.properties.processJson));
    const conditions = this.getConditions(branchArr);
    const variables = this.convertConditions(conditions, formData);
    // 获取审批节点
    function getApprovalAndCCNode(obj: any, arr: any[] = []): any[] {
      // 守护：obj 为空或为 null 直接返回
      if (!obj) return arr;

      if (obj?.type === "APPROVAL" || obj?.type === "CC") {
        arr.push(obj);
      }

      const branchs = obj?.branchs;
      if (Array.isArray(branchs) && branchs.length > 0) {
        for (const key in branchs) {
          const node = branchs[key];
          if (!node) continue;
          if (node.type === "APPROVAL" || node.type === "CC") {
            arr.push(node);
          }
          if (node.children) {
            getApprovalAndCCNode(node.children, arr);
          }
        }
      }

      const children = obj?.children;
      if (children) {
        getApprovalAndCCNode(children, arr);
      }
      return arr;
    }
    // 表单内联系人
    const appRovalNodes = getApprovalAndCCNode(JSON.parse(formFlowProcess.properties.processJson));
    appRovalNodes.forEach((e) => {
      if (e.props.assignedType === "FORM_USER" && e.props.formUser !== "" && formData[e.props.formUser] !== undefined) {
        const formUserValue = JSON.parse(JSON.stringify(formData[e.props.formUser])) ?? "";
        if (formUserValue !== "") {
          variables[e.props.formUser] = formUserValue;
        }
      }
    });
    //判断外链
    const underCubeEnvironment = getEnvironment() === "cubeApp" || getEnvironment() === "wxMini";
    !underCubeEnvironment && (variables["resource"] = "EXTERNAL_CHAIN_APPROVAL");

    const body: Record<string, any> = {
      // 流程处理人，null 代表为当前鉴权用户
      account: underCubeEnvironment ? null : "381496",
      data: JSON.stringify(formData),
      result: "PASS",
      taskId,
      variables,
    };
    if (approvalOpinion != null) {
      body.approvalOpinion = approvalOpinion;
    }
    await this.client.post("/flow/process/task/complete", body, { hideError });
    !underCubeEnvironment && window.location.reload();
  }

  /** 再次发起 */
  public async processRepeat(processId: string): Promise<void> {
    const body = {
      processInstanceId: processId,
    };
    await this.client.post("/flow/process/task/repeat", body);
  }

  /**
   * 转交
   * @param taskId
   * @param targetUserId 目标用户 id
   */
  public async processTransfer(taskId: string, targetUserId: string, remark: string): Promise<void> {
    const body = {
      account: null,
      taskId,
      targetAccount: targetUserId,
      approvalOpinion: {
        text: remark,
      },
    };
    await this.client.post("/flow/process/task/transfer", body);
  }

  /** 撤销 */
  public async processUndo(processId: string, comment = ""): Promise<void> {
    const body = {
      processInstanceId: processId,
      comment,
    };
    await this.client.post("/flow/process/task/undo", body);
  }
  //撤回审批
  public async postProcessWidthDraw(processId: string, approvalOpinion: ApprovalOpinion | null): Promise<void> {
    const body: Record<string, any> = {
      account: null,
      taskId: processId,
      comment: null,
      variables: null,
    };
    if (approvalOpinion != null) {
      body.approvalOpinion = approvalOpinion;
    }
    await this.client.post("/flow/process/task/withdraw", body);
  }

  /**
   * 退回
   * @param processId
   */
  public async processBack(processId: string, approvalOpinion: ApprovalOpinion | null): Promise<void> {
    const body: Record<string, any> = {
      account: null,
      taskId: processId,
      comment: null,
      variables: null,
    };
    if (approvalOpinion != null) {
      body.approvalOpinion = approvalOpinion;
    }
    await this.client.post("/flow/process/task/back", body);
  }

  /**
   * 拒绝
   * @param processId
   */
  public async processReject(processId: string, formData: FlowFormData, approvalOpinion: ApprovalOpinion | null): Promise<void> {
    const body: Record<string, any> = {
      account: null,
      taskId: processId,
      comment: null,
      data: JSON.stringify(formData),
    };
    if (approvalOpinion != null) {
      body.approvalOpinion = approvalOpinion;
    }
    await this.client.post("/flow/process/task/reject", body);
  }

  /**
   * 当前流程是否处于第一个审批任务节点
   * @param processId 流程ID
   */
  public async firstTaskActive(processId: string): Promise<boolean> {
    const res = await this.client.get<{ data: boolean }>(`/flow//flow/${processId}/first/task/active`);
    return res.data;
  }
  public async setFeedBack(params: {
    processId: string;
    taskNodeKey: string;
    feedbackInfo: string;
    taskId: string;
    fileIdList: string[];
  }): Promise<unknown> {
    const res = await this.client.post(`/flow/task/feedback/log/submit`, params);
    return res;
  }
  public async getFeedBack(query: { processInstanceId: string; taskNodeKey: string }): Promise<unknown> {
    const res = await this.client.get(`/flow/task/feedback/log/get/log`, { query });
    return res;
  }
}

export const formFlowService = new FormFlowService();
