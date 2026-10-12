import { createRequest } from "./request";
import axios, { AxiosError } from "axios";
import { getNowEnterprise, getToken } from "../utils/auth";
export const request = createRequest({
  baseURL: "/api",
});

export const service = axios.create({
  timeout: 15000, // 请求超时
  baseURL: "/",
  responseType: "blob",
  headers: {
    tenant: getNowEnterprise()?.code,
    terminal: (window as any)?.config?.terminal,
    Authorization: `Bearer ${getToken().access_token}`,
    "Content-Type": "application/json",
  },
});
