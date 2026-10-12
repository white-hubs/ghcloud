import { request } from "@/service/index";
import { CheckboxValueType } from "ant-design-vue/lib/checkbox/interface";
import { Dayjs } from "dayjs";
import { LocationQueryValue } from "vue-router";
const Appcode = "INTELLIGENT_LIGHTING";
enum URL {
  /**获取时控列表 */
  GetTimeControlList = "/securitymanagement/time-controls",
  /**获取日志 */
  HandleTimeControl = "/securitymanagement/time-control/",
  HandleTimeControl2 = "/securitymanagement/time-control",
  /** 获取类型*/
  GetObjectType = "/securitymanagement/object-type",
  /**或群群控类型 */
  GetGroupObjectType = "/securitymanagement/object-type/group-controls",
  /**获取时控制log */
  GetTimeControlLogs = "/securitymanagement/time-control/logs",
}
interface deviceDetailsType {
  objectType: string;
  // 对象类型
  deviceObject: string;
  // 对象id
  areaName: string;
  // 区域
  controlTime: string;
  // 控制时间点
  openGate: string;
  // 开关值
  brightness: string;
  // 光照度
  deviceName: string;
  id?: string;
}
interface AddDetails {
  planName: string;
  // 计划名称
  planStartTime: string;
  // 计划开始时间
  planEndTime: string;
  // 计划结束时间
  enabled: boolean;
  // 是否启用
  timeCycle: CheckboxValueType;
  // 时间周期:

  deviceDetails: deviceDetailsType[];
}
/**
 * 添加时控
 */
export const AddTimeControl = (data: AddDetails) => {
  return request.post(URL.HandleTimeControl2, data);
};
/**
 * 查看时控
 */
export const CheckTimeControl = (
  id: LocationQueryValue | LocationQueryValue[],
) => {
  return request.get(URL.HandleTimeControl + id);
};
/**修改时控 */
export const PutGroupControl = (
  data: AddDetails,
  id: LocationQueryValue | LocationQueryValue[],
) => {
  return request.put(URL.HandleTimeControl + id, data);
};
/**
 * 获取群控列表
 * @param {
 *keyword?: 群控模糊查询字段;
 *pageNumber: 当前页数;
 *pageSize: 每一页数量;
 * }
 * @returns
 */
export const GetTimeControlList = (params: api.getListType) => {
  return request.get(URL.GetTimeControlList, {
    params,
  });
};
export const GetTimeControlLogs = (params: {
  period: string;

  pageNumber: number;

  pageSize: number;
}) => {
  return request.get(URL.GetTimeControlLogs, {
    params,
  });
};
/**获取类型 */
export const GetObjectType = () => {
  return request.get(URL.GetObjectType, {});
};
export const GetGroupObjectType = (params?: {
  keyword: string;
  ascription: string;
}) => {
  return request.get(URL.GetGroupObjectType, {
    params,
  });
};
/**
 * 删除当前
 * @param {
 * }
 * @returns
 */
export const DeleteleTimeControl = (id: string) => {
  return request.delete(URL.HandleTimeControl + id, {});
};
