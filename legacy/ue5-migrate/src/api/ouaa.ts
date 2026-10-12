import request from "../service/request";
import { TenantType } from "./models/ouaa";
const baseURL = "/api/ouaa/";

/**
 * @说明 获取根据租户编号获取租户信息
 * @returns
 */
export function getTenantDetails<T extends Record<string, any>>(code: T) {
  return request<TenantType>({
    url: `${baseURL}/authenticated/tenant/${code}/code`,
    method: "GET",
  });
}

/**
 * @说明 获取根据租户编号获取租户信息 企业管理接口
 * @returns
 */
export function getTenantInfo<T extends Record<string, any>>(code: T) {
  return request<TenantType>({
    url: `${baseURL}tenant-under-tenant/${code}`,
    method: "GET",
  });
}
/**
 * @说明 信息发布内容分页
 * @returns
 */
export function playRecord<T extends Record<string, any>>(code: T) {
  return request<TenantType>({
    url: `${baseURL}play-record`,
    method: "GET",
  });
}

export function login<T extends Record<string, any>>(data: T) {
  return request<unknown>({
    url: `/gw-bff/auth/token`,
    method: "POST",
    data,
  });
}

export const getLoginCode = (params, method) =>
  request({
    url: baseURL + `public/auth/login/code/generate`,
    method: "get",
    params,
  });
// 查询组织机构列表
export const organizationsList = <T extends Record<string, any>>(params?: T) =>
  request({
    url: baseURL + `authenticated/organizations/list`,
    method: "get",
    params,
  });
export function getTokenOuaa<T extends Record<string, any>>(data: T) {
  return request<unknown>({
    url: `${baseURL}oauth2/token?grant_type=${data.grant_type}&client_id=${data.client_id}&client_secret=${data.client_secret}`,
    method: "POST",
    data,
  });
}

/** 查询在岗离岗人员-分页 */
export function getUserByWorkStatusPage<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}getUserByWorkStatusPage`,
    method: "GET",
    params,
  });
}
export function getImage<T extends Record<string, any>>(id: T) {
  return request<unknown>({
    url: `/api/file/file/${id}`,
    method: "get",
  });
}
