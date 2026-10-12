import { request } from "@/service";
let baseURL = '/property'

//通用分类查询
interface AssemblyClassifyType {
  type: "assetType" | "depository" | "assetSource" | "reasonForScrapping"
  pageSize?: number,
  pageNumber?: number
}
/** 资产分类 */
export const getAssemblyClassify = (params: AssemblyClassifyType) => {
  params.pageSize = 1000
  params.pageNumber = 1
  return request.get(baseURL + `/classify/getAssemblyClassifyPage`, { params });
}

/** 资产分类 树形*/
export const getAssemblyClassifyTree = async (params: {
  type: string; // 'assetType' | 'depository' | 'assetSource' | 'reasonForScrapping';
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get("/property/classify/getAssemblyClassifyTree", { params });
};


//区域查询
export const getAreaList = (url:string='/mdata/area/list') => {
  return request.get(url);
}

//资产查询 分页
export const getPropertyDetailedPage = (params: { pageNumber: number; pageSize: number }) => {
  return request.get(baseURL + `/property/detailed/getPropertyDetailedPage`, { params });
}

//仓库列表
export const getStorehouseList = (params?: { keyword?: string }) => {
  return request.get(`/property/storehouse/list`, { params });
}

//耗材分页查询（仓库）
export const getConsumableStoreStock = (params?: { keyword?: string }) => {
  return request.get(`/property/consumable-store-stock/page`, { params });
}

//耗材分页查询（总体）
export const getConsumablePage = (params?: { keyword?: string }) => {
  return request.get(`/property/consumable/page`, { params });
}

//盘点资产编码是否有重复
export const getDuplicates = (params:unknown) => {
  return request.post(baseURL+`/property/detailed/getDuplicates`,  params);
}

//资产编辑-资产编码是否重复
export const checkPropertyCode = (params: { checkSerialNumberList: { key?: string|null; value: string; }[] }) => {
  return request.post(baseURL+`/property/detailed/checkCodeBath`,  params);
}

/** 系统配置 耗材分类树 */
export const getConsumableCategoryTree = async (
  params?: {
    name?: string;
    parentId?: string;
  }): Promise<Service.RequestResult<unknown[]>> => {
  return request.get('/property/consumable-category/tree', { params })
}
//分页查询风险源台账
export const getRiskSource = (params:unknown) => {
  return request.get(baseURL+`/risk/source/ledger/page`,  { params });
}
//分页查询风险源台账
export const getCheckCode = (serialNumber:string) => {
  return request.get(baseURL+`/property/detailed/checkCode?serialNumber=${serialNumber}`);
}