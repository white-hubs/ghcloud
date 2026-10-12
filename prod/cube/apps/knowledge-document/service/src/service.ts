import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import { PageResult } from "./types";
import { KnowledgeDocumentModel, KnowledgeDocumentTypeModel, KnowledgeDocumentStatisticsModel, KnowledgeDocumentBatchModel } from "./types";

const baseURL = `${BASE_API}/management`;

export class CubeKnowledgeDocumentService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 文档统计 */
  public async getKnowledgeDocumentStatistics(): Promise<KnowledgeDocumentStatisticsModel> {
    const url = `${baseURL}/knowledge/stat/type`;
    const res = await this.gateway.get<KnowledgeDocumentStatisticsModel>({ url });
    return res;
  }

  /** 文档列表 */
  public async getKnowledgeDocumentList(payload: {
    pageNumber: number;
    pageSize: number;
    name?: string | null;
    status?: boolean;
    typeId?: string | null;
    deptId?: string | null;
    productId?: string | null;
  }): Promise<PageResult<KnowledgeDocumentModel>> {
    const url = `${baseURL}/knowledge/page`;
    const res = await this.gateway.get<PageResult<KnowledgeDocumentModel>>({ url, payload });
    return res;
  }

  /** 文档状态开关 */
  public async switchKnowledgeDocumentStatus(payload: { id: string; status: boolean }): Promise<boolean> {
    const url = `${baseURL}/knowledge/status`;
    return this.gateway.update<boolean>({ url, payload });
  }

  /** 文档详情 */
  public async getKnowledgeDocumentDetails(payload: { id: string }): Promise<KnowledgeDocumentModel> {
    const url = `${baseURL}/knowledge/detail`;
    const res = await this.gateway.get<KnowledgeDocumentModel>({ url, payload });
    return res;
  }

  /** 新增文档 */
  public async addKnowledgeDocument(payload: {
    name: string;
    typeId: string;
    deptId: string | null;
    productId: string | null;
    entryCount?: number | null;
    fileIds: string[];
  }): Promise<unknown> {
    const url = `${baseURL}/knowledge/add`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 批量新增文档 */
  public async addKnowledgeDocumentBatch(
    payload: {
      name: string;
      typeId: string;
      deptId: string | null;
      productId: string | null;
      entryCount?: number | null;
      fileIds: string[];
    }[],
  ): Promise<KnowledgeDocumentBatchModel> {
    const url = `${baseURL}/knowledge/add/batch`;
    const resp = await this.gateway.create<KnowledgeDocumentBatchModel>({ url, payload });
    return resp;
  }

  /** 编辑文档 */
  public async editKnowledgeDocument(payload: {
    id: string;
    name: string;
    typeId: string;
    deptId: string | null;
    productId: string | null;
    entryCount?: number | null;
    fileIds: string[];
  }): Promise<unknown> {
    const url = `${baseURL}/knowledge/edit`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 批量删除知识文档 */
  public async deleteKnowledgeDocument(payload: { idList: string[] }): Promise<unknown> {
    const url = `${baseURL}/knowledge/removes`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 文档树形类型列表 */
  public async getKnowledgeTypeTreeList(payload?: { name: string | null }): Promise<KnowledgeDocumentTypeModel[]> {
    const url = `${baseURL}/knowledgeType/treeList`;
    const res = await this.gateway.get<KnowledgeDocumentTypeModel[]>({ url, payload });
    return res;
  }

  /** 添加文档类型 */
  public async addKnowledgeType(payload: {
    name: string;
    description: string | null;
    parentId: string | null;
    icon?: string | null;
  }): Promise<unknown> {
    const url = `${baseURL}/knowledgeType/add`;
    const res = await this.gateway.create<unknown>({ url, payload });
    return res;
  }

  /** 修改文档类型 */
  public async editKnowledgeType(payload: {
    id: string;
    name: string | null;
    description: string | null;
    parentId: string | null;
    icon?: string | null;
  }): Promise<unknown> {
    const url = `${baseURL}/knowledgeType/edit`;
    const res = await this.gateway.update<unknown>({ url, payload });
    return res;
  }

  /** 删除文档类型 */
  public async deleteKnowledgeType(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/knowledgeType/remove`;
    const res = await this.gateway.delete({ url, payload });
    return res;
  }
}
