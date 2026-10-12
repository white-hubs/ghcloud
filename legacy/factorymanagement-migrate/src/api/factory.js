import request from "@/utils/request";
let baseURL = "/api/park";

// ----------园区总览-----------------
export const getTenantHome = params =>
  request({
    url: `/api/ouaa/tenant-under-tenant/${params}?code=${params}`,
    method: "get",
    params,
  });
export const getRoomStatistics = params =>
  request({
    url: baseURL + "/getRoomStatistics",
    method: "get",
    params,
  });
export const getRoomRateList = params =>
  request({
    url: baseURL + "/getRoomRateList",
    method: "get",
    params,
  });

// ----------类型数据-----------------

//查询类型列表
export const getTypeList = params =>
  request({
    url: baseURL + `/type-data/${params.tag}/list`,
    method: "get",
    params,
  });
// 行业类型
export const getTypePage = params =>
  request({
    url: baseURL + `/type-data/INDUSTRY/list?tag=INDUSTRY`,
    method: "get",
    params,
  });
// 房间类型
export const getRoomTypePage = params =>
  request({
    url: baseURL + `/type-data/ROOM/list?tag=ROOM`,
    method: "get",
    params,
  });
// 诉求类型
export const getAPPEALTypePage = params =>
  request({
    url: baseURL + `/type-data/APPEAL/list?tag=APPEAL`,
    method: "get",
    params,
  });
// 走访类型
export const getINTERVIEWTypePage = params =>
  request({
    url: baseURL + `/type-data/INTERVIEW/list?tag=INTERVIEW`,
    method: "get",
    params,
  });
// 所有房间信息
export const tenantRoomList = params =>
  request({
    url: baseURL + `/tenantRoom/list`,
    method: "get",
    params,
  });

//新增类型
export const addType = (tag, data) =>
  request({
    url: baseURL + `/type-data/${tag}`,
    method: "post",
    data,
  });

//编辑类型
export const editType = (id, data) =>
  request({
    url: baseURL + `/type-data/${id}`,
    method: "put",
    data,
  });

//删除
export const delType = (id, params) =>
  request({
    url: baseURL + `/type-data/${id}`,
    method: "delete",
    params,
  });

// 批量删除
export const deleteBatch = params =>
  request({
    url: baseURL + "/type-data/batch",
    method: "delete",
    params,
  });

// ----------------企业管理---------------------
// 企业类型
export const getEnterpriseManagementTypes = params =>
  request({
    url: baseURL + "/enterprise/types",
    method: "get",
    params,
  });

// 企业规模
export const getEnterpriseScale = params =>
  request({
    url: baseURL + "/enterprise/scales",
    method: "get",
    params,
  });

// 企业详情
export const getEnterpriseDetails = (id, params) =>
  request({
    url: baseURL + `/enterprise/${id}`,
    method: "get",
    params,
  });

// 企业列表
export const getEnterpriseList = params =>
  request({
    url: baseURL + "/enterprise/list",
    method: "get",
    params,
  });

// 企业名录分页
export const getEnterpriseDirectory = params =>
  request({
    url: baseURL + "/enterprise/directory/page",
    method: "get",
    params,
  });
// 企业管理分页
export const getEnterprisePaging = params =>
  request({
    url: baseURL + "/enterprise/page",
    method: "get",
    params,
  });
// 企业管理新增
export const getEnterpriseAdd = data =>
  request({
    url: baseURL + "/enterprise",
    method: "post",
    data,
  });

// 企业管理修改
export const getEnterpriseEdit = (id, data) =>
  request({
    url: baseURL + `/enterprise/${id}`,
    method: "put",
    data,
  });

//企业管理详情
export const getEnterpriseDeils = (params, method = "get") =>
  request({
    url: baseURL + "/enterprise/" + (params.id ? params.id : params),
    method: method,
  });

// 删除
export const getEnterpriseDel = (id, params) =>
  request({
    url: baseURL + `/enterprise/${id}`,
    method: "delete",
    params,
  });

// 批量删除
export const getEnterpriseBatchDel = params =>
  request({
    url: baseURL + "/enterprise/batch?ids=" + params,
    method: "delete",
  });

// ----------------企业诉求---------------------
// 详情
export const getDemandsDetails = (id, params) =>
  request({
    url: baseURL + `/enterprise-appeal/${id}`,
    method: "get",
    params,
  });

// 列表
export const getDemandsList = params =>
  request({
    url: baseURL + "/enterprise-appeal/list",
    method: "get",
    params,
  });

// 分页
export const getDemandsPaging = params =>
  request({
    url: baseURL + "/enterprise-appeal/page",
    method: "get",
    params,
  });

// 新增
export const getDemandsAdd = data =>
  request({
    url: baseURL + "/enterprise-appeal",
    method: "post",
    data,
  });

// 企业诉求修改
export const getDemandsEdit = (id, data) =>
  request({
    url: baseURL + `/enterprise-appeal/${id}`,
    method: "put",
    data,
  });

// 删除
export const getDemandsDel = (id, params) =>
  request({
    url: baseURL + `/enterprise-appeal/${id}`,
    method: "delete",
    params,
  });

// 批量删除
export const getDemandsBatchDel = params =>
  request({
    url: baseURL + "/enterprise-appeal/batch?ids=" + params,
    method: "delete",
  });
// ------------------------企业走访--------------------

// 详情
export const getVisitDetails = (id, params) =>
  request({
    url: baseURL + `/enterprise-interview/${id}`,
    method: "get",
    params,
  });

// 列表
export const getVisitList = params =>
  request({
    url: baseURL + "/enterprise-interview/list",
    method: "get",
    params,
  });

// 分页
export const getVisitPaging = params =>
  request({
    url: baseURL + "/enterprise-interview/page",
    method: "get",
    params,
  });

// 新增
export const getVisitAdd = data =>
  request({
    url: baseURL + "/enterprise-interview",
    method: "post",
    data,
  });

// 企业走访修改
export const getVisitEdit = (id, data) =>
  request({
    url: baseURL + `/enterprise-interview/${id}`,
    method: "put",
    data,
  });

// 删除
export const getVisitDel = (id, params) =>
  request({
    url: baseURL + `/enterprise-interview/${id}`,
    method: "delete",
    params,
  });

// 批量删除
export const getVisitBatchDel = params =>
  request({
    url: baseURL + "/enterprise-interview/batch?ids=" + params,
    method: "delete",
  });

// -------------------房间管理---------------------
// 房间状态
export const getRoomStatus = params =>
  request({
    url: baseURL + "/room/status",
    method: "get",
    params,
  });

//房间详情
export const getRoomDetails = (id, params) =>
  request({
    url: baseURL + `/room/${id}`,
    method: "get",
    params,
  });

// 房间企业详情
export const getRoomEnterpriseDetails = params =>
  request({
    url: baseURL + "/room-enterprise",
    method: "get",
    params,
  });

// 房间列表
export const getRoomList = params =>
  request({
    url: baseURL + "/room/list",
    method: "get",
    params,
  });

//  房间分页
export const getRoomPaging = params =>
  request({
    url: baseURL + "/room/page",
    method: "get",
    params,
  });

// 新增
export const getRoomAdd = data =>
  request({
    url: baseURL + "/room",
    method: "post",
    data,
  });

// 房间管理修改
export const getRoomEdit = (id, data) =>
  request({
    url: baseURL + `/room/${id}`,
    method: "put",
    data,
  });

// 房间删除
export const deleteRoom = params =>
  request({
    url: baseURL + `/room/${params?.id || params}`,
    method: "delete",
    params,
  });

// 房间批量删除
export const batchDeleteRoom = params =>
  request({
    url: baseURL + `/room/batch?ids=` + params,
    method: "delete",
  });
//---------------房间租赁------------------------
//租赁详情
export const getRentalDetails = (id, params) =>
  request({
    url: baseURL + `/room-rent-record/${id}`,
    method: "get",
    params,
  });

// 房间列表
export const getRentalList = params =>
  request({
    url: baseURL + "/room-rent-record/list",
    method: "get",
    params,
  });

//  租赁分页
export const getRentalPaging = params =>
  request({
    url: baseURL + "/room-rent-record/page",
    method: "get",
    params,
  });

//  更新租赁信息Job
export const getRentalInformationJob = params =>
  request({
    url: baseURL + "/room-rent-record/job",
    method: "get",
    params,
  });

// 新增
export const getRentalAdd = data =>
  request({
    url: baseURL + "/room-rent-record",
    method: "post",
    data,
  });

// 房间租赁修改
export const getRentalEdit = (id, data) =>
  request({
    url: baseURL + `/room-rent-record/${id}`,
    method: "put",
    data,
  });

// 删除
export const deleteRental = params =>
  request({
    url: baseURL + `/room-rent-record/${params?.id || params}`,
    method: "delete",
    params,
  });

// 房间批量删除
export const batchDeleteRental = params =>
  request({
    url: baseURL + `/room-rent-record/batch?ids=` + params,
    method: "delete",
  });
