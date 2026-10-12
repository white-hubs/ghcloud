import type { AgentContentInput } from "@cube-ai/agent-sdk-console";

import type { CubeAuth } from "@ghcloud/cube-gateway";

import { createCubeAiClients, type CubeAiClients } from "./transport/gateway-fetch";
import type {
  EndpointTypeItem,
  FlowComponentCatalogItem,
  FlowDebugPayload,
  FlowDebugResult,
  FlowDetailItem,
  FlowExportItem,
  FlowFileUploadResult,
  FlowImportPayload,
  FlowMonitorBuildsResult,
  FlowMonitorQueryParams,
  FlowMonitorTracesResult,
  FlowPublishPayload,
  FlowPublishResult,
  FlowRunPayload,
  FlowRunResult,
  FlowResourceReferenceItem,
  FlowSavePayload,
  FlowListPageResult,
  FlowSummaryItem,
  FlowValidateResult,
  KnowledgeChunkingPayload,
  KnowledgeDocumentSegmentItem,
  KnowledgeDocumentSegmentListResult,
  KnowledgeDocumentSegmentPreviewResult,
  KnowledgeDocumentSegmentResult,
  KnowledgeDocumentSegmentUpdatePayload,
  KnowledgeRetrievalTestPayload,
  KnowledgeRetrievalTestResult,
  KnowledgeSearchPayload,
  KnowledgeSearchResult,
  ModelDetectionResult,
  ModelGroupItem,
  ModelItem,
  ModelUpsertPayload,
  ProviderCreatePayload,
  ProviderItem,
  ProviderSettingsPayload,
  ProviderTypeItem,
  ProviderUpdatePayload,
  RemoteModelCandidate,
  TenantAgentContentInput,
  TenantAgentView,
} from "./types";

export class CubeAiApplicationService {
  private readonly clients: CubeAiClients;

  public constructor(auth: CubeAuth, deps?: { clients?: CubeAiClients; baseUrl?: string }) {
    this.clients = deps?.clients ?? createCubeAiClients(auth, { baseUrl: deps?.baseUrl });
  }

  public async listProviderTypes(): Promise<ProviderTypeItem[]> {
    return this.clients.llm.listProviderTypes() as Promise<ProviderTypeItem[]>;
  }

  public async listEndpointTypes(): Promise<EndpointTypeItem[]> {
    return this.clients.llm.listEndpointTypes() as Promise<EndpointTypeItem[]>;
  }

  /**
   * 流程画布模型下拉：聚合已有 `GET …/providers` + `GET …/providers/:id/models`（数据来源仍为 `ai_application_tenant_llm_model`），
   * 不单独请求 `/tenant-models`，避免网关未转发该路径时出现 404。
   * 仅聚合 **已启用** 的供应商（`enabled !== false`；缺省字段视为启用），未启用的 catalog 不参与模型列表。
   * 数据来源已切换到 llm-sdk-console（经 WS-T 传输基座），内部调用 this.listProviders() / this.listModelGroups()。
   */
  public async listTenantModels(): Promise<ModelItem[]> {
    const providers = (await this.listProviders()).filter((p) => p.enabled !== false);
    const groupsLists = await Promise.all(providers.map((provider) => this.listModelGroups(provider.id)));
    const models: ModelItem[] = [];
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const groups = groupsLists[i];
      for (const group of groups) {
        for (const item of group.items) {
          models.push({
            ...item,
            providerName: provider.name,
          });
        }
      }
    }
    models.sort((a, b) => {
      const byProvider = (a.providerName ?? "").localeCompare(b.providerName ?? "");
      if (byProvider !== 0) {
        return byProvider;
      }
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.modelCode.localeCompare(b.modelCode);
    });
    return models;
  }

  public async listProviders(): Promise<ProviderItem[]> {
    return this.clients.llm.listProviders() as unknown as ProviderItem[];
  }

  public async getProvider(providerId: string): Promise<ProviderItem> {
    // llm.getProvider() 仅做 TypeScript cast，运行时透传后端全量字段，可安全映射到 ProviderItem。
    return this.clients.llm.getProvider(providerId) as unknown as ProviderItem;
  }

  public async createProvider(payload: ProviderCreatePayload): Promise<ProviderItem> {
    return this.clients.llm.createProvider(payload) as unknown as ProviderItem;
  }

  public async updateProvider(providerId: string, payload: ProviderUpdatePayload): Promise<ProviderItem> {
    return this.clients.llm.updateProvider(providerId, payload) as unknown as ProviderItem;
  }

  public async updateProviderSettings(providerId: string, payload: ProviderSettingsPayload): Promise<ProviderItem> {
    return this.clients.llm.updateProviderSettings(providerId, payload) as unknown as ProviderItem;
  }

  public async testProviderConnection(providerId: string): Promise<void> {
    await this.clients.llm.testProviderConnection(providerId);
  }

  public async testModelConnection(providerId: string, modelId: string): Promise<ModelDetectionResult> {
    // 名称差异：facade testModelConnection → SDK testModel
    return this.clients.llm.testModel(providerId, modelId) as unknown as ModelDetectionResult;
  }

  public async deleteProvider(providerId: string): Promise<void> {
    return this.clients.llm.deleteProvider(providerId);
  }

  public async listModelGroups(providerId: string): Promise<ModelGroupItem[]> {
    // 名称差异：facade listModelGroups → SDK listModels；后端返回 ModelGroupItem[] 形状，直接 cast。
    return this.clients.llm.listModels(providerId) as unknown as ModelGroupItem[];
  }

  public async createModel(providerId: string, payload: ModelUpsertPayload): Promise<ModelItem> {
    return this.clients.llm.createModel(providerId, payload) as unknown as ModelItem;
  }

  public async updateModel(providerId: string, modelId: string, payload: ModelUpsertPayload): Promise<ModelItem> {
    return this.clients.llm.updateModel(providerId, modelId, payload) as unknown as ModelItem;
  }

  public async deleteModel(providerId: string, modelId: string): Promise<void> {
    return this.clients.llm.deleteModel(providerId, modelId);
  }

  public async fetchRemoteModels(providerId: string): Promise<{ synced: number }> {
    // 名称差异：facade fetchRemoteModels → SDK fetchRemote
    return this.clients.llm.fetchRemote(providerId) as unknown as { synced: number };
  }

  public async previewRemoteModels(providerId: string): Promise<RemoteModelCandidate[]> {
    // 名称差异：facade previewRemoteModels → SDK fetchRemotePreview
    return this.clients.llm.fetchRemotePreview(providerId) as unknown as RemoteModelCandidate[];
  }

  public async importRemoteModels(providerId: string, modelCodes: string[], endpointType?: string | null): Promise<{ imported: number }> {
    // 名称差异：facade importRemoteModels → SDK importRemote；body 结构从参数列表转为对象
    return this.clients.llm.importRemote(providerId, { modelCodes, endpointType }) as unknown as { imported: number };
  }

  public async segmentKnowledgeDocument(bizDocumentId: string, payload: KnowledgeChunkingPayload): Promise<KnowledgeDocumentSegmentResult> {
    // kbConsole.reindexDocument → POST /kb/console/documents/:id/reindex
    // KnowledgeChunkingPayload 字段(separator/chunkSize/chunkOverlap/tableChunkMode/textChunkMode)
    // 与 kb-core reindex body 字段名一致，直接透传。
    // chunks=[] 因 reindex 为异步任务，分段在 job 完成后才写入，本次调用不返回分段列表。
    const raw = (await this.clients.kbConsole.reindexDocument(bizDocumentId, payload as Record<string, unknown>)) as unknown as {
      documentId: string;
      importJobId: string | null;
      status: string | null;
      supportedForParsing: boolean | null;
    };
    return {
      documentId: raw.documentId,
      importJobId: raw.importJobId ?? null,
      status: raw.status ?? null,
      supportedForParsing: raw.supportedForParsing ?? null,
      chunks: [],
    };
  }

  public async listKnowledgeDocumentSegments(bizDocumentId: string): Promise<KnowledgeDocumentSegmentListResult> {
    // kbConsole.getDocumentChunks → GET /kb/console/documents/:id/chunks
    // kb-core 返回 { items: ChunkItem[] }；segment=chunk 1:1，bizDocumentId=documentId 恒等映射。
    const raw = (await this.clients.kbConsole.getDocumentChunks(bizDocumentId)) as unknown as { items: KnowledgeDocumentSegmentItem[] };
    return {
      documentId: bizDocumentId,
      chunks: raw.items ?? [],
    };
  }

  public async previewKnowledgeDocumentSegments(
    bizDocumentId: string,
    payload: KnowledgeChunkingPayload,
  ): Promise<KnowledgeDocumentSegmentPreviewResult> {
    // kbConsole.previewDocumentById → POST /kb/console/documents/:id/preview（无 body）
    // 读取已入库分段快照，不接受 chunking 配置。
    // 决策记录：payload 不透传——previewDocumentById 读 DB 存量分段，若需用新配置预览
    // 须走文件上传 POST /documents/preview 端点（multipart），本 façade 暂不覆盖。
    void payload;
    const raw = (await this.clients.kbConsole.previewDocumentById(bizDocumentId)) as unknown as {
      chunkCount: number | null;
      items: unknown[];
    };
    return {
      documentId: bizDocumentId,
      chunkCount: raw.chunkCount ?? null,
      items: (raw.items ?? []) as KnowledgeDocumentSegmentPreviewResult["items"],
    };
  }

  public async updateKnowledgeDocumentSegment(
    bizDocumentId: string,
    segmentId: string,
    payload: KnowledgeDocumentSegmentUpdatePayload,
  ): Promise<KnowledgeDocumentSegmentItem> {
    // kbConsole.updateDocumentChunk → PUT /kb/console/documents/:documentId/chunks/:chunkId
    // KnowledgeDocumentSegmentUpdatePayload(text/keywordsAdd/keywordsRemove)与 kb-core 字段名一致，直透传。
    return this.clients.kbConsole.updateDocumentChunk(
      bizDocumentId,
      segmentId,
      payload as Record<string, unknown>,
    ) as unknown as KnowledgeDocumentSegmentItem;
  }

  public async testKnowledgeDocumentRetrieval(
    bizDocumentId: string,
    payload: KnowledgeRetrievalTestPayload,
  ): Promise<KnowledgeRetrievalTestResult> {
    // kb.searchByDocuments → POST /kb/search/by-documents
    // SDK 已对齐 kb-core 真实返回格式 { items: KbSearchItem[] }（chunk 级别）。
    // 字段映射：text/score/headingPath 直接透传；documentId 来自入参 bizDocumentId。
    const result = await this.clients.kb.searchByDocuments({
      query: payload.query ?? "",
      documents: [
        {
          documentId: bizDocumentId,
          ...(payload.topK != null ? { topK: payload.topK } : {}),
        },
      ],
    });
    return {
      documentId: bizDocumentId,
      items: result.items.map((item) => ({
        documentId: bizDocumentId,
        text: item.text ?? null,
        score: item.score ?? null,
        headingPath: item.headingPath ?? null,
      })),
    };
  }

  /** 安全智库全局语义检索：kb.search → POST /kb/search */
  public async searchKnowledge(payload: KnowledgeSearchPayload): Promise<KnowledgeSearchResult> {
    const query = payload.query?.trim() ?? "";
    const result = await this.clients.kb.search({
      query,
      ...(payload.topK != null ? { topK: payload.topK } : {}),
      ...(payload.similarityThreshold != null ? { similarityThreshold: payload.similarityThreshold } : {}),
    });
    return {
      items: (Array.isArray(result.items) ? result.items : []).map((item) => ({
        text: item.text ?? null,
        score: item.score ?? null,
        headingPath: item.headingPath ?? null,
        keywords: item.keywords ?? null,
        chunkId: item.chunkId ?? null,
        chunkIndex: item.chunkIndex ?? null,
        documentId: item.documentId ?? null,
        sectionId: item.sectionId ?? null,
      })),
    };
  }

  public async listFlowComponents(): Promise<FlowComponentCatalogItem[]> {
    return this.clients.flow.listFlowComponents() as unknown as FlowComponentCatalogItem[];
  }

  public async listFlows(): Promise<FlowSummaryItem[]> {
    return this.clients.flow.listFlows() as unknown as FlowSummaryItem[];
  }

  public async listFlowsPage(params: { pageNumber: number; pageSize: number; keyword?: string }): Promise<FlowListPageResult> {
    const kw = typeof params.keyword === "string" ? params.keyword.trim() : "";
    return this.clients.flow.listFlowsPage({
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      ...(kw ? { keyword: kw } : {}),
    }) as unknown as FlowListPageResult;
  }

  public async createFlow(payload: FlowSavePayload): Promise<FlowDetailItem> {
    return this.clients.flow.createFlow(payload) as unknown as FlowDetailItem;
  }

  public async getFlow(flowId: string): Promise<FlowDetailItem> {
    return this.clients.flow.getFlow(flowId) as unknown as FlowDetailItem;
  }

  public async exportFlow(flowId: string): Promise<FlowExportItem> {
    return this.clients.flow.exportFlow(flowId) as unknown as FlowExportItem;
  }

  public async saveFlow(flowId: string, payload: FlowSavePayload): Promise<FlowDetailItem> {
    return this.clients.flow.saveFlow(flowId, payload) as unknown as FlowDetailItem;
  }

  public async importFlow(flowId: string, payload: FlowImportPayload): Promise<FlowDetailItem> {
    return this.clients.flow.importFlow(flowId, payload) as unknown as FlowDetailItem;
  }

  public async deleteFlow(flowId: string): Promise<void> {
    return this.clients.flow.deleteFlow(flowId);
  }

  public async validateFlow(flowId: string): Promise<FlowValidateResult> {
    return this.clients.flow.validateFlow(flowId) as unknown as FlowValidateResult;
  }

  public async debugFlow(flowId: string, payload: FlowDebugPayload, options?: { signal?: AbortSignal }): Promise<FlowDebugResult> {
    // SDK debugFlow is JSON-based and does not support AbortSignal natively.
    // Promise.race honours the caller's signal; the underlying HTTP request continues
    // to completion in the background after abort (caller is responsible for cleanup).
    // FlowExecutionInput lacks index signature required by FlowDebugBody — safe at runtime
    const sdkPromise = this.clients.flow.debugFlow(flowId, payload as never);
    if (options?.signal == null) {
      return sdkPromise as unknown as FlowDebugResult;
    }
    return Promise.race([
      sdkPromise,
      new Promise<never>((_, reject) => {
        if (options.signal!.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
        } else {
          options.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
        }
      }),
    ]) as unknown as FlowDebugResult;
  }

  public async uploadFlowFile(flowId: string, file: File): Promise<FlowFileUploadResult> {
    // SDK uploadFlowFile appends under field name 'file' — matches backend expectation.
    return this.clients.flow.uploadFlowFile(flowId, file) as unknown as FlowFileUploadResult;
  }

  public async runFlow(flowId: string, payload: FlowRunPayload): Promise<FlowRunResult> {
    // FlowExecutionInput lacks index signature required by FlowRunBody — safe at runtime
    return this.clients.flow.runFlow(flowId, payload as never) as unknown as FlowRunResult;
  }

  public async getFlowMonitorTraces(flowId: string, params: FlowMonitorQueryParams = {}): Promise<FlowMonitorTracesResult> {
    const { page, size } = params;
    return this.clients.flowConsole.getFlowMonitorTraces(flowId, { page, size }) as unknown as FlowMonitorTracesResult;
  }

  public async getFlowMonitorBuilds(flowId: string, params: FlowMonitorQueryParams = {}): Promise<FlowMonitorBuildsResult> {
    const { page, size } = params;
    return this.clients.flowConsole.getFlowMonitorBuilds(flowId, { page, size }) as unknown as FlowMonitorBuildsResult;
  }

  public async publishFlow(flowId: string, payload: FlowPublishPayload): Promise<FlowPublishResult> {
    return this.clients.flowConsole.publishFlow(flowId, payload) as unknown as FlowPublishResult;
  }

  public async listFlowReferences(flowId: string): Promise<FlowResourceReferenceItem[]> {
    return this.clients.flowConsole.listFlowReferences(flowId) as unknown as FlowResourceReferenceItem[];
  }

  public async listFlowsByResource(resourceType: string, resourceId: string): Promise<FlowSummaryItem[]> {
    return this.clients.flowConsole.listFlowsByResource(resourceType, resourceId) as unknown as FlowSummaryItem[];
  }

  public async listAgents(): Promise<TenantAgentView[]> {
    return this.clients.agentConsole.listAgents() as unknown as TenantAgentView[];
  }

  public async getAgent(agentId: string): Promise<TenantAgentView> {
    return this.clients.agentConsole.getAgent(agentId) as unknown as TenantAgentView;
  }

  public async createAgent(name: string, content: TenantAgentContentInput): Promise<TenantAgentView> {
    return this.clients.agentConsole.createAgent({ name, content } as AgentContentInput) as unknown as TenantAgentView;
  }

  public async updateAgent(agentId: string, content: TenantAgentContentInput): Promise<TenantAgentView> {
    return this.clients.agentConsole.updateAgent(agentId, content as AgentContentInput) as unknown as TenantAgentView;
  }

  public async deleteAgent(agentId: string): Promise<void> {
    await this.clients.agentConsole.deleteAgent(agentId);
  }

  public async publishAgent(agentId: string): Promise<TenantAgentView> {
    return this.clients.agentConsole.publishAgent(agentId) as unknown as TenantAgentView;
  }
}
