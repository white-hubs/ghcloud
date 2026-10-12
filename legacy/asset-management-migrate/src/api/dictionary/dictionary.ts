import { request } from "@/service/index";

interface PagesResult {
  pages: number;
  records: unknown[];
  total: number;
}

/** 查询字典分页 */
export const getDataDictionaryByItemPage = async (params: {
  pageSize: number;
  pageNumber: number;
  itemCode: string;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/dictionary/getDataDictionaryByItemPage", {params});
};

/** 添加字典 */
export const addDataDictionary = async (params: {
  name: string;
  itemCode: string;
  remarks: string;
}): Promise<unknown> => {
  return request.post("/dictionary/addDataDictionary", params);
};

/** 修改字典 */
export const updateDataDictionary = async (params:Record<string,unknown>): Promise<unknown> => {
  return request.put("/dictionary/updateDataDictionary", params);
};

/** 删除字典 */
export const deleteDataDictionary = async (id:string): Promise<unknown> => {
  return request.delete(`/dictionary/deleteDataDictionary/${id}`);
};