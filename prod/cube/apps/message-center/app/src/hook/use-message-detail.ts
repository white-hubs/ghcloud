import { CubeMessageCenterService, type CubeAuth } from "@ghcloud/cube-message-center-service";
import type { MsgRecordCustomGroupItem } from "@ghcloud/cube-message-center-service/src/types";
import { CubeFlowService } from "@ghcloud/cube-stream-engine-service";
import type { FlowApplication } from "@ghcloud/cube-stream-engine-service/src/type";

export const useMessageDetail = (
  authInfo: CubeAuth,
): {
  batchRead: (ids: string[]) => Promise<void>;
  getMessageDetailUrl: (record: MsgRecordCustomGroupItem) => Promise<string>;
} => {
  function getMsgParams(str: string): Record<string, string> {
    // 如果字符串以 '{' 开头且以 '}' 结尾，则去除首尾的 '{' 和 '}'
    str.startsWith('"{') && str.endsWith('}"') && (str = str.slice(2, -2));

    // 使用正则表达式匹配键值对
    const regex = /(\w+)=([^,]+)/g;
    // 解析为对象
    const result: Record<string, string> = {};
    let match;
    while ((match = regex.exec(str)) !== null) {
      result[match[1]] = match[2];
    }
    return result;
  }
  const batchRead = async (ids: string[]): Promise<void> => {
    try {
      const cubeMessageCenterService = new CubeMessageCenterService(authInfo);
      await cubeMessageCenterService.readBatchMessage(ids);
    } catch (error) {
      throw new Error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
    } finally {
    }
  };
  // 获取流程应用列表
  const getFlowApplication = async (): Promise<FlowApplication[]> => {
    try {
      const cubeFlowService = new CubeFlowService(authInfo);
      const res = await cubeFlowService.getFlowApplicationList();
      return res;
    } catch {
      return [];
    }
  };
  const getMessageDetailUrl = async (record: MsgRecordCustomGroupItem): Promise<string> => {
    await batchRead([`${record?.id}`]);
    const applicationList = await getFlowApplication();
    const applicationCodeList = applicationList.map((item) => item.code) ?? [];
    /** 依赖于新版流引擎的业务 */
    const fowEngine = [
      "ATTENDANCE_MANAGEMENT",
      "PERSONNELMANAGEMENT",
      "OFFICIAL_MANAGEMENT",
      "WORK_REPORT",
      "SMALLENFINEERING",
      "HIDDENDANGER",
      "FAULT",
      "COMPLAINT",
      "OUTSOURCE_REPAIR",
      "RETROFIT",
    ];
    const baseFlowEngine = [...new Set([...fowEngine, ...applicationCodeList, "APPROVAL_CENTER"])];
    let target = "";
    if (record.msgType === "ALARM_NOTICE") {
      const businessPrincipal = JSON.parse(record?.businessPrincipal || JSON.stringify({}));
      target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessId}&alarmStatus=${businessPrincipal?.alarmStatus || ""}&type=detail&id=${record.businessId}`;
    }
    let msgParams = getMsgParams(record?.msgParams ?? "");
    if (msgParams?.processInstanceId) {
      try {
        const cubeFlowService = new CubeFlowService(authInfo);
        const flowInfo = await cubeFlowService.getTaskForm(msgParams?.processInstanceId);
        target = `/portal/stream-engine-render/index?businessType=${flowInfo.businessType}&processInstanceId=${msgParams.processInstanceId}&type=detail&title=${msgParams.formName}&appName=message-center`;
      } catch (error) {
        throw new Error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
      return target;
    }
    if (baseFlowEngine.includes(record?.applicationCode ?? "") && record?.satMsgDefineCode?.includes("FOCUS_WORK")) {
      target = `/portal/governmentManagement/eventHandleDetail?id=${record.businessId}`;
      return target;
    }

    if (record.applicationCode === "SECURE_EDU") {
      if (record?.satMsgDefineCode?.includes("EXAM_TASK")) {
        target = `/portal/secure-edu/exam-task-form?action=detail&id=${record.businessId}&appName=message-center`;
      } else if (record?.satMsgDefineCode?.includes("CULTIVATE_TASK")) {
        target = `/portal/secure-edu/training-task-form?action=detail&id=${record.businessId}&appName=message-center`;
      }
    } else if (record.applicationCode === "INSPECTION") {
      target = `/portal/inspection/inspectionTaskDetails?type=detail&id=${record.businessId}`;
    } else if (record.applicationCode === "ELECTRONIC_PATROL") {
      target = `/portal/electronic-patrol/task/detiles?type=task&id=${record.businessId}`;
    } else if (["DAILY_TASK", "DAILY_INSPECTION", "DAILY_SMALL_INSPECTION", "GRID_MANAGE"].includes(record.applicationCode ?? "")) {
      target = `/portal/daily-task/task-edit?type=detail&id=${record.businessId}`;
    } else if (record.url) {
      target = `${record.url}?type=detail&id=${record.businessId}`;
    }

    return target;
  };
  return {
    batchRead,
    getMessageDetailUrl,
  };
};
