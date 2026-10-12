// 数据为保留两位位小数的正数
export const isNum = async (rule, value) => {
  if (typeof value === "undefined" || !value || value.length === 0) {
    return Promise.reject("数据为保留两位小数的正数");
  }
  return /^[0-9]+\d*(\.\d{0,2})?$|^0?\.\d{0,2}$/.test(value)
    ? Promise.resolve()
    : Promise.reject(new Error("数据为保留两位小数的正数"));
};
// 正整数
export const isPinteger = async (rule, value, tips) => {
  if (typeof value === "undefined" || !value || value.length === 0) {
    return Promise.reject(tips);
  }
  return /^[1-9]\d*$/.test(value)
    ? Promise.resolve()
    : Promise.reject(new Error("数据为正整数"));
};
// 整数(包含0)
export const isInteger = async (rule, value, tips) => {
  if (typeof value === "undefined" || !value || value.length === 0) {
    return Promise.reject(tips ? tips : "请输入");
  }
  return /^[+]{0,1}(\d+)$/.test(value)
    ? Promise.resolve()
    : Promise.reject(new Error("数据为整数(包括0)"));
};

// 手机号
export const isPhoneNum = async (rule, value, tips) => {
  if (typeof value === "undefined" || !value || value.length === 0) {
    return Promise.reject(tips ? tips : "请输入");
  }
  return /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(value)
    ? Promise.resolve()
    : Promise.reject(new Error("请输入正确的手机号"));
};

// 身份证号
export const isIdCardNum = async (rule, value, tips) => {
  if (typeof value === "undefined" || !value || value.length === 0) {
    return Promise.reject(tips ? tips : "请输入");
  }
  return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
    value
  )
    ? Promise.resolve()
    : Promise.reject(new Error("请输入正确的身份证号"));
};

// 统一社会信用代码
export const isIdCreditCode = async (rule, value, tips) => {
  if (typeof value === "undefined" || !value || value.length === 0) {
    return Promise.reject(tips ? tips : "请输入");
  }
  return /^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{14})$/.test(
    value
  )
    ? Promise.resolve()
    : Promise.reject(new Error("请输入正确的统一社会信用代码"));
};

// 注册号
export const isRegisterCode = async (rule, value, tips) => {
  if (typeof value === "undefined" || !value || value.length === 0) {
    return Promise.reject(tips ? tips : "请输入");
  }
  return /^[A-Za-z0-9]\w{14}$/.test(value)
    ? Promise.resolve()
    : Promise.reject(new Error("请输入正确的注册号"));
};
