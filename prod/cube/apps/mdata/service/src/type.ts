export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export interface PaginationOperationLogVO {
  /**
   * 总页数
   */
  pages?: number;
  /**
   * 当页数据列表
   */
  records?: OperationLogVO[];
  /**
   * 总数量
   */
  total?: number;
}

export interface OperationLogVO {
  id?: number;
  /**
   * 请求方式
   */
  method?: string;
  /**
   * 请求参数
   */
  parameters?: string;
  /**
   * 请求结果
   */
  result?: string;
  /**
   * 请求状态码
   */
  statusCode?: string;
  /**
   * 请求地址
   */
  url?: string;
  /**
   * 请求用户id
   */
  userId?: number;
  /**
   * 请求用户名称
   */
  userName?: string;
}

/**
 * 区域特征表
 */
export interface AreaFeature {
  createBy?: string;
  createTime?: string;
  deleted?: boolean;
  describe?: string;
  id?: number;
  name: string;
  tenant?: number;
  updateBy?: string;
  updateTime?: string;
}
export interface AreaTag {
  /**
   * 描述，描述
   */
  describe?: string;
  /**
   * 图片id
   */
  icoFileId?: string;
  fileVO?: unknown;
  id?: number;
  /**
   * 描述，名称
   */
  name: string;
}
export interface AreaStatus {
  createBy?: string;
  createTime?: string;
  deleted?: boolean;
  describe?: string;
  id?: number;
  name: string;
  tenant?: number;
  updateBy?: string;
  updateTime?: string;
}

export interface AreaListVO {
  /**
   * 区域别名
   */
  aliasName?: null | string;
  /**
   * 区域扩展信息
   */
  areaExtend?: AreaExtendVO;
  /**
   * 占地面积
   */
  builtUpArea?: number | null;
  children?: AreaListVO[] | null;
  /**
   * 区域编码
   */
  code?: null | string;
  /**
   * 特征
   */
  featureName?: string;
  featureIds?: string;
  id?: number | null;
  level?: number | null;
  /**
   * 区域名称
   */
  name?: null | string;
  parentId?: number | null;
  /**
   * 序列号
   */
  sequence?: null | string;
  /**
   * 状态
   */
  statusName?: string;
  statusId?: string;
  /**
   * 标签
   */
  tagName?: string;
  tagIds?: string;
  drag?: boolean;
}

/**
 * 区域扩展信息
 *
 * AreaExtendVO
 */
export interface AreaExtendVO {
  /**
   * 区域主键
   */
  id?: number | null;
  /**
   * 区域介绍
   */
  introduce?: null | string;
  /**
   * 图片附件集合
   */
  pictureFiles?: FileVO[] | null;
  /**
   * 视频附件集合
   */
  videoFiles?: FileVO[] | null;
}

/**
 * com.guhecloud.cube.base.file.client.vo.FileVO
 *
 * FileVO
 */
export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number;
  createTime?: string;
  endpointPath?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 文件名
   */
  name?: string;
  /**
   * URL地址
   */
  path?: string;
  /**
   * 关联数量
   */
  refCount?: number;
  /**
   * 文件大小
   */
  size?: number;
  /**
   * 文件名后缀
   */
  suffix?: string;
  /**
   * 文件类型
   */
  type?: string;
}

/**
 * 可视化区域类型
 */
export enum VisualizationAreaType {
  Building = "BUILDING",
  Floor = "FLOOR",
  Other = "OTHER",
}
export interface ListVO {
  id?: null | string;
  name?: null | string;
  key?: null | string;
  value?: null | string;
}

export interface GridLeaderArea {
  id: string;
  name: string;
  level: number;
  parentId: string;
  children: GridLeaderArea[];
}
