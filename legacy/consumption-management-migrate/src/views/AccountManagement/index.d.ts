/**你某个页面的所有定义类型 */
declare namespace AccountManagement {
  /**
   * 获取数据
   */
  interface AccountManagementData {
    pageNumber: number | undefined;
    pageSize: number;
    total: number | undefined;
    accountName: string|undefined;
    enterParam: string | LocationQueryValue | LocationQueryValue[];
  }

  /**数据列表 */
  interface AccountManagementList {
    id: string;
    userCard: string;
    // 卡号
    userSerial: string;
    // 人员序号
    userNo: string;
    // 工号
    userName: string;
    // 姓名
    acName: string;
    // 账户类型
    acMoney: string;
    // 账户余额
    accountStatus: string;
  }
  /**
   * 数据详情AmountRecordType
   */
  interface AmountRecordType {
    transactionTime: number;
    // 交易时间
    transactionMoney: number;
    // 交易金额
    balance: number;
    // 交易后 账户余额 （单位/元）
    transactionType: integer;
    // 交易类型 1,51 消费 2 充值 4 补贴
    subsidyBeginDate: number;
    // 开始时间
    subsidyEndDate: number;

    // 截止时间
    depName: string;
    // 交易场所
    transactionChannel: integer;
    // 交易渠道
    transactionStatus: integer;
    // 交易状态
    orderId: string;
    // 订单号
  }
  /**
   * 数据详情CopiesRecordType
   */
  interface CopiesRecordType {
    transactionTime: number;
    // 交易时间
    transactionCount: number;
    // 交易份数
    transactionType: integer;
    // 交易类型 1,51 消费 2 充值 4 补贴
    depName: string;
    // 交易场所
    subsidyBeginDate: number;
    // 开始时间
    subsidyEndDate: number;
    // 截止时间
    transactionStatus: number;
    // 交易状态
  }
  /**
   * 详情数据
   */
  interface AccountManagementDetiles {
    userCard: string;
    // 卡号
    userSerial: integer;
    // 人员序号
    userName: string;
    // 姓名
    userNo: string;
    // 工号
    subsidyBalance: number;
    // 补贴余额 单位/分
    cashBalance: number;
    // 现金余额 单位/分
    accountBalance: number;
    // 账户余额 单位/分
    amountRecord: AmountRecordType[];
    // 金额模式消费明细
    copiesRecord: CopiesRecordType[];
    // 份模式消费明细
  }

  // 金额变更明细查询接口类
  interface MoneyChageData {
    pageNumber: number | undefined;
    pageSize: number;
    total: number | undefined;
    transaction_type: integer;

    // 交易类型 1, 消费 2 充值 3 补贴 4 补贴清零 5金额消费纠错 6 退款
    enterParam: string;

    // 姓名、工号、人工序号 、卡号（模糊匹配）
    subsidyBeginDate: string;
    subsidyEndDate: string;
  }
}
