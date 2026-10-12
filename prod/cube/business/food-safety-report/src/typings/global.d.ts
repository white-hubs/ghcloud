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
