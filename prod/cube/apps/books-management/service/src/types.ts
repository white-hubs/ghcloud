/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface WorkRecordPageVO {
  /**
   * 图书类型
   */
  bookType?: string;
  id?: number;
  /**
   * 操作员
   */
  name?: string;
  /**
   * 编目数量
   */
  tidyNumber?: number;
  /**
   * 编目时间
   */
  tidyTime?: number;
  /**
   * 修改次数
   */
  updateNumber?: number;
  /**
   * 工作时间
   */
  workHour?: number;
}

export interface BorrowRecordPageVO {
  /**
   * 图书作者
   */
  bookAuthor?: string;
  /**
   * 书名
   */
  bookName?: string;
  /**
   * 借阅证号
   */
  borrowCardNumber?: string;
  /**
   * 借书时间
   */
  borrowTime?: number;
  id?: number;
  /**
   * ISBN号
   */
  isbnNumber?: string;
  /**
   * 图书出版社
   */
  publishingHouse?: string;
  /**
   * 应还时间
   */
  shouldReturnTime?: number;
  /**
   * 借阅状态(0未归还,1已归还,2已预期
   */
  status?: number;
}

export interface TidyUpStatisticsPageVO {
  /**
   * 图书类型
   */
  bookType?: number;
  /**
   * 分图法类型
   */
  contentType?: string;
  id?: number;
  /**
   * 语种
   */
  languages?: string;
  /**
   * 操作员
   */
  operator?: string;
  /**
   * 状态
   */
  status?: number;
  /**
   * 批次
   */
  tidyBatch?: string;
  tidyNumber?: number;
  /**
   * 修改次数
   */
  updateNumber?: number;
  /**
   * 馆藏地
   */
  venues?: string;
}
