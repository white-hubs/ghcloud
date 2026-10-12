import { request, service } from "@/service/index";

/** 系统配置 通用分类分页查询 */
export const getAssemblyClassifyPage = async (params: {
  pageSize: number;
  pageNumber: number;
  type: string; // 'assetType' | 'depository' | 'assetSource' | 'reasonForScrapping';
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/classify/getAssemblyClassifyPage", { params });
};

export const getAssemblyClassifyTree = async (params: {
  type: string; // 'assetType' | 'depository' | 'assetSource' | 'reasonForScrapping';
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get("/property/classify/getAssemblyClassifyTree", { params });
};

/** 系统配置 通用分类 新增 */
export const classifyInsert = async (params: {
  name: string;
  remarks: string;
  type: string;
}): Promise<unknown> => {
  return request.post("/property/classify/insert", params);
};

/** 系统配置 通用分类 更新 */
export const classifyUpdate = async (params: {
  name: string;
  remarks: string;
  type: string;
}): Promise<unknown> => {
  return request.put("/property/classify/update", params);
};

/** 系统配置 通用分类 删除 */
export const classifyDel = async (params: { id: string }): Promise<unknown> => {
  return request.delete("/property/classify/deleted/" + params.id);
};

/** 系统配置 仓库管理分页查询 */
export const getStorehousePage = async (params: {
  pageSize: number;
  pageNumber: number;
  keyword?: string;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/storehouse/page", { params });
};

/** 系统配置 仓库 新增 */
export const storehouseInsert = async (params: {
  name: string;
  remark: string;
  code: string;
}): Promise<unknown> => {
  return request.post("/property/storehouse", params);
};

/** 系统配置 仓库 删除 */
export const storehouseDel = async (params: {
  id: string;
}): Promise<unknown> => {
  return request.delete("/property/storehouse/" + params.id);
};

/** 系统配置 仓库 更新 */
export const storehouseUpdate = async (params: {
  name: string;
  remark: string;
  code: string;
  id: string;
}): Promise<unknown> => {
  return request.put("/property/storehouse/" + params.id, params);
};

/** 系统配置 仓库管理分页查询 */
export const getPropertyCheckTaskAdminPage = async (params: {
  pageSize: number;
  pageNumber: number;
  name?: string;
  enabled?: boolean;
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get(
    "/property/property/check/task/admin/getPropertyCheckTaskAdminPage",
    { params }
  );
};

/** 系统配置 仓库管理关联管理员 */
export const adminBind = async (params: {
  userIds: unknown[];
  orgId: string;
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.post("/property/property/check/task/admin/insert", params);
};

/** 系统配置 耗材分类树 */
export const getConsumableCategoryTree = async (params: {
  name?: string;
  parentId?: string;
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get("/property/consumable-category/tree", { params });
};

/** 系统配置 耗材分类树 */
export const consumableCategoryInsert = async (params: {
  name: string;
  parentId: string | null;
}): Promise<Service.RequestResult<unknown>> => {
  return request.post("/property/consumable-category", params);
};

/** 系统配置 耗材分类 更新 */
export const consumableCategoryUpdate = async (params: {
  name: string;
  parentId: string;
  id: string;
}): Promise<unknown> => {
  return request.put("/property/consumable-category/" + params.id, params);
};

/** 系统配置 耗材分类 删除 */
export const consumableCategoryDel = async (params: {
  id: string;
}): Promise<unknown> => {
  return request.delete("/property/consumable-category/" + params.id);
};

/** 系统配置 耗材分页查询（总体）查询 */
export const getConsumablePage = async (params: {
  pageSize: number;
  pageNumber: number;
  categoryId?: string;
  keyword?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable/page", { params });
};
/** 系统配置 耗材分页查询（总体）查询 */
export const getConsumablePagePermission = async (params: {
  pageSize: number;
  pageNumber: number;
  categoryId?: string;
  keyword?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable/page-permission", { params });
};

/** 系统配置 耗材 模版下载 */
export const getDownloadExcelTemplate = async (): Promise<Service.RequestResult> => {
  return service.get("/property/consumable/downloadExcelTemplate");
};
/** 系统配置 耗材 批量导入 */
export const consumableImport = async (
  params: FormData
): Promise<Service.RequestResult<void>> => {
  return request.post('/property/consumable/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

/**  耗材入库 模版下载 */
export const getDownloadExcelStockTemplate = async (): Promise<Service.RequestResult> => {
  return service.get("/property/consumable-store-stock/download-template");
};
/**  耗材入库 批量导入 */
export const consumableStockImport = async (
  params: FormData
): Promise<Service.RequestResult<void>> => {
  return request.post('/property/consumable-store-stock/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};
/** 系统配置 耗材 新增 */
export const consumableInsert = async (
  params: Consumable
): Promise<Service.RequestResult<PagesResult>> => {
  return request.post("/property/consumable", params);
};

/** 系统配置 耗材 删除 */
export const consumableDel = async (params: {
  id: string;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.delete("/property/consumable/" + params.id);
};

/** 系统配置 耗材 更新 */
export const consumableUpdate = async (
  params: Consumable & { id: string }
): Promise<Service.RequestResult<PagesResult>> => {
  return request.put("/property/consumable/" + params.id, params);
};

/** 资产入库 列表 分页 */
export const getDepositoryDetailedPage = async (params: {
  pageSize: number;
  pageNumber: number;
  status?: string | undefined;
  startTime?: string | undefined;
  typeId?: string | undefined;
  keyword?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get(
    "/property/property/depository/getDepositoryDetailedPage",
    { params }
  );
};

/** 资产入库 删除 */
export const depositoryDel = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request.delete(
    "/property/property/depository/deleteById/" + params.id
  );
};

/** 资产清单 分页 */
export const getPropertyDetailedPage = async (params: {
  pageSize: number;
  pageNumber: number;
  receiveDepId?: string | undefined;
  keyword?: string | undefined;
  status?: string | undefined;
  startTime?: string | undefined;
  purchaseDate?: string | undefined;
  sourceId?: string | undefined;
  typeId?: string | undefined;
  areaId?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/property/detailed/getPropertyDetailedPage-permission", {
    params,
  });
};

/** 资产清单 删除 */
export const detailedDel = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request.delete("/property/property/detailed/" + params.id);
};

/** 资产清单 导出 */
export const detailedExcelOut = async (params:unknown): Promise<Service.RequestResult> => {
  return service.get("/property/property/detailed/getExcel",{params});
};
/** 资产清单 导入 */
export const detailedExcelIn = async (params:unknown): Promise<unknown> => {
  return request.post("/property/property/detailed/import/template", params );
};
/** 资产清单 下载 */
export const detailedTplDownload = async (): Promise<Service.RequestResult> => {
  return service.get("/property/property/detailed/getTemplateExcel");
};
/** 资产清单 下载二维码 */
export const QRcodeDownload = async (params:{
  entityType:string,
  styleId:string,
  entityInfo:{entityId:string,entityName:string
  }[]}): Promise<Blob> => {
  return request.post("/identity/qrcode/generate/batch/download", params, { responseType: 'blob' }) as unknown as Promise<Blob>;
};



/** 资产派发 调拨 分页 */
export const getAllotPage = async (params: {
  pageSize: number;
  pageNumber: number;
  type: "ALLOT_UNIT" | "ALLOT_PERSONAL";
  keyword?: string | undefined;
  status?: string | undefined;
  receiveTime?: string | undefined;
  overDepId?: string | undefined;
  typeId?: string | undefined;
  receiveDepId?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/property/allot/getAllotPage", { params });
};

/** 资产派发 调拨 删除 */
export const allotDel = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request.delete("/property/property/allot/deleteById/" + params.id);
};

/** 资产清单 详情 */
export const detailedDetail = async (params: {
  id: string;
}): Promise<Service.RequestResult<DetailedDetail>> => {
  return request.get("/property/property/detailed/" + params.id);
};

/** 资产清单 更新 */
export const detailedUpdate = async (
  params: DetailedDetail
): Promise<Service.RequestResult> => {
  return request.put("/property/property/detailed/update", params);
};
/** 资产编码 更新 */
export const detailedUpdateCode = async (
  params: DetailedDetail
): Promise<Service.RequestResult> => {
  return request.put("/property/property/detailed/updateCode", params);
};

/** 清理报废 分页 */
export const getPropertyWeedOutPage = async (params: {
  pageSize: number;
  pageNumber: number;
  status?: string | undefined;
  manageTime?: string | undefined;
  causeId?: string | undefined;
  typeId?: string | undefined;
  keyword?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/property/weedOut/getPropertyWeedOutPage", {
    params,
  });
};

/** 清理报废 删除 */
export const weedOutDel = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request.delete("/property/property/weedOut/deleteById/" + params.id);
};

/** 资产盘点计划 分页 */
export const getPropertyCheckPlanPage = async (params: {
  pageSize: number;
  pageNumber: number;
  id?: string | undefined;
  status?: string | undefined;
  taskName?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/property/check/plan/getPropertyCheckPlanPage", {
    params,
  });
};
/** 资产盘点计划 详情 */
export const getCheckPlanDetail = async (params: {
  id: string;
}): Promise<Service.RequestResult<unknown>> => {
  return request.get("/property/property/check/plan/" + params.id);
};
/** 资产盘点计划 删除 */
export const checkDel = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request.delete("/property/property/check/plan/" + params.id);
};
/** 资产盘点计划 新增 */
export const checkPlanInsert = async (
  params: unknown
): Promise<Service.RequestResult<PagesResult>> => {
  return request.post("/property/property/check/plan/insert", params);
};
/** 资产盘点计划 提交 */
export const checkPlanSubmit = async (params: {
  planId: string;
}): Promise<Service.RequestResult<boolean>> => {
  return request.get("/property/property/check/plan/submit", { params });
};

/** 资产盘点计划 同步盘赢资产到清单 */
export const checkPlanSubmitWin = async (params: {
  planId: string;
}): Promise<Service.RequestResult<boolean>> => {
  return request.get("/property/property/check/plan/submitWin", { params });
};

/** 资产盘点计划 统计 */
export const queryByPalanCount = async (params: {
  id: string;
}): Promise<Service.RequestResult<unknown>> => {
  return request.get("/property/property/check/plan/queryByPalan/" + params.id);
};

/** 资产盘点明细 分页 */
export const queryByPlanIdPage = async (params: {
  pageSize: number;
  pageNumber: number;
  id?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/property/check/task/queryByPlanIdPage", {
    params,
  });
};

/** 耗材 仓库 分页 */
export const getConsumableStoreStock = async (params: {
  pageSize: number;
  pageNumber: number;
  categoryId?: string | undefined;
  keyword?: string | undefined;
  storeId?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable-store-stock/page", { params });
};

/** 耗材出入库记录分页查询 */
export const getConsumableStoreStockRecordPage = async (params: {
  pageSize: number;
  pageNumber: number;
  keyword?: string | undefined;
  storeId?: string | undefined;
  categoryId?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable-add-record/page", { params });
};

/** 耗材入库 删除 */
export const consumableAddRecordDel = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request.delete("/property/consumable-add-record/" + params.id);
};

/** 耗材出库记录分页 */
export const getConsumableReduceRecordPage = async (params: {
  pageSize: number;
  pageNumber: number;
  status?: string | undefined;
  keyword?: string | undefined;
  storeId?: string | undefined;
  claimant?: string | undefined;
  claimantDate?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable-reduce-record/page", { params });
};

/** 耗材出库 删除 */
export const consumableReduceRecordDel = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request.delete("/property/consumable-reduce-record/" + params.id);
};

/** 资产入库 导出 */
export const getDepositoryDetailedExcel = async (params: {
  status: string | undefined;
  startTime: string;
  keyword: string;
  typeId: string | undefined;
  ids: string;
}): Promise<{ data: Blob }> => {
  return service.post(
    "/property/property/depository/getDepositoryDetailedExcel",
    params
  );
};

/** 资产派发调拨 导出 */
export const getPropertyAllotExcel = async (params: {
  type: "ALLOT_UNIT" | "ALLOT_PERSONAL";
  keyword?: string | undefined;
  status?: string | undefined;
  receiveTime?: string | undefined;
  overDepId?: string | undefined;
  typeId?: string | undefined;
  receiveDepId?: string | undefined;
  ids: string;
}): Promise<{ data: Blob }> => {
  return service.post("/property/property/allot/getExcel", params);
};

/** 资产盘点 导出 */
export const getPropertyCheckPlanExcel = async (params: {
  taskName?: string | undefined;
  status?: string | undefined;
  ids: string;
}): Promise<{ data: Blob }> => {
  return service.post("/property/property/check/plan/getExcel", params);
};

/** 耗材盘点单 导出 */
export const getConsumableCheckDetailExcel = async (params: {
  type: "ALLOT_UNIT" | "ALLOT_PERSONAL";
  ids: string;
}): Promise<{ data: Blob }> => {
  return service.post("/property/consumable-check-detail/getExcel", params);
};

/** 耗材入库 导出 */
export const getConsumableAddRecordExcel = async (params: {
  type: "ALLOT_UNIT" | "ALLOT_PERSONAL";
  ids: string;
}): Promise<{ data: Blob }> => {
  return service.post("/property/consumable-add-record/getExcel", params);
};

/** 耗材领用 导出 */
export const getConsumableCheckRecordExcel = async (params: {
  type: "ALLOT_UNIT" | "ALLOT_PERSONAL";
  ids: string;
}): Promise<{ data: Blob }> => {
  return service.post("/property/consumable-check-record/getExcel", params);
};
/** 资产履历 分页 */
export const getPropertyHistoryList = async (params: {
  pageSize: number;
  pageNumber: number;
  id?: string | undefined;
  handleTime?: string | undefined;
  handleType?: string | undefined;
  departmentId?: string | undefined;
  status?: string | undefined;
  typeId?: string | undefined;
  keywords?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/property/history/getPropertyHistoryList", {
    params,
  });
};

/** 维保到期、逾龄资产 分页 */
export const getOveragePage = async (params: {
  pageSize: number;
  pageNumber: number;
  queryType?: "maintenance" | "usage"; // 维保到期 | 逾龄资产
  maintenanceData?: string | undefined;
  status?: string | undefined;
  typeId?: string | undefined;
  keyword?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  params.maintenanceData = params.maintenanceData
    ? params.maintenanceData
    : undefined;
  return request.get("/property/property/detailed/getOveragePage", { params });
};

/** 查询资产金额、数量 */
export const getOverageAmount = async (params: {
  queryType: "maintenance" | "usage"; // 维保到期 | 逾龄资产  查部门资产汇总时不传该参数
  keyword?: string | undefined;
  status?: string | undefined;
  typeId?: string | undefined;
  maintenanceData?: string | undefined;
}): Promise<
  Service.RequestResult<{ totalNumber: number; totalPrice: number }>
> => {
  params.maintenanceData = params.maintenanceData
    ? params.maintenanceData
    : undefined;
  return request.get("/property/property/detailed/getOverageAmount", {
    params,
  });
};

/** 部门资产汇总 分页 */
export const getPropertyByDepAllPage = async (params: {
  pageSize: number;
  pageNumber: number;
  name?: string | undefined;
}): Promise<
  Service.RequestResult<{
    depAll: { totalPrice: string }[];
    totalPrice: string;
    totalNumber: string;
  }>
> => {
  return request.get("/property/property/detailed/getPropertyByDepAllPage", {
    params,
  });
};

/** 资产统计 顶部数字 */
interface OverDue {
  repairReportNumber: number;
  maintenanceNumber: number;
  propertyNumber: number;
  usageNumber: number;
  weedOutNumber: number;
}
export const overdue = async (params: {
  dimension: string;
  period: string;
  eventResult?: string | undefined;
}): Promise<Service.RequestResult<OverDue>> => {
  return request.get("/property/property/visualization/overdue", { params });
};

/** 资产状态占比 */
export const getPropertyByStatus = async (params: {
  dimension: string;
  period: string;
  eventResult?: string | undefined;
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get("/property/property/visualization/getPropertyByStatus", {
    params,
  });
};

/** 资产分类占比 */
export const getPropertyByType = async (params: {
  dimension: string;
  period: string;
  eventResult?: string | undefined;
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get("/property/property/visualization/getPropertyByType", {
    params,
  });
};

/** 部门资产分布情况 */
export const getPropertyByDepHistogram = async (params: {
  dimension: string;
  period: string;
  eventResult?: string | undefined;
}): Promise<
  Service.RequestResult<{
    xdata: string[];
    series: { value: number[]; name: string }[];
  }>
> => {
  return request.get(
    "/property/property/visualization/getPropertyByDepHistogram",
    { params }
  );
};

/** 区域资产分布占比 */
export const getPropertyBySourcePie = async (params: {
  dimension: string;
  period: string;
  eventResult?: string | undefined;
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get(
    "/property/property/visualization/getPropertyBySourcePie",
    { params }
  );
};

/** 耗材出库趋势 */
export const getConsumableVisualizationReduceRecord = async (params: {
  dimension: string;
  period: string;
  eventResult?: string | undefined;
}): Promise<Service.RequestResult<{ value: number[]; name: string }[]>> => {
  return request.get("/property/consumable/visualization/reduceRecord", {
    params,
  });
};

/** 耗材使用占比 */
export const getConsumableVisualizationConsumableByDep = async (params: {
  dimension: string;
  period: string;
  eventResult?: string | undefined;
}): Promise<Service.RequestResult<unknown[]>> => {
  return request.get("/property/consumable/visualization/consumableByDep", {
    params,
  });
};

/** 耗材盘点 分页 */
export const getConsumableCheckPage = async (params: {
  pageSize: number;
  pageNumber: number;
  name?: string | undefined;
  status?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable-check/page", { params });
};

/** 耗材盘点明细 分页 */
export const getConsumableCheckDetailPage = async (params: {
  pageSize: number;
  pageNumber: number;
  checkId: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable-check/detail/page", { params });
};

/** 耗材盘点 新建 */
export const consumableCheckInsert = async (params: {
  /**
   * 盘点负责人
   */
  checkerId: string;
  /**
   * 盘点单名称
   */
  name: string;
  /**
   * 上次巡更时间
   */
  previousCheckDate: string;
  /** 本次巡更时间 */
  presentCheckDate: string;
  /**
   * 盘点仓库
   */
  storeId: string | undefined;
}): Promise<Service.RequestResult<unknown>> => {
  return request.post("/property/consumable-check", params);
};

/** 耗材盘点 根据盘点单ID统计盘点情况 */
export const getConsumableCheckstat = async (params: {
  id: string;
}): Promise<Service.RequestResult<unknown>> => {
  return request.get(`/property/consumable-check/${params.id}/stat`);
};

/** 耗材出入库统计 分页 */
export const getConsumableStockDetailPage = async (params: {
  pageSize: number;
  pageNumber: number;
  storeId?: string | undefined;
  stockFlag?: "ADD" | "REDUCE";
  period?: string | undefined;
  categoryId?: string | undefined;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable-stock-detail/record/page", {
    params,
  });
};

/** 部门领用统计-耗材领用统计 */
export const getConsumableReduceRecordStat = async (params: {
  dimension: string;
  period: string;
}): Promise<
  Service.RequestResult<
    {
      amount: number;
      consumableNum: number;
      deptId: string;
      deptName: string;
    }[]
  >
> => {
  return request.get("/property/consumable-reduce-record/stat", { params });
};

/** 部门领用统计-耗材领用明细表 分页 */
export const getConsumableReduceRecordDetailPage = async (params: {
  pageSize: number;
  pageNumber: number;
  dimension: string;
  deptId: string;
  period: string;
}): Promise<Service.RequestResult<PagesResult>> => {
  return request.get("/property/consumable-reduce-record/detail", { params });
};
/**
 * 资产履历导出
 */
export const exportAssetHistory = async (params: {
  handleTime: string;
  departmentId: string | undefined;
  status: string | undefined;
  typeId: string | undefined;
  keywords: string;
}): Promise<{ data: Blob }> => {
  return service.get("property/property/history/getExcel", { params });
};
/**
 * 维保到期,逾期资产导出
 */
export const exportMaturityAssets = async (params: {
  maintenanceData?: string;
  status: string | undefined;
  typeId?: string | undefined;
  keyword: string;
  queryType: string;
}): Promise<{ data: Blob }> => {
  return service.get("property/property/detailed/getOverageExcel", { params });
};
/**
 * 部门资产汇总导出
 * @param params
 * @returns Promise<{ data: Blob }>
 */
export const exportDeptAssets = async (params: {
  name: string;
}): Promise<{ data: Blob }> => {
  return service.get("property/property/detailed/getPropertyByDepAllExcel", {
    params,
  });
};
/**
 * 耗材出入库统计导出
 * @param params
 * @returns
 */
export const exportInoutStatistics = async (params: {
  categoryId: string | undefined;
  period: string;
  keyword: string;
}): Promise<{ data: Blob }> => {
  return service.get("property/export/consumable-stock-detail/record", {
    params,
  });
};
/** 消息配置 保存 */
export const assemblyNoticeSave = async (params: {
  businessType: string;
  conditions: unknown[];
}): Promise<Service.RequestResult<boolean>> => {
  return request.post("/property/assemblyNotice/insert", params);
};

/** 消息配置 查询 */
export const queryByBusinessType = async (): Promise<
  Service.RequestResult<{ conditions: unknown[][]; businessType: string }>
> => {
  return request.get(
    "/property/assemblyNotice/queryByBusinessType?businessType=PROPERTY"
  );
};

/** 消息配置2.0 查询 */
export const getMessageConfigInfo = async (params:{lable?:string,businessType: string}): Promise<
  Service.RequestResult<unknown>
> => {
  return request.get(
    "/bracing/message/getConfigInfo",{params}
  );
};

/** 消息配置2.0 保存 */
export const saveMessageConfig = async (params:unknown): Promise<
  Service.RequestResult<unknown>
> => {
  return request.post(
    "/bracing/message/addConfig",params
  );
};

/** 耗材盘点 删除 */
export const consumableCheckDel = async (params: {
  id: string;
}): Promise<unknown> => {
  return request.delete("/property/consumable-check/" + params.id);
};

/** 耗材盘点 判断是否有盘盈 */
export const consumableCheckPlanSubmit = async (params: {
  planId: string;
}): Promise<Service.RequestResult<boolean>> => {
  return request.get(`/property/consumable-check/submitWin/${params.planId}`, {
    params,
  });
};
/**提交耗材盘点 */
export const consumableCheckSubmit = async (
  planId: string
): Promise<Service.RequestResult<boolean>> => {
  return request.get(`/property/consumable-check/${planId}/submit`);
};
/** 耗材盘点计划 同步盘赢资产到清单 */
export const consumableCheckPlanSubmitWin = async (
  planId: string
): Promise<Service.RequestResult<boolean>> => {
  return request.get(`/property/consumable-check/addWin/${planId}`);
};

/** 查询盘点任务 */
export const queryTaskByPlan = async (
  planId: string
): Promise<Service.RequestResult<unknown[]>> => {
  return request.get(`/property/property/check/task/queryTaskByPlan?planId=${planId}`);
};
interface PagesResult {
  pages: number;
  records: unknown[];
  total: number;
}
export interface Consumable {
  /**
   * 品牌
   */
  brand: string;
  /**
   * 类型ID
   */
  categoryId: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 商品号
   */
  goodsCode: string;
  /**
   * 型号
   */
  model: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 保值期限
   */
  qualityPeriod: string;
  /**
   * 当前库存数
   */
  stock: number;
  /**
   * 最大库存
   */
  stockMax: number;
  /**
   * 最小库存
   */
  stockMin: number;
  /**
   * 单位
   */
  unit: string;
  /**
   * 限领数量（人/月）
   */
  useLimit: number;
}

/**
 * PropertyDetailedVO，入库详情
 */
export interface DetailedDetail {
  adminId: string;
  area: { id: string; name: string }[];
  /**
   * 管理员
   */
  adminName: string;
  /**
   * 区域id
   */
  areaIds: (string | number)[];
  /**
   * 区域
   */
  areaName: string;
  /**
   * 资产盘点状态
   */
  checkStatus: string;
  /**
   * 入库单号
   */
  depositoryNumbers: string;
  maintenanceDepName:string;
  maintenanceDepId:string;
  location:string;
  latAndLon:string;
  /**
   * 设备编码
   */
  deviceNumber: string;
  /**
   * 资产附件
   */
  file: OSSFile[] | string[];
  fileStr: string;
  id: number;
  /**
   * 资产图片
   */
  imgs: OSSFile[] | string[];
  imgsStr: string;
  /**
   * 维保说明
   */
  maintenanceRemarks: string;
  /**
   * 维保期限
   */
  maintenanceTime: number;
  /**
   * 资产名称
   */
  name: string;
  /**
   * 规格型号
   */
  norms: string;
  /**
   * 数量
   */
  number: number;
  /**
   * 原值
   */
  price: number;
  /**
   * 购入日期
   */
  purchaseDate: string;
  receiveDepId: string;
  /**
   * 接收部门名称
   */
  receiveDepName: string;
  receiveUserPhone: string;
  /**
   * 接收人
   */
  receiveUserId: string;
  /**
   * 接收人
   */
  receiveUserName: string;
  /**
   * 备注
   */
  remarks: string;
  /**
   * 资产编码
   */
  serialNumber: string;
  financeNumber:string;
  /**
   * 来源
   */
  sourceId: string;
  sourceName: string;
  /**
   * 入库日期
   */
  startTime: string;
  /**
   * 审批状态
   */
  status: string;
  /**
   * 存放地点
   */
  storageLocation: string;
  /**
   * 供应商
   */
  supplier: string;
  /**
   * 联系方式
   */
  supplierPhone: string;
  /**
   * 联系人
   */
  supplierUser: string;
  /**
   * 资产类别id
   */
  typeId: number;
  typeTree: string[];
  /**
   * 资产类别
   */
  typeName: string;
  /**
   * 计量单位
   */
  unit: string;
  /**
   * 使用期限
   */
  usageTime: number;
}

export interface OSSFile {
  businessKey: number;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
