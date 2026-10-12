import request from "@/utils/request";
let baseURL = "/api/meattrade";

// 重量抽检接口 - 重量损耗ID查询, 重量损耗删除
export const weightlossId = (params, method = "delete") =>
  request({
    url: baseURL + "/weight-loss/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 重量抽检接口 - 重量损耗分页, 重量损耗新增, 重量损耗编辑
export const getWeightloss = (params, method = "delete") =>
  request({
    url: baseURL + "/weight-loss",
    method: method,
    params,
  });

// 抽检员接口

// 抽检员接口 - 抽检员ID查询, 抽检员删除
export const inspectorId = (params, method = "delete") =>
  request({
    url: baseURL + "/inspector/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 抽检员接口 - 抽检员分页查询, 抽检员新增, 抽检员更新
export const getInspector = (params, method = "delete") =>
  request({
    url: baseURL + "/inspector",
    method: method,
    params,
  });
// 抽检员接口 - 抽检员
export const getInspectorList = (params, method = "delete") =>
  request({
    url: baseURL + "/inspector/list",
    method: method,
    params,
  });

// 基础配置接口

// 基础配置接口 - 基础配置ID查询
export const configId = (params, method = "delete") =>
  request({
    url: baseURL + "/config/" + params.id,
    method: method,
    params,
  });

// 基础配置接口 - 基础配置新增, 基础配置更新
export const config = (params, method = "delete") =>
  request({
    url: baseURL + "/config",
    method: method,
    params,
  });

// 基础配置接口 - 根据业务类型查看基础配置
export const configType = (params, method = "delete") =>
  request({
    url:
      baseURL +
      "/config/type?tenant=" +
      JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
    method: method,
    params,
  });

// 会员卡接口

// 会员卡接口 - 修改会员卡
export const memberCardId = (params, method = "put") =>
  request({
    url: baseURL + "/vip-card/" + params.id,
    method: method,
    params,
  });

// 会员卡接口 - 绑定商户会员卡
export const addMemberCard = (params, method = "put") =>
  request({
    url: baseURL + "/supplier/" + params.supplierId + "/vip-card",
    method: method,
    params,
  });

// 会员卡接口 - 解绑商户会员卡
export const unbind = (params, method = "put") =>
  request({
    url: baseURL + "/vip-card/" + params.id,
    method: method,
    params,
  });

// 会员卡接口 - 查询会员卡列表
export const memberCardList = (params, method = "get") =>
  request({
    url: baseURL + "/vip-cards",
    method: method,
    params,
  });

// 会员卡接口 - 获取用户会员卡
export const userMemberCard = (params, method = "get") =>
  request({
    url: baseURL + "/user/vip-cards",
    method: method,
    params,
  });

// 银行卡
// 银行卡接口 - 查询银行卡列表
export const getBankCardList = (params, method = "put") =>
  request({
    url: baseURL + "/supplier-bank-cards",
    method: method,
    params,
  });

// 屠宰场接口

// 屠宰场接口 - 删除屠宰场,ID查询
export const abattoirId = (params, method = "delete") =>
  request({
    url: baseURL + "/abattoir/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 屠宰场接口 - 分页查询
export const getAbattoir = (params, method = "get") =>
  request({
    url: baseURL + "/abattoir/page",
    method: method,
    params,
  });
// 屠宰场接口 - 屠宰场列表
export const getAbattoirList = (params, method = "get") =>
  request({
    url: baseURL + "/abattoir/list",
    method: method,
    params,
  });
// 屠宰场接口 - 生成屠宰场编号与简称
export const getAbattoirGenerate = (params, method = "get") =>
  request({
    url: baseURL + "/abattoir/generate-code",
    method: method,
    params,
  });

// 屠宰场接口 - 新增屠宰场, 更新屠宰场
export const abattoir = (params, method = "put") =>
  request({
    url: baseURL + "/abattoir",
    method: method,
    params,
  });

// 字典接口信息

// 字典接口信息 - 字典ID查询
export const dictId = (params, method = "get") =>
  request({
    url: baseURL + "/dictionary/" + params.id,
    method: method,
    params,
  });
// 字典接口信息 - 字典分页查询
export const getDict = (params, method = "get") =>
  request({
    url: baseURL + "/dictionary/page",
    method: method,
    params,
  });

// 字典接口信息 - 根据类型查找
export const dictType = (params, method = "get") =>
  request({
    url: baseURL + "/dictionary/type",
    method: method,
    params,
  });

// 字典接口信息 - 字典新增， 字典更新
export const dict = (params, method = "post") =>
  request({
    url: baseURL + "/dictionary",
    method: method,
    params,
  });

// 提现审核接口

// 提现审核接口 - 提现审核
export const exam = (params, method = "put") =>
  request({
    url: baseURL + "/supplier/account/withdraw/" + params.id + "/audit",
    method: method,
    params,
  });

// 提现审核接口 - 查询提现审核信息
export const getExam = (params, method = "put") =>
  request({
    url: baseURL + "/supplier/account/withdraws",
    method: method,
    params,
  });

// 提现审核接口 - 用户提现
export const userRecharge = (params, method = "post") =>
  request({
    url: baseURL + "/withdraw",
    method: method,
    params,
  });

// 提现审核接口 - 获取用户提现审核列表
export const getUserRecharge = (params, method = "post") =>
  request({
    url: baseURL + "/user/withdraws",
    method: method,
    params,
  });

// 提现审核接口 - 获取提现审核详情
export const rechargeDetails = (params, method = "get") =>
  request({
    url:
      baseURL +
      "/supplier/account/withdraw/" +
      (params.id ? params.id : params),
    method: method,
    params,
  });

// 用户充值接口

// 用户充值接口 - 查询充值商户
export const getRechargeUser = (params, method = "get") =>
  request({
    url: baseURL + "/deposit-suppliers",
    method: method,
    params,
  });

// 用户充值接口 - 查询充值记录列表
export const getRechargeList = (params, method = "get") =>
  request({
    url: baseURL + "/supplier/account/deposits",
    method: method,
    params,
  });

// 交易记录接口

// 交易记录接口 - 查询交易记录 // 市场账户
export const transactions = (params, method = "get") =>
  request({
    url: baseURL + "/platform/account/transactions",
    method: method,
    params,
  });

// 交易记录接口 - 查询交易记录 // 市场总账
export const transactionsAll = (params, method = "get") =>
  request({
    url: baseURL + "/supplier/account/transactions",
    method: method,
    params,
  });

// 交易记录接口 - 查询用户交易记录信息 // 商家账户
export const userTransactions = (params, method = "get") =>
  request({
    url:
      baseURL +
      "/supplier/accounts?tenant=" +
      (params.tenant ? params.tenant : params),
    method: method,
    params,
  });

// 交易记录接口 - 获取账户交易业务类型
export const transactionsType = (params, method = "get") =>
  request({
    url: baseURL + "/account/transaction/businesses",
    method: method,
    params,
  });

// 账户接口

// 账户接口 - 获取平台资产信息 // 市场账户统计
export const marketAll = (params, method = "get") =>
  request({
    url:
      baseURL +
      "/platform/account/assets?tenant=" +
      (params.id ? params.id : params),
    method: method,
    params,
  });
// 账户接口 - 获取所有资产信息 // 市场总帐统计
export const assetsSummary = (params, method = "get") =>
  request({
    url:
      baseURL +
      "/supplier/account/assets?tenant=" +
      (params.id ? params.id : params),
    method: method,
    params,
  });
// 账户接口 - 查询商户账户信息
export const merchantAccount = (params, method = "get") =>
  request({
    url: baseURL + "/accounts",
    method: method,
    params,
  });
//获取商户资产信息
export const getMerchantAccountAssets = (id, type) =>
  request({
    url:
      baseURL +
      `/supplier/${id}/account/assets?tenant=` +
      JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
    method: "get",
  });
// 交易记录接口 - 查询商户交易记录
export const merchantAccountDetail = (params, method = "get") =>
  request({
    url:
      baseURL +
      "/supplier/" +
      params.id +
      "/account/transactions?tenant=" +
      (params.tenant ? params.tenant : params),
    method: method,
    params,
  });

// 上传文件
export const upload = (params, method = "get") =>
  request({
    url: baseURL + "/file/upload",
    method: method,
    params,
  });

// 签名验证
export const sign = (params, method = "put") =>
  request({
    url: baseURL + "/sign",
    method: method,
    params,
  });

// 编码会员卡信息
export const vipCardEncode = (params, method = "post") =>
  request({
    url: baseURL + "/vip-card/encode",
    method: method,
    params,
  });
// 绑定商户会员卡
export const bindMerchantCard = (params, method = "post") =>
  request({
    url: baseURL + `/supplier/${params.supplierId}/vip-card`,
    method: method,
    params,
  });
// 订单接口 - 删除订单, 订单ID查询
export const orderId = (params, method = "get") =>
  request({
    url: baseURL + "/order/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 订单接口 - 删除订单, 订单ID查询
export const orderProduct = (params, method = "get") =>
  request({
    url:
      baseURL + "/order-detail/" + (params.id ? params.id : params) + "/order",
    method: method,
    params,
  });

// 订单接口 - 订单查询
export const getOrder = (params, method = "get") =>
  request({
    url: baseURL + "/order",
    method: method,
    params,
  });

// 来货报备

// 来货报备接口 - 来货报备ID删除, 来货报备ID查询
export const porkReportId = (params, method = "get") =>
  request({
    url: baseURL + "/pork-report/" + params,
    method: method,
    params,
  });
// 来货报备接口 - 来货报备分页查询
export const getPorkReport = (params, method = "get") =>
  request({
    url: baseURL + "/pork-report",
    method: method,
    params,
  });
// 来货报备接口 - 来货报备撤销
export const rescindPorkReport = (params, method = "get") =>
  request({
    url: baseURL + "/pork-report/rescind/" + params.id,
    method: method,
    params,
  });

// 来货报备接口 - 来货报备新增,来货报备更新
export const porkReport = (params, method = "post") =>
  request({
    url: baseURL + "/pork-report",
    method: method,
    params,
  });

// 来货报备接口 - 来货报备新增,来货报备更新
export const addPorkReport = (params, method = "post") =>
  request({
    url: baseURL + "/pork-report",
    method: "post",
    params,
  });

// 来货报备审核接口 - 来货审核信息分页信息
export const getPorkReportAudit = (params, method = "get") =>
  request({
    url: baseURL + "/pork-report-audit/page",
    method: method,
    params,
  });

// 来货报备审核接口 - 来货报备审核新增
export const porkReportAudit = (params, method = "post") =>
  request({
    url:
      baseURL +
      `/pork-report/${
        params.porkReportId ? params.porkReportId : params
      }/audit?auditRemark=${params.auditRemark}&status=${params.status}`,
    method: method,
    params,
  });

// 统计接口

// 统计接口 - 销售统计分页查询
export const statistics = (params, method = "get") =>
  request({
    url: baseURL + "/statistics",
    method: method,
    params,
  });

// 理货详情接口

// 理货详情接口 - 理货数据详情
export const Audit = (params, method = "get") =>
  request({
    url: baseURL + "/pork-arrange-detail",
    method: method,
    params,
  });

// 商品详情接口

// 商品详情接口 - 商品详情分页查询
export const goodsDetail = (params, method = "get") =>
  request({
    url: baseURL + "/order-detail",
    method: method,
    params,
  });

// 理货审核次数
export const tallyAuditTimes = (params, method = "get") =>
  request({
    url: baseURL + "/pork-arrange-audit/log/" + params.id,
    method: method,
    params,
  });

// 结算接口

// 结算接口 - 结算ID查询
export const settlementId = (params, method = "get") =>
  request({
    url: baseURL + "/settlement/" + params.id,
    method: method,
    params,
  });

// 结算接口 - 结算
export const settleId = (params, method = "get") =>
  request({
    url: baseURL + "/order/settlement/" + params.id,
    method: method,
    params,
  });

// 结算接口 - 批量处理完成结算
export const batchSettleId = (params, method = "get") =>
  request({
    url: baseURL + "/order/batch/settlement",
    method: "put",
    params,
  });

// 结算接口 - 结算分页查询, 结算新增, 结算更新
export const settlement = (params, method = "get") =>
  request({
    url: baseURL + "/settlement/page",
    method: method,
    params,
  });

// 结算配置接口

// 结算配置接口 - 结算配置列表, 结算配置新增, 结算配置更新
export const settlementConfig = (params, method = "get") =>
  request({
    url: baseURL + "/settlement-config",
    method: method,
    params,
  });

// 结算配置接口 - 结算配置删除
export const settlementConfigId = (params, method = "get") =>
  request({
    url: baseURL + "/settlement-config/" + params.id,
    method: method,
    params,
  });

// 食安抽检接口

// 食安抽检接口 - 食安信息新增, 食安信息编辑
export const goodsSafety = (params, method = "post") =>
  request({
    url: baseURL + "/spot-check/" + (params.id ? params.id : params),
    method: method,
    params,
  });
// 食安抽检接口 - 食安分页查询
export const getGoodsSafety = (params, method = "post") =>
  request({
    url: baseURL + "/spot-check/page",
    method: method,
    params,
  });
// 食安抽检接口 - 食安抽检ID查询
export const goodsSafetyId = (params, method = "post") =>
  request({
    url: baseURL + "/spot-check/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 数据理货接口

// 数据理货接口 - 理货数据更新
export const tallyDataUpdate = (params, method = "put") =>
  request({
    url: baseURL + "/pork-arrange",
    method: method,
    params,
  });

// 登记检疫票接口

// 登记检疫票接口 - 登记检疫票ID查询
export const pratiqueRegisterId = (params, method = "get") =>
  request({
    url: baseURL + "/pratique-register/" + (params.id ? params.id : params),
    method: method,
    params,
  });
// 登记检疫票接口 - 登记检疫票分页查询
export const getPratiqueRegister = (params, method = "get") =>
  request({
    url: baseURL + "/pratique-register/page",
    method: method,
    params,
  });
// 登记检疫票接口 - 登记检疫票新增, 登记检疫票编辑
export const pratiqueRegister = (params, method = "post") =>
  request({
    url: baseURL + `/pratique-register/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 理货数据

// 理货数据审核接口 - 理货审核ID查询
export const tallyDataAuditId = (params, method = "get") =>
  request({
    url: baseURL + "/pork-arrange-audit/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 理货数据审核接口 - 理货审核数据撤销
export const TallyDataAuditRescind = (params, method = "get") =>
  request({
    url:
      baseURL +
      "/pork-arrange-audit/" +
      (params.id ? params.id : params) +
      "/rescind",
    method: method,
    params,
  });
// 理货数据审核接口 - 理货数据审核分页
export const getTallyDataAudit = (params, method = "get") =>
  request({
    url: baseURL + "/pork-arrange-audit/page",
    method: method,
    params,
  });
// 理货数据审核接口 - 理货数据审核更新
export const tallyDataAudit = (params, method = "get") =>
  request({
    url:
      baseURL +
      `/pork-arrange-audit/${params.id ? params.id : params}/audit?status=${
        params.status
      }&remark=${params.remark}`,
    method: method,
    params,
  });

// 理货详情接口 - 理货数据详情
export const getPorkArrangeDetailPage = (params, method = "get") =>
  request({
    url: baseURL + "/pork-arrange-detail/page",
    method: method,
    params,
  });
// 理货详情接口 - 理货详情新增
export const postPorkArrangeDetail = (params, method = "get") =>
  request({
    url: baseURL + "/pork-arrange-detail",
    method: method,
    params,
  });

// 数据理货接口 - 理货数据更新
export const putPorkArrange = (params, method = "get") =>
  request({
    url: baseURL + "/pork-arrange",
    method: method,
    params,
  });

// 食安溯源

// 溯源接口 - 食安溯源分页查询

export const resource = (params, method = "get") =>
  request({
    url: baseURL + "/spot-check-resource/page",
    method: method,
    params,
  });

// 溯源接口 - 食安溯源ID查询

export const resourceId = (params, method = "get") =>
  request({
    url: baseURL + "/spot-check-resource/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 供货接口

//  供货接口 - 商品供货跟进分页
export const getFollowUp = (params, method = "get") =>
  request({
    url: baseURL + "/track",
    method: method,
    params,
  });
//  供货接口 - 商品供货跟进报备信息
export const followUpReport = (params, method = "get") =>
  request({
    url: baseURL + "/track/pork-report/" + (params.code ? params.code : params),
    method: method,
  });
//  供货接口 - 商品供货跟进业务流程
export const followUpProcess = (params, method = "get") =>
  request({
    url: baseURL + "/track/biz",
    method: method,
    params,
  });
//  供货接口 - 商品供货跟进商品明细
export const followUpProductDetail = (params, method = "get") =>
  request({
    url: baseURL + "/track/details",
    method: method,
    params,
  });
//  供货接口 - 商品供货跟进商户
export const followUpMerchant = (params, method = "get") =>
  request({
    url: baseURL + "/track/supplier/" + (params.code ? params.code : code),
    method: method,
    params,
  });
// 数据看板

// 数据看板统计
export const platformStatistc = (params, method = "get") =>
  request({
    url: baseURL + "/stat/board",
    method: method,
    params,
  });

// 理货商品详情
export const tallyProductDetail = (params, method = "get") =>
  request({
    url: baseURL + "/stat/pork-arrange/finished",
    method: method,
    params,
  });
// 商家排名
export const merchantRanking = (params, method = "get") =>
  request({
    url: baseURL + "/stat/seller",
    method: method,
    params,
  });

// 设备台账

// 设备台账
export const equipAccount = (params, method = "get") =>
  request({
    url: baseURL + "/device",
    method: method,
    params,
  });

// 设备台账
export const equipAccountId = (params, method = "get") =>
  request({
    url: baseURL + "/device/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 设备台账(替代详情页面)
export const getEquipAccountId = (params, method = "get") =>
  request({
    url: baseURL + "/device/" + params,
    method: method,
    params,
  });
// 运行记录
export const operationRecord = (params, method = "get") =>
  request({
    url: baseURL + "/tally-operation-log",
    method: method,
    params,
  });

// 设备类型

// 查询
export const equipType = (params, method = "get") =>
  request({
    url: baseURL + "/device-type/list",
    method: method,
    params,
  });

// 新增、编辑
export const equipTypeOperate = (params, method = "get") =>
  request({
    url: baseURL + "/device-type",
    method: method,
    params,
  });

// 删除
export const equipTypeDelete = (params, method = "delete") =>
  request({
    url: baseURL + "/device-type/" + params.id,
    method: method,
    params,
  });

// 服务器配置

// 查询
export const getServerConfig = (params, method = "get") =>
  request({
    url: baseURL + "/server-configuration/one",
    method: method,
    params,
  });

// 编辑、查询
export const serverConfig = (params, method = "post") =>
  request({
    url: baseURL + "/server-configuration",
    method: method,
    params,
  });

// 获取摄像头
export const camera = (params, method = "post") =>
  request({
    url: baseURL + "/device/camera",
    method: method,
    params,
  });

// 屠宰场报表统计
export const getAbattoirStatPage = (params, method = "get") =>
  request({
    url: baseURL + "/abattoir/stat/page",
    method: method,
    params,
  });

// 交易数据汇总
export const getPorkStatSummary = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/summary",
    method: "get",
    params,
  });

// 白条交易量信息
export const getPorkStatTradeCapacity = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/trade-capacity",
    method: "get",
    params,
  });

// 白条交易量信息
export const getPorkStatTradeCapacityLine = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/trade-capacity/line",
    method: "get",
    params,
  });

// 白条供货量
export const getPorkStatSupplyCapacity = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/supply-capacity",
    method: "get",
    params,
  });

// 白条供货量
export const getPorkStatSupplyCapacityLine = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/supply-capacity/line",
    method: "get",
    params,
  });

// 白条交易均价
export const getPorkStatTradeAverage = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/trade-average",
    method: "get",
    params,
  });

// 白条交易均价
export const getPorkStatTradeAverageLine = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/trade-average/line",
    method: "get",
    params,
  });

// 食安信息
export const getPorkStatSpotCheck = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/spot-check",
    method: "get",
    params,
  });

// 理货数据审核
export const getPorkStatArrangeAudit = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/arrange-audit",
    method: "get",
    params,
  });

// 来货报备信息
export const getPorkStatReport = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/report",
    method: "get",
    params,
  });

// 报备商家风险信息
export const getPorkStatRiskLevel = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/risk-level",
    method: "get",
    params,
  });

// 供货商交易排名
export const getPorkSupplyTradeRank = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/supply-trade/rank",
    method: "get",
    params,
  });

// 白条出场情况
export const getPorkAbattoir = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/abattoir",
    method: "get",
    params,
  });

// 理货商品明细
export const getPorkStatArrangeDetail = (params, method = "get") =>
  request({
    url: baseURL + "/pork-stat/arrange-detail",
    method: "get",
    params,
  });

// 猪肉滑轨看板数据权限分页信息
export const getStatRolePanelPage = (params, method = "get") =>
  request({
    url: baseURL + "/stat/role-panel/page",
    method: "get",
    params,
  });

// 面板角色权限新增
export const postStatRolePanel = (params, method = "post") =>
  request({
    url: baseURL + "/stat/role-panel",
    method: "post",
    params,
  });

// 面板角色权限编辑
export const putStatRolePanel = (params, method = "put") =>
  request({
    url: baseURL + "/stat/role-panel",
    method: "put",
    params,
  });

// 根据角色主键获取面板类型
export const getStatRolePanelRole = (params, method = "get") =>
  request({
    url: baseURL + `/stat/role-panel/${params.id ? params.id : params}/role`,
    method: "get",
  });

// 根据角色主键获取面板类型
export const getStatRolePanelRoles = (params, method = "get") =>
  request({
    url: baseURL + `/stat/role-panel/roles`,
    method: "get",
    params,
  });

// 获取看板角色列表
export const getStatRole = (params, method = "get") =>
  request({
    url: baseURL + `/stat/roles`,
    method: "get",
  });

// 获取理货商品列表
export const getTallyProduct = (params, method = "get") =>
  request({
    url:
      baseURL + `/pork-arrange-detail/${params.id ? params.id : params}/list`,
    method: "get",
  });
// 区域组树形列表
export const areaGroupList = (params) =>
  request({
    url: baseURL + `/area-group/list`,
    method: "get",
    params,
  });
// 区域组新增
export const addAreaGroup = (params) =>
  request({
    url: baseURL + `/area-group`,
    method: "post",
    params,
  });
// 区域组修改
export const editAreaGroup = (params) =>
  request({
    url: baseURL + `/area-group/${params.id}`,
    method: "put",
    params,
  });
// 区域组删除
export const deleteAreaGroup = (params) =>
  request({
    url: baseURL + `/area-group/${params?.id || params}`,
    method: "delete",
    params,
  });
// 区域组配置删除
export const areaGroupDeleteArea = (params) =>
  request({
    url: baseURL + `/area-group-configs/${params.areaGroupId}/${params.areaId}`,
    method: "delete",
    params,
  });
// 区域组获取配置区域列表
export const areaGrounpGetArea = (params) =>
  request({
    url: baseURL + `/area-group-configs/${params?.id || params}`,
    method: "get",
    params,
  });
// 区域组配置区域保存
export const areaGrounpAddArea = (params) =>
  request({
    url: baseURL + `/area-group-config`,
    method: "post",
    params,
  });
