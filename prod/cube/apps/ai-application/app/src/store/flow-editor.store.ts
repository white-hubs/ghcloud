import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type {
  FlowComponentCatalogItem,
  FlowDebugResult,
  FlowDetailItem,
  FlowFileUploadResult,
  FlowDebugPayload,
  FlowIssueItem,
  FlowSummaryItem,
} from "@ghcloud/cube-ai-application-service";
import type { ModelItem } from "@ghcloud/cube-ai-application-service";
import type { KnowledgeDocumentModel } from "@ghcloud/cube-knowledge-document-service";

import { cubeAiApplicationService, cubeKnowledgeDocumentService } from "@/api/service";
import { toEditorGraphData, toFlowGraphData, type FlowGraphData } from "@/types/flow";

function awaitWithAbort<T>(promise: Promise<T>, signal: AbortSignal | undefined | null): Promise<T> {
  if (signal == null) {
    return promise;
  }
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const onAbort = (): void => {
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (reason: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(reason);
      },
    );
  });
}

export const useFlowEditorStore = defineStore("flow-editor", () => {
  const loading = ref(false);
  const flowDetail = ref<FlowDetailItem | null>(null);
  const flowList = ref<FlowSummaryItem[]>([]);
  const components = ref<FlowComponentCatalogItem[]>([]);
  const graphData = ref<FlowGraphData>({ nodes: [], edges: [] });
  const validationIssues = ref<FlowIssueItem[]>([]);
  const debugResult = ref<FlowDebugResult | null>(null);
  const modelOptions = ref<ModelItem[]>([]);
  const knowledgeOptions = ref<KnowledgeDocumentModel[]>([]);
  const selectedNodeId = ref<string | null>(null);

  const componentMap = computed(() => new Map(components.value.map((item) => [item.componentKey, item])));
  const selectedNode = computed(() => graphData.value.nodes.find((node) => node.id === selectedNodeId.value) ?? null);

  async function hydratePaletteAndResources(): Promise<void> {
    const [catalog, documents, models] = await Promise.all([
      cubeAiApplicationService.listFlowComponents(),
      cubeKnowledgeDocumentService.getKnowledgeDocumentList({
        pageNumber: 1,
        pageSize: 200,
        status: true,
      }),
      cubeAiApplicationService.listTenantModels(),
    ]);
    components.value = catalog;
    knowledgeOptions.value = documents.records ?? [];
    modelOptions.value = models;
  }

  async function loadFlowList(): Promise<void> {
    flowList.value = await cubeAiApplicationService.listFlows();
  }

  async function loadFlow(flowId: string): Promise<void> {
    loading.value = true;
    try {
      const detail = await cubeAiApplicationService.getFlow(flowId);
      flowDetail.value = detail;
      graphData.value = toFlowGraphData(detail, componentMap.value);
      selectedNodeId.value = null;
      validationIssues.value = [];
      debugResult.value = null;
    } finally {
      loading.value = false;
    }
  }

  function replaceGraphData(nextGraphData: FlowGraphData): void {
    graphData.value = nextGraphData;
    if (selectedNodeId.value && !nextGraphData.nodes.some((node) => node.id === selectedNodeId.value)) {
      selectedNodeId.value = null;
    }
  }

  function updateSelectedNodeConfig(config: Record<string, unknown>): void {
    if (!selectedNodeId.value) {
      return;
    }
    graphData.value = {
      ...graphData.value,
      nodes: graphData.value.nodes.map((node) =>
        node.id === selectedNodeId.value
          ? {
              ...node,
              data: {
                ...node.data,
                config,
              },
            }
          : node,
      ),
    };
  }

  function updateSelectedNodeLabel(label: string): void {
    if (!selectedNodeId.value) {
      return;
    }
    graphData.value = {
      ...graphData.value,
      nodes: graphData.value.nodes.map((node) =>
        node.id === selectedNodeId.value
          ? {
              ...node,
              data: {
                ...node.data,
                label,
              },
            }
          : node,
      ),
    };
  }

  async function persistCurrentFlow(replaceGraphData = true): Promise<FlowDetailItem> {
    if (!flowDetail.value) {
      throw new Error("流程详情未加载");
    }
    const detail = await cubeAiApplicationService.saveFlow(flowDetail.value.id, {
      name: flowDetail.value.name,
      description: flowDetail.value.description,
      enabled: flowDetail.value.enabled,
      remark: flowDetail.value.remark,
      editorFlowJson: toEditorGraphData(graphData.value, flowDetail.value.editorFlowJson),
    });
    flowDetail.value = detail;
    if (replaceGraphData) {
      graphData.value = toFlowGraphData(detail, componentMap.value);
    }
    return detail;
  }

  async function validateCurrentFlow(): Promise<void> {
    if (!flowDetail.value) {
      return;
    }
    await persistCurrentFlow();
    const result = await cubeAiApplicationService.validateFlow(flowDetail.value.id);
    validationIssues.value = result.issues;
  }

  async function debugCurrentFlow(payload?: {
    input?: FlowDebugPayload["input"] | null;
    variables?: Record<string, unknown> | null;
    signal?: AbortSignal | null;
  }): Promise<void> {
    if (!flowDetail.value) {
      return;
    }
    /* 仍落库以保证调试跑在最新保存上；勿 replaceGraphData，否则会触发画布 watch 整图重灌，
     * 与侧栏 apply 叠加时 X6 易出现节点视图叠层（幽灵副本）。画布状态已与当前 graphData 一致。 */
    await persistCurrentFlow(false);
    const variables = payload?.variables ?? {};
    const signal = payload?.signal ?? undefined;
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const debugPromise = cubeAiApplicationService.debugFlow(
      flowDetail.value.id,
      {
        input: payload?.input === undefined || payload.input === "" ? null : payload.input,
        variables: Object.keys(variables).length > 0 ? variables : {},
      },
      signal ? { signal } : undefined,
    );
    debugResult.value = await awaitWithAbort(debugPromise, signal);
    validationIssues.value = debugResult.value.issues;
  }

  async function uploadCurrentFlowFiles(files: File[]): Promise<FlowFileUploadResult[]> {
    if (!flowDetail.value) {
      throw new Error("流程详情未加载");
    }
    if (files.length === 0) {
      return [];
    }
    await persistCurrentFlow(false);
    const flowId = flowDetail.value.id;
    return Promise.all(files.map((file) => cubeAiApplicationService.uploadFlowFile(flowId, file)));
  }

  async function publishCurrentFlow(): Promise<{ releaseId: string; releaseVersion: string }> {
    if (!flowDetail.value) {
      throw new Error("流程详情未加载");
    }
    await persistCurrentFlow();
    const result = await cubeAiApplicationService.publishFlow(flowDetail.value.id, {});
    await loadFlow(flowDetail.value.id);
    return result;
  }

  function clearDebugResult(): void {
    debugResult.value = null;
    validationIssues.value = [];
  }

  return {
    loading,
    flowDetail,
    flowList,
    components,
    graphData,
    validationIssues,
    debugResult,
    modelOptions,
    knowledgeOptions,
    selectedNodeId,
    selectedNode,
    componentMap,
    hydratePaletteAndResources,
    loadFlowList,
    loadFlow,
    replaceGraphData,
    updateSelectedNodeConfig,
    updateSelectedNodeLabel,
    persistCurrentFlow,
    validateCurrentFlow,
    debugCurrentFlow,
    uploadCurrentFlowFiles,
    publishCurrentFlow,
    clearDebugResult,
  };
});
