import { cubeOuaaService } from "@ghcloud/cube-app-generic-component/src/api/server";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import qs from "qs";
import { ref } from "vue";

export interface RecordTaskType {
  id: string | number;
  taskName: string;
  taskTime: number;
  businessKey: string;
  businessTypeName: string;
  businessStatusName: string;
  businessPrincipal: string;
  businessType: string;
  applicationName: string;
  applicationCode: string;
  status?: string;
}

interface H5ApplicationType {
  applicationCode: string;
  path: string;
  query: {
    id?: string;
    userId?: string;
    processType?: string;
    taskId?: string;
    businessType?: string;
    processId?: string;
    status?: string;
  };
}

export function useTodoAction() {
  const userId = ref("");
  const getUser = async (): Promise<void> => {
    try {
      const { id } = await cubeOuaaService.getUserMine();
      userId.value = id;
    } catch {}
  };
  getUser();

  const h5ApplicationList: H5ApplicationType[] = [
    { applicationCode: "HIDDENDANGER", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
    { applicationCode: "FAULT", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
    { applicationCode: "SECURE_EDU", path: "", query: {} },
    { applicationCode: "RISK_SOURCE", path: "/apps/risk-management/h5#/risk-detail", query: {} },
    { applicationCode: "ALARM_CENTER", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
    { applicationCode: "SECURITY_MONITORING", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
    { applicationCode: "INSPECTION", path: "/apps/daily-inspection/h5#/inspection-detail", query: {} },
    { applicationCode: "ELECTRONIC_PATROL", path: "/apps/electronic-patrol/h5#/patrol-task-detail", query: {} },
    { applicationCode: "FIRECONTROL", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
    { applicationCode: "ROTATINGMANAGE", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
    { applicationCode: "ELECTRICMANAGE", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
    { applicationCode: "GAS_MANAGEMENT", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
    { applicationCode: "SMALLENFINEERING", path: "/apps/@ghcloud/cube-small-engineering-h5#/inspection-task-detail", query: {} },
    { applicationCode: "PROPERTY_MANAGEMENT", path: "/apps/@ghcloud/cube-asset-management-h5#/take-stock/stock-detail", query: {} },
    { applicationCode: "ATTENDANCE_MANAGEMENT", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
    { applicationCode: "MEETING_ROOM_MANAGEM", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
    { applicationCode: "APPROVAL_CENTER", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
    { applicationCode: "PARKINGMANAGE", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
    { applicationCode: "DAILY_TASK", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
    { applicationCode: "DAILY_INSPECTION", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
    { applicationCode: "DAILY_SMALL_INSPECTION", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
    { applicationCode: "GRID_MANAGE", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
    { applicationCode: "INTRUDER_ALARM", path: "/apps/alarm-center/h5#/alarm-details", query: { } },
  ];

  const handleClickItem = async (item: RecordTaskType, activeTab?: string): Promise<void> => {
    if (activeTab && activeTab === "APPROVE_TASK") {
      window.location.href = `/streamengineH5/initiating-work-order?processType=HANDLING&processId=${item.businessKey}`;
      return;
    }
    const app = h5ApplicationList.find((x) => x.applicationCode === item.applicationCode);
    if (app) {
      // 跳h5
      app.query.id = item.businessKey;
      app.query.taskId = item.businessKey;
      app.query.userId = userId.value;
      app.query.processId = item.businessKey;
      app.query.businessType = item.businessType;
      app.query.status = item.status ?? "";

      if (
        app.applicationCode === "SECURE_EDU" &&
        ["CULTIVATE_TASK", "CULTIVATE_TASK_PUBLISHED_USER_NOTIFY", "CULTIVATE_TASK_PUBLISHED_CHARGE_NOTIFY"].includes(item.businessType)
      ) {
        app.path = "/apps/secure-edu/h5#/train-detail";
      }
      if (
        app.applicationCode === "SECURE_EDU" &&
        ["EXAM_TASK", "EXAM_TASK_PUBLISHED_CHARGE_NOTIFY", "EXAM_TASK_PUBLISHED_USER_NOTIFY"].includes(item.businessType)
      ) {
        app.path = "/apps/secure-edu/h5#/secure-exam/detail";
      }
      //巡检修复
      if (app.applicationCode === "INSPECTION" && ["INSPECTION_REPAIR"].includes(item.businessType)) {
        app.path = "/apps/daily-inspection/h5#/abnormal-inspection/detail";
      }
      const query = qs.stringify(app.query);
      window.location.href = `${app.path}?${query}`;
    } else {
      // 跳原生
      const path = await cubeAppService.openBusinessDetailsPage({
        applicationCode: item.applicationCode,
        businessKey: item.businessKey,
        businessType: item.businessType,
      });
      if (path) {
        const target = location.origin + (path as unknown as string);
        document.title = `${item.businessTypeName}详情`;
        location.href = target;
      }
    }
  };

  return {
    handleClickItem,
  };
}
