import { request } from "@/service/index";
import { LocationQueryValue } from "vue-router";

enum URL {
  /**获取群控列表 */
  GetGroupControlList = "/securitymanagement/group-controls",
  /**获取日志 */
  GroupControlLogs = "/securitymanagement/group-control/",
  /**控制开关 */
  GroupControlHandle = "/securitymanagement/group-control/control",
  /**密码校验 */
  PasswordCheck = "/securitymanagement/group-control/password/check",
  // 获取回路
  GetSecurityDevicePage = `/securitymanagement/getSecurityDevicePage/INTELLIGENT_LIGHTING`,
  GetSecurityDevice = `/securitymanagement/application-device/INTELLIGENT_LIGHTING`,
  /**操作群控组 */
  HandGroupControl = "/securitymanagement/group-control/",
  HandGroupControl2 = "/securitymanagement/group-control",
  screenHandGroupControl = "/securitymanagement/screen-out-existing-data",
}

/**
 *
 * 修改数据
 */
export const PutGroupControl = (
  data: api.addGroup,
  id: LocationQueryValue | LocationQueryValue[],
) => {
  return request.put(URL.HandGroupControl + id, data);
};
/**
 * 删除列表
 *
 */
export const DeleteGroupControl = (id: string) => {
  return request.delete(URL.HandGroupControl + id, {});
};
/**
 * 添加群控组
 *
 */
export const AddGroupControl = (data: api.addGroup) => {
  return request.post(URL.HandGroupControl2, data);
};
/**获取详情 */
export const GetGroupControl = (
  id: LocationQueryValue | LocationQueryValue[],
) => {
  return request.get(URL.HandGroupControl + id, {});
};
/**
 * 获取回路
 */
export const GetSecurityDevicePage = (params: {
  pageNumber: number | undefined;
  pageSize: number | undefined;
}) => {
  return request.get(URL.GetSecurityDevicePage, {
    params,
  });
};
// 通过不同获取回路

export const screenHandGroupControl = (params: any) => {
  return request.post(URL.screenHandGroupControl, params);
};
export const GetSecurityDevice = () => {
  return request.get(URL.GetSecurityDevice, {});
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
export const GetGroupControlList = (params: api.getListType) => {
  return request.get(URL.GetGroupControlList, {
    params,
  });
};
/**
 * 获取日志
 *
 */
export const GroupControlLogs = (
  id: string,
  params: {
    pageNumber: number | undefined;
    pageSize: number | undefined;
  },
) => {
  return request.get(URL.GroupControlLogs + id + "/logs", {
    params,
  });
};
/**
 * 控制开关
 * @param {
 *groupCcontrolId: 群控id;
 *openGate: 下发开关值;
 * }
 */

export const GroupControlHandle = (data: {
  groupControlId: string;
  openGate: string | undefined;
  applicationCode: string;
}) => {
  return request.post(URL.GroupControlHandle, data);
};
/**
 * 密码校验
 */
export const PasswordCheck = (data: {
  groupControlId: string;
  password: string;
}) => {
  return request.post(URL.PasswordCheck, data);
};
