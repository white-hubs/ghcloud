export interface TenantType {
  address: string;
  areaCovered: number;
  building: number;
  code: string;
  files: {
    id: string;
    /**
     * 文件名称
     */
    name: string;
    /**
     * 文件路径
     */
    path: string;
    /**
     * 文件大小
     */
    size: string;
    /**
     * 文件后缀
     */
    suffix: string;
  }[];
  id: string;
  location: string;
  logo: {
    id: string;
    name: string;
    path: string;
    size: string;
    suffix: string;
  };
  name: string;
  remark: string;
}
