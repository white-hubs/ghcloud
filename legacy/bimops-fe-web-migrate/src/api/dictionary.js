import request from "@/utils/request";

const baseURL = "/api/dictionary";

//根据字典编码查询字典详情
export const getSysDictionaryByCodeAndItemCode = (params, type) =>
  request({
    url: baseURL + `/getSysDictionaryByCodeAndItemCode`,
    method: "get",
    params,
  });