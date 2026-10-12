/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface FileVO {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  createTime: string;
  refCount: number;
  type: string;
  businessKey: string | null;
}

export interface KnowledgeDocumentStatisticsModel {
  total: number;
  statList: {
    key: string;
    value: number;
  }[];
}

export interface KnowledgeDocumentBatchModel {
  errorCount: number;
  successCount: number;
  errorList: string[];
}

export interface KnowledgeDocumentModel {
  id: string;
  name: string;
  status?: boolean | string | null;
  typeId: string;
  typeName: string;
  format: string;
  size: number;
  deptId: string;
  deptName: string;
  createBy: string;
  updateTime: string;
  fileList: FileVO[];
  productId: string;
  productName: string;
  /** 条目数 */
  entryCount?: number | null;
}

export interface KnowledgeDocumentTypeModel {
  id: string;
  name: string;
  description: string;
  parentId: string;
  level: number;
  typeName: string;
  /** 图标文件信息 */
  icon?: FileVO | null;
  /** 条目总数（父级目录包含子级） */
  entryCount?: number | null;
  /** 近30天新增条目数（父级目录包含子级目录知识库增量） */
  entryCount30d?: number;
  children?: KnowledgeDocumentTypeModel[] | null;
}
