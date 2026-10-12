export interface CascadeDictionaryItem {
  /**
   * 编号
   */
  code?: string;
  id?: number | string;
  /**
   * 字典项变量
   */
  itemCode?: string;
  /**
   * 名称
   */
  name?: string;
  nextList?: DictionaryTree[];
  /**
   * 数据权限（无法删除：NO_DELETE；NO_UPDATE：无法修改）
   */
  permissionState: string;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 变量
   */
  variable?: string;
  /**
   * 版本号
   */
  version?: string;
}

export interface DictionaryTree {
  /**
   * 编号
   */
  code?: string;
  id?: number | string;
  /**
   * 字典项变量
   */
  itemCode?: string;
  /**
   * 名称
   */
  name?: string;
  nextList?: Record<string, unknown>[];
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 变量
   */
  variable?: string;
  /**
   * 版本号
   */
  version?: string;
  flag?: boolean;
}

export interface SysDictionaryVO {
  /**
   * 编号
   */
  code?: string;
  id?: number;
  /**
   * 字典项变量
   */
  itemCode?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 变量
   */
  variable?: string;
  /**
   * 版本号
   */
  version?: string;
}
export interface AdminDictionaryByItem {
   /**
    * 编号
    */
   code?: null | string;
   id?: number | null;
   /**
    * 字典项变量
    */
   itemCode?: null | string;
   /**
    * 名称
    */
   name?: null | string;
   /**
    * 备注
    */
   remarks?: null | string;
   /**
    * 状态
    */
   status?: null | string;
   /**
    * 变量
    */
   variable?: null | string;
   /**
    * 版本号
    */
   version?: null | string;
}
