/**
* AssemblyNoticeObjDTO
*/
export interface AssemblyNoticeObjDTO {
  /**
   * 通知对象id
   */
  objId: string;
  /**
   * 通知对象类型
   */
  objType: string;
  objInfo:string
}

/**
* AssemblyNoticeWayDTO
*/
export interface AssemblyNoticeWayDTO {
  /**
   * 通知方式
   */
  noticeWay: string;
  /**
   * 模板id
   */
  templateId?: number;
}
export interface SceneConfigDTO {
  label: string;
  /**
   * 通知对象
   */
  noticeObjs: AssemblyNoticeObjDTO[];
  /**
   * 通知方式
   */
  noticeWays: AssemblyNoticeWayDTO[];
  /**
   * 消息场景编号
   */
  sceneCode: string;
  /**
   * 通知时间
   */
  value: number;
}