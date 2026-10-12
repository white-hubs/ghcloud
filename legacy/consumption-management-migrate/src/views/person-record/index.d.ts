declare namespace PartChange {
  interface QueryType {
    userCard: LocationQueryValue | LocationQueryValue[];
  }
  interface PartChangeData {
    transactionType: integer;
    // 交易类型 1, 消费 2 充值 3 补贴 4 补贴清零 5金额消费纠错 6 退款
    enterParam: string;
    period: string;
    pageNumber: numbner;
    pageSize: numbner;
    total: numbner;
  }
  interface PartChangeList {
    depName: string;
    // 交易场所
    transaction_count: integer;
    // 交易份数（数量）
    transactionTime: string;
    // 交易时间
    userSerial: integer;
    // 人员序号
    userNo: string;
    // 工号
    userName: string;
    // 姓名
    transactionType: integer;
    // 交易类型 7,份消费 8份补贴 9份清零
    subsidyBeginDate: number;
    // 补贴有效日期
    subsidyEndDate: number;
    // 补贴截止日期
    transactionStatus: integer;
    // 交易状态
    userCard: string;
    // 卡号
  }
}
