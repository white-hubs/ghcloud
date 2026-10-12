import { CubeMessageEvent } from "@ghcloud/cube-protocol";
import { message } from "@ghcloud/cube-ui";
import { getEnvironment } from "@ghcloud/cube-utils";
import type { TaskRecord } from "@ghcloud/cube-work-center-service";

interface UseListOperate {
  operate: (record: TaskRecord, type: "waiting" | "done") => void;
  buttonText: (record: TaskRecord) => string;
}

const environment = getEnvironment();
/** 资产依赖流引擎业务 */
const propertyManagementFlowBusinessType = [
  "PROPERTY_DEPOSITORY",
  "PROPERTY_ALLOT_PERSONAL",
  "PROPERTY_ALLOT_UNIT",
  "PROPERTY_WEED_OUT",
  "CONSUMABLE_ADD",
  "CONSUMABLE_REDUCE",
];

/** 依赖于新版流引擎的业务 */
const baseFlowEngine = [
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
  "VISITOR_MANAGEMENT",
  "MEETING_ROOM_MANAGEM",
  "APPROVAL_CENTER",
  "PARKINGMANAGE",
];

function openUrl(applicationCode: string, url: string): void {
  if (environment === "cubeDesktopClient" || environment === "iframe") {
    window.parent.postMessage(
      {
        type: CubeMessageEvent.TO_BUSINESS_PAGE,
        data: {
          code: applicationCode,
          path: url,
        },
      },
      "*",
    );
  } else {
    history.pushState({ current: location.pathname + location.search }, "", url);
  }
}

export default function useListOperate(): UseListOperate {
  function operate(record: TaskRecord, type: "waiting" | "done"): void {
    if (type === "done" && record.taskDelState) {
      message.warning("该任务已删除");
      return;
    }
    let target = "";
    // 督办事项反馈单独走流引擎发起
    if (
      type === "waiting" &&
      baseFlowEngine.includes(record.applicationCode) &&
      record.businessType === "OFFICIAL_FOCUS_WORK_REPLY" &&
      !record.businessKey.includes("-")
    ) {
      const businessKey = record.businessKey.split("_")[0];
      target = `/portal/stream-engine-render/index?businessType=${record.businessType}&appName=agencyCenter&type=add&title=事项处理&businessKey=${businessKey}`;
      openUrl(record.applicationCode, target);
      return;
    }

    if (type === "done" && baseFlowEngine.includes(record.applicationCode) && record.businessType === "OFFICIAL_FOCUS_WORK_REPLY") {
      const id = record.businessKey.split("_")[0];
      target = `/portal/governmentManagement/eventHandleDetail?id=${id}`;
      openUrl(record.applicationCode, target);
      return;
    }

    if (baseFlowEngine.includes(record.applicationCode)) {
      target = `/portal/stream-engine-render/index?businessType=${record.businessType}&processInstanceId=${record.businessKey}&type=detail&title=${record.businessTypeName}&appName=agencyCenter`;
    } else if (record.applicationCode === "PROPERTY_MANAGEMENT") {
      target = `/portal/stream-engine-render/index?businessType=${record.businessType}&processInstanceId=${record.businessKey}&type=detail&title=${record.businessTypeName}&appName=agencyCenter`;
      // 资产管理不走流引擎的
      if (!propertyManagementFlowBusinessType.includes(record.businessType)) {
        message.warning("请在APP端操作");
        return;
      }
    } else if (["SECURE_EDU"].includes(record.applicationCode)) {
      // 安全教育
      if (record.businessType === "EXAM_TASK") {
        target = `/portal/secure-edu/exam-task-form?action=detail&id=${record.businessKey}&appName=agencyCenter`;
      } else if (record.businessType === "CULTIVATE_TASK") {
        target = `/portal/secure-edu/training-task-form?action=detail&id=${record.businessKey}&appName=agencyCenter`;
      }
    } else if (["XRXPROGECT"].includes(record.applicationCode)) {
      // 兴蓉西
      if (record.businessType === "approve_report") {
        target = `/portal/xrx-engineering-management/report-detail?action=approve&id=${record.businessKey}`;
      } else if (record.businessType === "approve_node") {
        target = `/portal/xrx-engineering-management/plan-approve-detail?action=edit&id=${record.businessKey}`;
      } else if (record.businessType === "approve_report_stat") {
        target = `/portal/xrx-engineering-management/statistic-detail?action=approve&id=${record.businessKey}`;
      }
    } else if (
      ["GAS_MANAGEMENT", "SECURITY_MONITORING"].includes(record.businessType) ||
      record?.url?.includes("/portal/genericEquipmentMonitor")
    ) {
      target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessKey}&alarmStatus=${record.businessStatus}&type=detail&id=${record.businessKey}`;
    } else if (["DAILY_TASK", "DAILY_INSPECTION", "DAILY_SMALL_INSPECTION"].includes(record.businessType ?? "")) {
      target = `/portal/daily-task/task-edit?type=detail&id=${record.businessKey}`;
    } else if (record.url) {
      target = `${record.url}?type=detail&id=${record.businessKey}`;
    }
    if (!target) {
      message.warning("暂无详情");
      return;
    }
    openUrl(record.applicationCode, target);
  }

  function buttonText(record: TaskRecord): string {
    if (record.applicationCode === "SECURE_EDU" || record.status === "DONE") {
      return "详情";
    } else if (record.applicationCode === "PROPERTY_MANAGEMENT") {
      return propertyManagementFlowBusinessType.includes(record.businessType) ? "处理" : "详情";
    }
    return "处理";
  }
  return { operate, buttonText };
}
