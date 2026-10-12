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
export interface ImportType {
  fail: number;
  errorMsg: string[];
  success: number;
}
