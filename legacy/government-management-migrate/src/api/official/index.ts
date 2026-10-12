import { request } from "@/service/index";
enum URL {
  /**获取印章分页 */
  getofficialSealPage = "/official/officialSeal/page",
  /**新增印章 */
  addOfficialSeal = "/official/officialSeal/add",
  /**删除印章 */
  deleteOfficialSeal = "/official/officialSeal/",
  /**修改印章 */
  updateOfficialSeal = "/official/officialSeal/"
}
interface pageParams {
  pageNumber: number,
  pageSize: number,
  sealName: string
}
/**
 * 获取印章分页
 */
export const getofficialSealPage = (params: pageParams) => {
  return request.get(URL.getofficialSealPage, { params });
};
/**
 * 新增印章
 */
interface addOfficialSealParams {
  sealName: string,
  sealDesc: string
}
export const addOfficialSeal = (data: addOfficialSealParams) => {
  return request.post(URL.addOfficialSeal, data);
};
/**
 * 删除印章
 */

export const deleteOfficialSeal = (id: string) => {
  return request.delete(URL.deleteOfficialSeal + id);
};
/**
 * 修改印章
 */

export const updateOfficialSeal = (id: string, data: {
  sealName: string,
  sealDesc: string
}) => {
  return request.put(URL.updateOfficialSeal + id + '/update', data);
};
