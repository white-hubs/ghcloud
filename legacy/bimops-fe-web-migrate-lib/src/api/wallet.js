import request from "../utils/request";
let baseURL = "/api/wallet";
// 用户钱包接口

// 用户钱包接口 - 批量获取用户钱包信息
export const userWallets = (params, method = "get") =>
  request({
    url: baseURL + "/user/wallets",
    method: method,
    params,
  });
// 用户钱包接口 - 获取用户账户列表
export const userAccounts = (params, method = "get") =>
  request({
    url: baseURL + "/wallet/accounts",
    method: method,
    params,
  });
// 用户钱包接口 - 获取用户钱包信息
export const userWallet = (params, method = "get") =>
  request({
    url: baseURL + "/wallet",
    method: method,
    params,
  });

// 用户钱包接口 - 获取钱包账户列表
export const walletAccounts = (params, method = "get") =>
  request({
    url: baseURL + "/wallet/" + params.id + "/accounts",
    method: method,
    params,
  });

// 账户提现接口

// 账户提现接口 - 完成账户提现
export const cashOut = (params, method = "post") =>
  request({
    url: baseURL + "/withdraw/" + params.id + "/complete",
    method: method,
    params,
  });

// 免密支付接口

// 免密支付接口 - 获取免密支付配置
export const getPasswordFree = (params, method = "put") =>
  request({
    url: baseURL + "/quick-payment",
    method: method,
    params,
  });
// 免密支付接口 - 修改免密支付配置
export const passwordFree = (params, method = "put") =>
  request({
    url: baseURL + "/quick-payment/" + params.id,
    method: method,
    params,
  });

// 账户充值接口

// // 账户充值接口 - 账户充值
// export const recharge = (method = 'put', params) =>
//   request({
//     url: baseURL + "/account/" + params.id + "/deposit",
//     method: method,
//     params,
//   });

// 支付方式接口

// 支付方式接口 - 获取支付方式列表
export const payWay = (params, method = "put") =>
  request({
    url: baseURL + "/payment-modes",
    method: method,
    params,
  });

// 支付方式接口 - 配置支付方式
export const setPayWay = (params, method = "put") =>
  request({
    url: baseURL + "/payment-mode",
    method: method,
    params,
  });

// 支付方式接口

// 支付方式接口 - 更新余额支付配置, 获取余额支付配置
export const balance = (params, method = "put") =>
  request({
    url: baseURL + "/channel/balance?tenant=" + (params.tenant ? params.tenant : params),
    method: method,
    params,
  });

// IC卡接口

// IC卡接口 - 修改IC卡
export const modifyIC = (params, method = "put") =>
  request({
    url: baseURL + "/ic-card/" + params.id,
    method: method,
    params,
  });
// IC卡接口 - 新增钱包IC卡,获取钱包IC卡列表
export const addIC = (params, method = "put") =>
  request({
    url: baseURL + "/wallet/" + params.id + "/ic-card",
    method: method,
    params,
  });
// IC卡接口 - 获取钱包IC卡列表
export const getICList = (params, method = "put") =>
  request({
    url: baseURL + "/wallet/" + params.id + "/ic-cards",
    method: method,
    params,
  });
// IC卡接口 - 激活IC卡
export const activateIC = (params, method = "put") =>
  request({
    url: baseURL + "/ic-card/" + params.id + "/activate",
    method: method,
    params,
  });

// 银行卡接口

// 银行卡接口 - 修改银行卡
export const modifyBankCard = (params, method = "put") =>
  request({
    url: baseURL + "/bank-card/" + params.id,
    method: method,
    params,
  });
// 银行卡接口 - 新增用户银行卡
export const addBankCard = (params, method = "put") =>
  request({
    url: baseURL + "/user/" + params.userId + "/bank-card",
    method: method,
    params,
  });
// // 银行卡接口 - 获取钱包银行卡列表
// export const getBankCardList = (method = 'put', params) =>
//   request({
//     url: baseURL + "/wallet/" + params.id + "/bank-cards",
//     method: method,
//     params,
//   });

// 账户充值接口

// 账户充值接口 - 查询充值记录列表
export const rechargeRecord = (params, method = "put") =>
  request({
    url: baseURL + "/deposits",
    method: method,
    params,
  });

// 账户充值接口 - 用户充值
export const recharge = (params, method = "put") =>
  request({
    url: baseURL + "/supplier/" + params.id + "/account/recharge",
    method: method,
    params,
  });

// 账户充值接口 - 获取用户充值记录
export const getRecharge = (params, method = "put") =>
  request({
    url: baseURL + "/user/deposits",
    method: method,
    params,
  });

// IC卡接口 - 获取用户IC卡列表
export const userIC = (params, method = "get") =>
  request({
    url: baseURL + "/wallet/" + params.id + "/ic-cards",
    method: method,
    params,
  });
// IC卡接口 - 新增IC卡
export const addUserIC = (params, method = "get") =>
  request({
    url: baseURL + "/wallet/" + params.walletId + "/ic-card",
    method: method,
    params,
  });
// IC卡接口 - 修改IC卡
export const userICEdit = (params, method = "get") =>
  request({
    url: baseURL + "/ic-card/" + params.id,
    method: method,
    params,
  });
// 支付方式接口 - 获取支付方式列表
export const getPayment = (params, method = "get") =>
  request({
    url: baseURL + "/payment-modes",
    method: method,
    params,
  });
// 支付方式接口 - 配置支付方式
export const setPayment = (params, method = "put") =>
  request({
    url: baseURL + "/payment-mode",
    method: method,
    params,
  });
// 免密支付接口 - 获取免密支付配置
export const quickPay = (params, method = "get") =>
  request({
    url: baseURL + "/quick-payment",
    method: method,
    params,
  });
// 免密支付接口 - 获取免密支付配置
export const setQuickPay = (params, method = "put") =>
  request({
    url: baseURL + "/quick-payment/" + params.id,
    method: method,
    params,
  });
// 银行卡接口 - 获取钱包银行卡列表
export const bankList = (params, method = "get") =>
  request({
    url: baseURL + "/wallet/" + params.id + "/merchant-bank-cards",
    method: method,
    params,
  });
// 银行卡接口 - 新增钱包银行卡
export const postBankCard = (params, method = "post") =>
  request({
    url: baseURL + "/wallet/" + params.id + "/bank-card",
    method: method,
    params,
  });

//获取市场钱包
export const getWallet = (params, type) =>
  request({
    url: baseURL + "/tenant/wallet?tenant=" + (params.id ? params.id : params),
    method: "get",
    params,
  });

//绑定银行卡
export const postMineBankCard = (params, type) =>
  request({
    url: baseURL + "/mine/bank-card",
    method: "post",
    params,
  });

//激活企业钱包
export const postWalletActivate = (params, type) =>
  request({
    url: baseURL + "/tenant/wallet/activate",
    method: "post",
    params,
  });

//修改企业钱包密码
export const putWalletPassword = (params, type) =>
  request({
    url: baseURL + "/tenant/wallet/password",
    method: "put",
    params,
  });
