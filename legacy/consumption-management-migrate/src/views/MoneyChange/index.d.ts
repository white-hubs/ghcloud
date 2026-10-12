declare namespace MoneyChange {
  interface QueryType {
    userCard: LocationQueryValue | LocationQueryValue[];
  }
  interface MoneyChangeData {
    transactionType: integer;
    // 交易类型 1, 消费 2 充值 3 补贴 4 补贴清零 5金额消费纠错 6 退款
    enterParam: string;
    // 姓名、工号、人工序号 、卡号（模糊匹配）
    period: string;
    pageNumber: numbner;
    pageSize: numbner;
    total: numbner;
  }
  interface MoneyChangeList {
    depName: string;
    // 交易场所
    transactionMoney: string;
    // 交易金额
    transactionTime: string;
    // 交易时间
    transactionType: integer;
    // 交易类型 1, 消费 2 充值 3 补贴 4 补贴清零 5金额消费纠错 6 退款
    devSerial;
    // string
    // 设备编号
    userSerial: integer;
    // 人员序号
    userNo: string;
    // 工号
    userName: string;
    // 姓名
    orderId: string;
    // 订单号
    transactionChannel: integer;
    // 充值渠道
    balance: string;
    // 交易后 账户余额 （单位/元）
    subsidyBeginDate: number;
    // 补贴开始时间
    subsidyEndDate: number;
    // 补贴截止时间
    transactionStatus: integer;
    // 交易状态;
  }
}
