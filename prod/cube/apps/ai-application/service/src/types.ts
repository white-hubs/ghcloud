export interface ProviderTypeItem {
  code: string;
  displayName: string;
  description: string | null;
}

export interface EndpointTypeItem {
  code: string;
  displayName: string;
  description: string | null;
}

export type LlmSchemaFieldType = "string" | "boolean" | "integer" | "number" | "enum";

export interface LlmSchemaFieldOption {
  label: string;
  value: string;
}

export interface LlmSchemaField {
  key: string;
  label?: string;
  type: LlmSchemaFieldType;
  required?: boolean;
  description?: string;
  defaultValue?: string | number | boolean | null;
  options?: LlmSchemaFieldOption[];
  feature?: string;
  wirePath?: string;
  wireTransform?: string;
}

export interface LlmRequestSchema {
  requestShape: string;
  endpointPath?: string;
  method?: "GET" | "POST";
  modelField?: string;
  inputContainer?: string;
  parameterContainer?: string;
  inputMapping?: Record<string, string>;
  fields?: LlmSchemaField[];
  extraBodyFields?: LlmSchemaField[];
}

export interface LlmResponsePollingSchema {
  enabled: boolean;
  taskIdPath?: string;
  taskStatusPath?: string;
  queryPathTemplate?: string;
  terminalStatuses?: string[];
}

export interface LlmResponseSchema {
  responseShape: string;
  polling?: LlmResponsePollingSchema;
  resultMapping?: Record<string, string>;
  errorMapping?: Record<string, string>;
}

export type LlmDslNodeKind = "language_model" | "image_generation";

export interface LlmDslField {
  key: string;
  label?: string;
  type: LlmSchemaFieldType;
  required?: boolean;
  description?: string;
}

export interface LlmDslSchema {
  nodeKind: LlmDslNodeKind;
  interactionMode?: "sync" | "async";
  primaryInput?: string;
  inputs?: LlmDslField[];
  parameters?: LlmDslField[];
  outputs?: LlmDslField[];
}

export interface ProviderItem {
  id: string;
  tenant: number;
  systemProviderId: string | null;
  providerCode: string;
  typeCode: string;
  name: string;
  iconUrl: string | null;
  /** 后端返回脱敏值；真实 API Key 只允许通过设置接口写入，不再回传前端。 */
  apiKey: string | null;
  apiBaseUrl: string | null;
  enabled: boolean;
  isCustom: boolean;
  remark: string | null;
}

export interface ProviderSettingsPayload extends Record<string, unknown> {
  /** 省略表示保留原值，传 null 表示清空。 */
  apiKey?: string | null;
  apiBaseUrl?: string | null;
  enabled?: boolean;
}

export interface ProviderCreatePayload extends ProviderSettingsPayload {
  providerCode: string;
  typeCode: string;
  name: string;
  iconUrl?: string | null;
  iconFileId?: string | null;
  remark?: string | null;
}

export interface ProviderUpdatePayload extends Record<string, unknown> {
  typeCode?: string | null;
  name?: string | null;
  iconUrl?: string | null;
  iconFileId?: string | null;
  enabled?: boolean;
  remark?: string | null;
}

export interface ModelItem {
  id: string;
  providerId: string;
  /** 租户 LLM 供应商名称；`listTenantModels()` 在 SDK 内聚合 providers + model groups 时填充 */
  providerName?: string;
  modelCode: string;
  displayName: string;
  groupName: string;
  sortOrder: number;
  remark: string | null;
  iconUrl: string | null;
  apiBaseUrl: string | null;
  requestSchema: LlmRequestSchema | null;
  responseSchema: LlmResponseSchema | null;
  dslSchema: LlmDslSchema | null;
  systemModelId: string | null;
  endpointType: string | null;
  modelTypes: string[];
  isFree: boolean;
  supportsTest: boolean;
}

export interface ModelGroupItem {
  groupName: string;
  items: ModelItem[];
}

export interface ModelUpsertPayload extends Record<string, unknown> {
  modelCode: string;
  displayName: string;
  groupName?: string | null;
  sortOrder?: number;
  remark?: string | null;
  iconUrl?: string | null;
  apiBaseUrl?: string | null;
  requestSchema?: LlmRequestSchema | null;
  responseSchema?: LlmResponseSchema | null;
  dslSchema?: LlmDslSchema | null;
  endpointType?: string | null;
  modelTypes?: string[];
  isFree?: boolean;
}

export interface ModelDetectionResult {
  ok: boolean;
  message: string;
  modelId: string;
  modelCode: string;
  supportsTest: boolean;
}

export interface RemoteModelCandidate {
  modelCode: string;
  displayName: string;
  groupName: string;
  iconUrl: string;
  apiBaseUrl: string | null;
  requestSchema: LlmRequestSchema | null;
  responseSchema: LlmResponseSchema | null;
  dslSchema: LlmDslSchema | null;
  endpointType: string | null;
  modelTypes: string[];
  isFree: boolean;
  supportsTest: boolean;
  matchedBy: "system-model" | "rule" | "fallback";
  systemModelId: string | null;
  alreadyAdded: boolean;
}

export interface KnowledgeChunkingPayload extends Record<string, unknown> {
  separator?: string | null;
  chunkSize?: number | null;
  chunkOverlap?: number | null;
  tableChunkMode?: string | null;
  textChunkMode?: string | null;
}

export interface KnowledgeDocumentSegmentItem {
  chunkId?: string | null;
  chunk_id?: string | null;
  chunkIndex?: number | null;
  chunk_index?: number | null;
  text?: string | null;
  charCount?: number | null;
  char_count?: number | null;
  recallCount?: number | null;
  recall_count?: number | null;
  embeddingText?: string | null;
  embedding_text?: string | null;
  headingPath?: string[] | null;
  heading_path?: string[] | null;
  sectionId?: string | null;
  section_id?: string | null;
  pageNo?: number | null;
  page_no?: number | null;
  chunkType?: string | null;
  chunk_type?: string | null;
  keywords?: string[] | null;
}

export interface KnowledgeDocumentSegmentPreviewItem {
  chunkId?: string | null;
  chunk_id?: string | null;
  chunkIndex?: number | null;
  chunk_index?: number | null;
  text?: string | null;
  headingPath?: string[] | null;
  heading_path?: string[] | null;
  sectionId?: string | null;
  section_id?: string | null;
  pageNo?: number | null;
  page_no?: number | null;
  chunkType?: string | null;
  chunk_type?: string | null;
  orderInSection?: number | null;
  order_in_section?: number | null;
  charCount?: number | null;
  char_count?: number | null;
  recallCount?: number | null;
  recall_count?: number | null;
}

export interface KnowledgeDocumentSegmentResult {
  documentId: string;
  importJobId: string | null;
  status: string | null;
  supportedForParsing: boolean | null;
  chunks: KnowledgeDocumentSegmentItem[];
}

export interface KnowledgeDocumentSegmentListResult {
  documentId: string;
  chunks: KnowledgeDocumentSegmentItem[];
}

export interface KnowledgeDocumentSegmentPreviewResult {
  documentId: string | null;
  chunkCount: number | null;
  items: KnowledgeDocumentSegmentPreviewItem[];
}

export interface KnowledgeDocumentSegmentUpdatePayload extends Record<string, unknown> {
  text?: string | null;
  keywordsAdd?: string[] | null;
  keywordsRemove?: string[] | null;
}

export interface KnowledgeRetrievalTestPayload extends Record<string, unknown> {
  query?: string | null;
  topK?: number | null;
}

export interface KnowledgeRetrievalHitItem {
  chunkId?: string | null;
  chunk_id?: string | null;
  documentId?: string | null;
  document_id?: string | null;
  chunkIndex?: number | null;
  chunk_index?: number | null;
  text?: string | null;
  fileName?: string | null;
  file_name?: string | null;
  sourceType?: string | null;
  source_type?: string | null;
  score?: number | null;
  vectorScore?: number | null;
  vector_score?: number | null;
  rankScore?: number | null;
  rank_score?: number | null;
  headingPath?: string[] | null;
  heading_path?: string[] | null;
}

export interface KnowledgeRetrievalTestResult {
  documentId: string;
  items: KnowledgeRetrievalHitItem[];
}

/** 安全智库全局语义检索入参（AI Center POST /kb/search） */
export interface KnowledgeSearchPayload {
  query: string;
  topK?: number;
  similarityThreshold?: number;
}

/** 安全智库全局语义检索命中项 */
export interface KnowledgeSearchHitItem {
  text?: string | null;
  score?: number | null;
  headingPath?: string[] | null;
  keywords?: string[] | null;
  chunkId?: string | null;
  chunkIndex?: number | null;
  documentId?: string | null;
  sectionId?: string | null;
}

export interface KnowledgeSearchResult {
  items: KnowledgeSearchHitItem[];
}

export interface FlowEditorNode {
  id: string;
  componentKey: string;
  label?: string | null;
  position?: {
    x?: number;
    y?: number;
  } | null;
  data?: Record<string, unknown> | null;
}

export interface FlowEditorEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string | null;
  targetPort?: string | null;
  data?: Record<string, unknown> | null;
}

export interface FlowEditorGraph {
  schemaVersion?: string;
  nodes: FlowEditorNode[];
  edges: FlowEditorEdge[];
  metadata?: Record<string, unknown> | null;
}

export interface FlowComponentCatalogItem {
  id: string;
  componentKey: string;
  componentName: string;
  componentGroup: string | null;
  componentType: string;
  componentVersion: string;
  mappingType: string;
  mappingTarget: string | null;
  iconUrl: string | null;
  enabled: boolean;
  isBuiltin: boolean;
  presentationSchema: Record<string, unknown> | null;
  protocolSchema: Record<string, unknown> | null;
  executionPolicy: Record<string, unknown> | null;
}

export interface FlowIssueItem {
  code: string;
  level: "error" | "warning";
  message: string;
  nodeId?: string;
  resourceType?: string;
  resourceId?: string;
}

export interface FlowSummaryItem {
  id: string;
  tenant: number;
  name: string;
  description: string | null;
  compileStatus: string;
  compileError: string | null;
  compileRevision: string;
  publishedReleaseId: string | null;
  publishedRevision: string | null;
  enabled: boolean | null;
  remark: string | null;
  /** Unix 毫秒时间戳 */
  createTime: number | null;
  /** Unix 毫秒时间戳 */
  updateTime: number | null;
}

/** GET /flows?pageNumber=&pageSize=&keyword=，与标准 Pagination 结构一致 */
export interface FlowListPageResult {
  total: number;
  pages: number;
  currentPage: number;
  pageSize: number;
  records: FlowSummaryItem[];
}

export interface FlowResourceReferenceItem {
  id: string;
  flowId: string;
  nodeId: string;
  componentKey: string;
  resourceType: string;
  resourceId: string;
  resourceSubId: string | null;
  resourceNameSnapshot: string | null;
  resourceStatusSnapshot: string | null;
  required: boolean;
  invalid: boolean;
  invalidReason: string | null;
}

export interface FlowDetailItem extends FlowSummaryItem {
  editorFlowJson: FlowEditorGraph;
  compiledFlowJson: Record<string, unknown> | null;
  componentSnapshotJson: Record<string, unknown> | null;
  remoteFlowId: string | null;
  remoteBindingStatus: string | null;
  /** Unix 毫秒时间戳 */
  lastCompiledTime: number | null;
  /** Unix 毫秒时间戳 */
  lastSyncedTime: number | null;
  references: FlowResourceReferenceItem[];
}

export interface FlowExportItem {
  schemaVersion: string;
  /** Unix 毫秒时间戳 */
  exportedAt: number;
  flow: {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean | null;
    remark: string | null;
    compileStatus: string;
    compileRevision: string;
    publishedRevision: string | null;
  };
  editorFlowJson: FlowEditorGraph;
  compiledFlowJson: Record<string, unknown> | null;
  componentSnapshotJson: Record<string, unknown> | null;
}

export interface FlowSavePayload extends Record<string, unknown> {
  name?: string | null;
  description?: string | null;
  editorFlowJson?: FlowEditorGraph | null;
  enabled?: boolean | null;
  remark?: string | null;
}

export interface FlowImportPayload extends Record<string, unknown> {
  name?: string | null;
  description?: string | null;
  enabled?: boolean | null;
  remark?: string | null;
  editorFlowJson?: FlowEditorGraph | null;
}

export interface FlowPublishPayload extends Record<string, unknown> {
  releaseNote?: string | null;
}

export interface FlowExecutionInputFileRef {
  id?: string | null;
  name?: string | null;
  path?: string | null;
  file_path?: string | null;
  filePath?: string | null;
  url?: string | null;
  mime?: string | null;
  ext?: Record<string, unknown> | null;
}

export interface FlowExecutionInput {
  query?: string | null;
  params?: Record<string, unknown> | null;
  files?: FlowExecutionInputFileRef[] | null;
  history?: { role: string; content: string; ext?: Record<string, unknown> | null }[] | null;
  ext?: Record<string, unknown> | null;
}

export interface FlowDebugPayload extends Record<string, unknown> {
  input?: string | FlowExecutionInput | null;
  sessionId?: string | null;
  inputType?: string | null;
  outputType?: string | null;
  tweaks?: Record<string, unknown> | null;
  variables?: Record<string, unknown> | null;
}

export interface FlowRunPayload extends FlowDebugPayload {}

export interface FlowFileUploadResult extends FlowExecutionInputFileRef {
  flowId?: string | null;
  raw?: unknown;
}

export interface FlowValidateResult {
  ok: boolean;
  issues: FlowIssueItem[];
}

export interface FlowDebugResult {
  ok: boolean;
  mode: "compile-preview" | "remote-run";
  issues: FlowIssueItem[];
  input: string | null;
  outputText: string | null;
  outputCount: number;
  durationMs: number;
}

export interface FlowRunResult extends Record<string, unknown> {
  raw?: {
    outputs?: unknown[];
    session_id?: string | null;
  } | null;
}

export interface FlowMonitorQueryParams {
  page?: number | string;
  size?: number | string;
  [key: string]: string | number | boolean | null | undefined;
}

export type FlowMonitorTracesResult = Record<string, unknown>;

export type FlowMonitorBuildsResult = Record<string, unknown>;

export interface FlowPublishResult {
  releaseId: string;
  releaseVersion: string;
}

export type TenantDescriptorStatus = "draft" | "published";

export interface TenantAgentModelConfig {
  provider?: string;
  model?: string;
  temperature?: number;
}

export interface TenantAgentContent {
  displayName?: string;
  description?: string;
  tags?: string[];
  version?: string;
  prompt: string;
  modelConfig?: TenantAgentModelConfig;
  ruleRefs?: string[];
  skillRefs?: string[];
  availableTools?: string[];
  subAgentRefs?: string[];
  maxDepth?: number;
}

export type TenantAgentContentInput = Omit<TenantAgentContent, "prompt"> & {
  prompt: string;
};

export interface TenantAgentView {
  id: string;
  kind: "agent" | "skill" | "rule";
  name: string;
  status: TenantDescriptorStatus;
  headVersionNo: number;
  publishedVersionNo: number | null;
  content: TenantAgentContent;
  createTime: number;
  updateTime: number;
}

export interface AgentCreatePayload {
  name: string;
  content: TenantAgentContentInput;
}
