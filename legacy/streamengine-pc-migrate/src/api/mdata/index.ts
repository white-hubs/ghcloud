import { request } from "@/service";

//档位分类
export const getGearTypeList = () => {
  const params={
    pageNumber: 1,
    pageSize: 10,
    enabled:true
  }
  return request.get('/mdata/stall-category/page',{ params });
};

/** 获取档位分页列表 */
export const getGearPage = async (params:unknown) => {
  return request.get('/mdata/stall/page', { params })
}

/** 区域列表 */
export const getAreaList = async () => {
  return request.get('/mdata/area/list')
}