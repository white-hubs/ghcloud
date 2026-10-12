import request from "../service/request";

const baseURL = "/api/dictionary";

/** 查询字典 */
export function getCascadeDictionaryItem(itemCode?: string) {
  return request({
    url: `${baseURL}/getCascadeDictionaryItem?itemCode=${itemCode}`,
    method: "GET",
  });
}
/** 根据code查询字典项详情 */
export function getDataDictionaryByItem(itemCode?: string) {
  return request({
    url: `${baseURL}/getDataDictionaryByItem?itemCode=${itemCode}`,
    method: "GET",
  });
}
