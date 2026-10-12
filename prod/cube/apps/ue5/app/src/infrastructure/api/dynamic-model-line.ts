import request from "../service/request";
const baseURL = "/api-dynamic-model-line";

let modelLine = "";

/**
 * 获取动态模型线
 */
export async function getDynamicModelLine() {
  modelLine = await request<string>({
    url: `${baseURL}/getModelLine`,
    method: "GET",
  });
  return modelLine;
}
/**
 * 心跳链接
 */
export async function lineHeartBeat() {
  return await request<unknown>({
    url: `${baseURL}/lineHeartBeat`,
    method: "post",
    data: {
      address: modelLine,
    },
  });
}
