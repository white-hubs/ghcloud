// 岗位
export interface Position {
  /**
   * 是否启用
   */
  enabled: boolean;
  /**
   * 主键
   */
  id: string;
  /**
   * 岗位名称
   */
  name: string;
  /**
   * 岗位备注
   */
  remark: string;
}

// 部门
export interface Dept {
  enabled?: string;
  id: string;
  name: string;
  remark?: string;
  sequence?: string;
}
