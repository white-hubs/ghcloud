import request from "@/utils/request";
let baseURL = "/api/entercharge";
// if (process.env.NODE_ENV === "lzy" || process.env.NODE_ENV === "loc") {
//   baseURL = "http://192.168.2.158:3100/entercharge";
// }

/* 报备信息 */

// 获取报备信息
export const entryFeeReport = (params, method) =>
  request({
    url: baseURL + "/purchase-report",
    method: method,
    params,
  });

// 报备信息Id查询
export const entryFeeReportId = (params, method) =>
  request({
    url: baseURL + "/purchase-report/" + params + "/detail",
    method: "get",
    params,
  });

// 报备信息修改记录
export const reportModifyRecord = (params, method) =>
  request({
    url: baseURL + "/purchase-report/" + params + "/update-record",
    method: "get",
    params,
  });

// 报备信息所有修改记录
export const reportAllModify = (params, method) =>
  request({
    url: baseURL + `/purchase-report/${params.id ? params.id : params}/all/update-record`,
    method: "get",
    params,
  });

// 来货无报备车查询
export const noReportCar = (params, method) =>
  request({
    url: baseURL + `/purchase-report/no-report/car`,
    method: "get",
    params,
  });

// 报备信息收费详情
export const reportModifyFee = (params, method) =>
  request({
    url: baseURL + `/enter/fee/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 人工修改进场金额
export const manualEditEnterFee = (params, method) =>
  request({
    url: baseURL + `/purchase-report/${params.id ? params.id : params}/fee`,
    method: method,
    params,
  });

// 收款
export const recieveFee = (params, method) =>
  request({
    url: baseURL + `/pay/cash`,
    method: method,
    params,
  });

/* 规则分组 */

// 获取规则分组
export const ruleCategory = (params, method) =>
  request({
    url: baseURL + "/charge-rule-category",
    method: "get",
    params,
  });

// 规则分组状态
export const ruleCategoryStatus = (params, method) =>
  request({
    url: baseURL + "/charge-rule-category/" + params.id + "/status",
    method: "put",
    params,
  });

// 规则分组编辑
export const ruleCategoryEdit = (params, method) =>
  request({
    url: baseURL + "/charge-rule-category/" + params.id,
    method: "put",
    params,
  });

/* 收费明细 */

// 获取收费明细列表
export const chargeRuleList = (params, method) =>
  request({
    url: baseURL + "/charge-rule",
    method: "get",
    params,
  });

// 获取收费明细详情
export const chargeRuleDetail = (params, method) =>
  request({
    url: baseURL + "/charge-rule/" + params,
    method: "get",
    params,
  });

// 获取收费明细id删除
export const chargeRuleDelete = (params, method) =>
  request({
    url: baseURL + "/charge-rule/" + params,
    method: "delete",
    params,
  });

// 修改收费明细状态
export const chargeRuleStatus = (params, method) =>
  request({
    url: baseURL + "/charge-rule/" + params.id + "/status",
    method: "put",
    params,
  });

// 添加收费规则
export const addRules = (params, method) =>
  request({
    url: baseURL + "/charge-rule",
    method: "post",
    params,
  });

// 编辑收费规则
export const EditRules = (params, method) =>
  request({
    url: baseURL + "/charge-rule/" + params.id,
    method: "put",
    params,
  });

/* 车辆管理 */

// 获取审核车辆信息列表
export const carInfo = (params, method) =>
  request({
    url: baseURL + "/check/car-info",
    method: "get",
    params,
  });

// 获取报备车辆信息详情
export const carInfoId = (params, method) =>
  request({
    url: baseURL + "/car-info/" + params,
    method: "get",
    params,
  });

// 审核车辆
export const carInfoAudit = (params, method) =>
  request({
    url: baseURL + "/car-info/" + params.id + "/check",
    method: "put",
    params,
  });

// 删除车辆
export const carInfoDel = (params, method) =>
  request({
    url: baseURL + "/car-info/" + (params.id ? params.id : params),
    method: "delete",
    params,
  });

/* 车型配置*/

// 车型配置表格
export const carTypeConfig = (params, method) =>
  request({
    url: baseURL + "/car-type",
    method: "get",
    params,
  });

// 车型配置列表
export const carTypeConfigList = (params, method) =>
  request({
    url: baseURL + "/car-type/list",
    method: "get",
    params,
  });

// 车型配置新增
export const carTypeAdd = (params, method) =>
  request({
    url: baseURL + "/car-type",
    method: "post",
    params,
  });

// 车型配置删除
export const carTypeDelete = (params, method) =>
  request({
    url: baseURL + "/car-type/" + params,
    method: "delete",
    params,
  });

// 车型配置编辑
export const carTypeEdit = (params, method) =>
  request({
    url: baseURL + "/car-type/" + params.id,
    method: "put",
    params,
  });

// 人工设置报备重量
export const setWeight = (params, method) =>
  request({
    url: baseURL + "/purchase-report/weight",
    method: "post",
    params,
  });

// 设置报备重量
export const setWeightNew = (params, method) =>
  request({
    url: baseURL + `/purchase-report/${params.id ? params.id : params}/weight`,
    method: "post",
    params,
  });

// 开闸
export const openTheGate = (params, method) =>
  request({
    url: baseURL + "/purchase-report/" + params.id + "/open-chanel",
    method: "post",
    params,
  });

// 进门收费统计(头部)
export const enterStatistics = (params, method) =>
  request({
    url: baseURL + "/enter/condition/stat",
    method: "get",
    params,
  });

// 进门收费统计(表格)
export const enterStatisticsTable = (params, method) =>
  request({
    url: baseURL + "/enter-charge-record",
    method: method,
    params,
  });

// 报备失效时间查询
export const expireTime = (params, method) =>
  request({
    url: baseURL + "/expire/report",
    method: method,
    params,
  });

// 进场收费数据看板
export const enterPanel = (params, method) =>
  request({
    url: baseURL + "/enter/condition/detail/stat",
    method: method,
    params,
  });

/* 进场明细 */

// 收费记录
export const enterRecieveRecord = (params, method) =>
  request({
    url: baseURL + "/enter-charge-verify",
    method: method,
    params,
  });

// 收费记录top统计
export const enterRecieveTop = (params, method) =>
  request({
    url: baseURL + `/enter/charge/${params.operatorAccount ? params.operatorAccount : params}/stat`,
    method: method,
    params,
  });

// 个人对账信息获取
export const reconInfo = (params, method) =>
  request({
    url: baseURL + `/enter-charge-verify/verify/${params.account ? params.account : params}`,
    method: method,
    params,
  });

// 个人对账信息表格
export const reconRecord = (params, method) =>
  request({
    url: baseURL + `/enter-charge-verify/page`,
    method: method,
    params,
  });

// 个人对账信息详情
export const reconRecordDetail = (params, method) =>
  request({
    url: baseURL + `/enter-charge-verify/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 个人对账信息统计
export const reconRecordSta = (params, method) =>
  request({
    url: baseURL + `/enter-charge-verify/stat`,
    method: method,
    params,
  });

// 修改对账状态
export const reconRecordStatus = (params, method) =>
  request({
    url: baseURL + `/enter-charge-verify/${params.id}/${params.status}`,
    method: method,
    params,
  });

// 金额修改记录
export const feeEditRecord = (params, method) =>
  request({
    url: baseURL + `/purchase-fee-update/page`,
    method: method,
    params,
  });

// 重量修改记录
export const weightEditRecord = (params, method) =>
  request({
    url: baseURL + `/purchase-weight-update/page`,
    method: method,
    params,
  });

// 开闸修改记录
export const openGateRecord = (params, method) =>
  request({
    url: baseURL + `/purchase-lift-rod-record/page`,
    method: method,
    params,
  });

/* 来货稽查 */

// 稽查分类
// 稽查分类分页
export const checkCategory = (params, method) =>
  request({
    url: baseURL + "/check-category/page",
    method: method,
    params,
  });

// 稽查分类添加
export const checkCategoryAdd = (params, method) =>
  request({
    url: baseURL + "/check-category",
    method: method,
    params,
  });

// 稽查分类修改,删除,详情
export const checkCategoryId = (params, method) =>
  request({
    url: baseURL + `/check-category/ ${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 稽查分类批量删除
export const checkCategoryBatchDel = (params, method) =>
  request({
    url: baseURL + "/check-category/batchdelete",
    method: method,
    params,
  });

// 稽查分类初始化
export const checkCategoryInit = (params, method) =>
  request({
    url: baseURL + "/check-category/init",
    method: method,
    params,
  });

// 稽查异常

// 稽查异常分页
export const error = (params, method) =>
  request({
    url: baseURL + "/check-exception/page",
    method: method,
    params,
  });

// 稽查异常添加
export const errorAdd = (params, method) =>
  request({
    url: baseURL + "/check-exception",
    method: method,
    params,
  });

// 稽查异常详情,修改,删除
export const errorId = (params, method) =>
  request({
    url: baseURL + "/check-exception/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 稽查异常详情,修改,删除
export const errorBatchDel = (params, method) =>
  request({
    url: baseURL + "/check-exception/batchdelete",
    method: method,
    params,
  });

// 稽查人员

// 稽查人员分页
export const checkedPeople = (params, method) =>
  request({
    url: baseURL + "/check-member-config/page",
    method: method,
    params,
  });

// 稽查人员配置
export const checkedPeopleConfig = (params, method) =>
  request({
    url: baseURL + "/check-member-config",
    method: method,
    params,
  });

// 稽查人员配置删除,修改,详情
export const checkedPeopleConfigId = (params, method) =>
  request({
    url: baseURL + "/check-member-config/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 稽查记录

// 稽查记录分页
export const checkedRecord = (params, method) =>
  request({
    url: baseURL + "/pc/check-record",
    method: method,
    params,
  });

// 稽查记录详情
export const checkedRecordDetail = (params, method) =>
  request({
    url: baseURL + "/check-record/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 风险设置

// 风险等级
export const riskLevel = (params, method) =>
  request({
    url: baseURL + "/check-risk-config",
    method: method,
    params,
  });

// 风险等级数据
export const getRiskLevel = (params, method) =>
  request({
    url: baseURL + "/check-risk-config/tenant",
    method: method,
    params,
  });

// 来货报备

// 来货报备分页
export const reportInfo = (params, method) =>
  request({
    url: baseURL + "/pc/check-record/report/page",
    method: method,
    params,
  });

// 来货报备分页
export const reportInfoDetial = (params, method) =>
  request({
    url: baseURL + `/check-record/${params.id ? params.id : params}/report`,
    method: method,
    params,
  });

/* 稽查统计 */

// 档位稽查统计
export const boothCheck = (params, method) =>
  request({
    url: baseURL + `/check-record/check/condition/stat`,
    method: method,
    params,
  });

// 个人稽查统计
export const userCheck = (params, method) =>
  request({
    url: baseURL + `/check-record/check/user/stat`,
    method: method,
    params,
  });

// 支付方式筛选
export const payTypeList = (params, method) =>
  request({
    url: baseURL + `/pay-type`,
    method: method,
    params,
  });
