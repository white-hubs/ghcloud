import axios from "@/utils/axios";
import request from "@/utils/request";
import qs from "qs";

// 获取用户token
export async function getToken() {
  if (sessionStorage.getItem("GH-Token")) {
    return JSON.parse(sessionStorage.getItem("GH-Token"));
  }
  return null;
}

// 获取用户token
export async function getEnterpriseCode() {
  if (sessionStorage.getItem("GH-NowEnterprise")) {
    return JSON.parse(sessionStorage.getItem("GH-NowEnterprise"));
  }
  return null;
}
