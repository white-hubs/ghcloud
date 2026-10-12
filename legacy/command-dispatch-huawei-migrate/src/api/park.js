import request from "@/utils/request";
let baseURL = "/api/parking";
// if (process.env.NODE_ENV === "lzy" || process.env.NODE_ENV === "lrj") {
//   baseURL = "http://192.168.2.158:3100/parking";
// }

//播报信息
export const broadcast = (params, method) =>
  request({
    url: baseURL + `/parking-slogan/get`,
    method: method,
    params,
  });

//修改
export const editBroadcast = (params, method) =>
  request({
    url: baseURL + `/parking-slogan`,
    method: method,
    params,
  });

// 车卡管理

// 分页
export const vehicleCard = (params, method) =>
  request({
    url: baseURL + `/parking-card/page`,
    method: method,
    params,
  });

// 列表
export const vehicleCardList = (params, method) =>
  request({
    url: baseURL + `/parking-card/list`,
    method: method,
    params,
  });

// 新增
export const vehicleCardAdd = (params, method) =>
  request({
    url: baseURL + `/parking-card`,
    method: method,
    params,
  });

// 更新
export const vehicleCardId = (params, method) =>
  request({
    url: baseURL + `/parking-card/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 车辆管理

// 分页
export const vehicle = (params, method = "get") =>
  request({
    url: baseURL + `/parking-card-purchase/page`,
    method: method,
    params,
  });
export const getVehicleList = (params, method = "get") =>
  request({
    url: `/api/park-management/vehicle/page`,
    method: method,
    params,
  });
// 详情
export const vehicleId = (params, method) =>
  request({
    url: baseURL + `/parking-card-purchase/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 购卡详情
export const vehicleIdCard = (params, method) =>
  request({
    url: baseURL + `/parking-card-delay/${params.id ? params.id : params}/list`,
    method: method,
    params,
  });

// 购卡详情2
export const getParkingCardPurchaseDeplay = (params, method) =>
  request({
    url: baseURL + `/parking-card-purchase/deplay/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 购卡详情2
export const getParkingCardDeplay = (params, method) =>
  request({
    url: baseURL + `/parking-card-delay/delays/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 新增
export const vehicleAdd = (params, method) =>
  request({
    url: baseURL + `/parking-card-purchase`,
    method: method,
    params,
  });

// 新增
export const vehicleDelay = (params, method) =>
  request({
    url: baseURL + `/parking-card-purchase/${params.id ? params.id : params}/delay`,
    method: method,
    params,
  });

// 黑白名单

// 表格
export const roster = (params, method) =>
  request({
    url: baseURL + `/parking-car-monitor/page`,
    method: method,
    params,
  });

// 新增
export const rosterAdd = (params, method) =>
  request({
    url: baseURL + `/parking-car-monitor/batch`,
    method: method,
    params,
  });

// 移除
export const rosterId = (params, method) =>
  request({
    url: baseURL + `/parking-car-monitor/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 默认省份

// 获取
export const defaultProvince = (params, method) =>
  request({
    url: baseURL + `/parking-plate-no-default/get`,
    method: method,
    params,
  });

// 新增,更新
export const defaultProvOperate = (params, method) =>
  request({
    url: baseURL + `/parking-plate-no-default`,
    method: method,
    params,
  });

// 车道

// 树
export const laneTree = (params, method) =>
  request({
    url: baseURL + `/parking-lane-device/tree/list`,
    method: method,
    params,
  });

// 树
export const laneTreeNoEquip = (params, method) =>
  request({
    url: baseURL + `/parking-lane/tree/list`,
    method: method,
    params,
  });

// 表
export const lane = (params, method) =>
  request({
    url: baseURL + `/parking-lane/page`,
    method: method,
    params,
  });

// 新增
export const laneAdd = (params, method) =>
  request({
    url: baseURL + `/parking-lane`,
    method: method,
    params,
  });

// 批量新增设备
export const equipAddBatch = (params, method) =>
  request({
    url: baseURL + `/parking-lane-device/batch`,
    method: method,
    params,
  });

// 删除绑定设备
export const deletelaneEquip = (params, method) =>
  request({
    url: baseURL + `/parking-lane-device/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 删除车道
export const deleteLane = (params, method) =>
  request({
    url: baseURL + `/parking-lane/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 收费规则

// 新增收费规则
export const chargeRules = (params, method) =>
  request({
    url: baseURL + `/parking-charge-rule`,
    method: method,
    params,
  });

// 获取收费规则
export const getChargeRules = (params, method) =>
  request({
    url: baseURL + `/parking-charge-rule/${params.carTypeId ? params.carTypeId : params}`,
    method: method,
    params,
  });

// 车辆收费规则类型详情
export const vehChargeRules = (params, method) =>
  request({
    url: baseURL + `/parking-charge-rule/${params.carTypeId}/${params.ruleCategory}`,
    method: method,
    params,
  });

// 有规则的车辆
export const rulesVeh = (params, method) =>
  request({
    url: baseURL + `/parking-charge-rule/car-types`,
    method: method,
    params,
  });

// 复制规则
export const rulesCopy = (params, method) =>
  request({
    url: baseURL + `/parking-charge-rule/copy`,
    method: method,
    params,
  });

// 有其他的车辆类型
export const carTypeOther = (params, method) =>
  request({
    url: baseURL + `/car-type/parking/list`,
    method: method,
    params,
  });

// 收费对账

// 收费对账记录
export const ReconcilieRecord = (params, method) =>
  request({
    url: baseURL + `/parking-shift/page`,
    method: method,
    params,
  });

// 收费对账记录
export const ReconcilieCancel = (params, method) =>
  request({
    url: baseURL + `/parking-shift/${params.id ? params.id : params}/revoke`,
    method: method,
    params,
  });

// 新增收费对账记录
export const ReconcilieRecordAdd = (params, method) =>
  request({
    url: baseURL + `/parking-shift/${params.id ? params.id : params}/verify-account`,
    method: method,
    params,
  });

// 缴费记录
export const payRecord = (params, method) =>
  request({
    url: baseURL + `/parking-charges`,
    method: method,
    params,
  });

// 入场补录

// 入场补录记录
export const enterRepair = (params, method) =>
  request({
    url: baseURL + `/parking-manual-entry-records`,
    method: method,
    params,
  });

// 车场明细

// 手动开闸记录
export const manualOpenGateRcord = (params, method) =>
  request({
    url: baseURL + `/parking-lift-rod-records`,
    method: method,
    params,
  });

// 进出流水记录
export const turnoverRecord = (params, method) =>
  request({
    url: baseURL + `/parking-records/pc`,
    method: method,
    params,
  });

// 收费对账统计
export const chargeSta = (params, method) =>
  request({
    url: baseURL + `/parking-shift/calculate-amount`,
    method: method,
    params,
  });

// 收费对账统计
export const enterCorrect = (params, method) =>
  request({
    url: baseURL + `/parking-record-entry-corrects`,
    method: method,
    params,
  });

// 车辆管理应用

// 开闸原因
export const openGateRea = (params, method) =>
  request({
    url: baseURL + `/parking-lift-rod-reasons`,
    method: method,
    params,
  });

// 开闸原因
export const openGateReaId = (params, method) =>
  request({
    url: baseURL + `/parking-lift-rod-reason/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 开闸原因
export const openGateReaAdd = (params, method) =>
  request({
    url: baseURL + `/parking-lift-rod-reason`,
    method: method,
    params,
  });

// 停车收费统计
export const parkingStatis = (params, method) =>
  request({
    url: baseURL + `/parking-statistics`,
    method: method,
    params,
  });
