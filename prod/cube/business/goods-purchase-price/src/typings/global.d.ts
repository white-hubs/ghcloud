/**
 * 后端返回文件接口类型
 */
declare interface ReturnFileType {
  id: string;
  name: string;
  path: string;
  type?: string;
  size?: number;
  accessPrefix?: string;
  businessKey?: string | null;
}
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}

export interface UploadRes {
  accessPrefix: string;
  businessKey: null | string;
  id: string;
  name: string;
  path: string;
  refCount: 0;
  size: 687;
  suffix: string;
  tag: string;
  type: string;
}
export interface AssemblyNoticeObjDTO {
  /**
   * 通知对象id
   */
  objId?: null | string | undefined;
  /**
   * 通知对象信息
   */
  objInfo?: null | string | undefined;
  /**
   * 通知对象类型
   */
  objType?: null | string | undefined;
}

export interface SceneConfigDTO {
  label: string;
  /**
   * 通知对象
   */
  noticeObjs?: AssemblyNoticeObjDTO[] | null;
  /**
   * 通知方式
   */
  noticeWays?: AssemblyNoticeWayDTO[] | null;
  /**
   * 消息场景编号
   */
  sceneCode: string;
  /**
   * 通知时间
   */
  value: number;
}

export interface AssemblyNoticeWayDTO {
  /**
   * 通知方式
   */
  noticeWay: null | string;
  /**
   * 模板id
   */
  templateId: number | null;
}
