import { request } from "@/service/index";
import { getId } from "@/utils/permission";
import type { LocationQueryValue } from "vue-router";
const baseUrl = "/maintain";
/** 系统配置 通用分类分页查询 */
export const TaskPage = async (data: TASK.FormState): Promise<Service.RequestResult> =>
  request.get(`${baseUrl}/electron/task/queryTaskPage`, {
    headers: {
      Permission: getId(),
    },
    params: {
      ...data,
    },
  });
export const addtask = async (data: TASK.AddTask): Promise<Service.RequestResult> => request.post(`${baseUrl}/electron/task/insert`, data);
export const accepttask = async (id: string): Promise<Service.RequestResult> => request.get(`${baseUrl}/electron/accept/task/${id}`, {});
export const turnOvertask = async (id: string, userId: string): Promise<Service.RequestResult> =>
  request.get(`${baseUrl}/electron/turnOver/task/${id}/${userId}`, {});
export const getoneTask = async (id: LocationQueryValue | LocationQueryValue[]): Promise<Service.RequestResult> =>
  request.get(`${baseUrl}/electron/task/${id}?executePeriodAll=true`, {});

export const getListTask = async (params: {
  taskId: LocationQueryValue | LocationQueryValue[];
  executePeriod: string;
}): Promise<Service.RequestResult> =>
  request.get(`${baseUrl}/electron/task/location`, {
    params,
  });
export const acceptTask = async (id: LocationQueryValue | LocationQueryValue[]): Promise<Service.RequestResult> =>
  request.get(`${baseUrl}/electron/accept/task/${id}`, {});
export const Getoverview = async (): Promise<Service.RequestResult> =>
  request.get(`${baseUrl}/electron/task/overview`, {
    headers: {
      Permission: getId(),
    },
    params: { admin: false },
  });

// 批量移除巡检任务
export const removeElectronicTask = (idList: string[]) => request.put(`${baseUrl}/electron/task/remove-batch`, { taskIdList: idList });
