import { LineLossEdgePanel } from "./line-loss-edge-panel";
import { cubeGraphEditorService } from "@/api/server";
import type { Graph, Cell } from "@antv/x6";
import { ElectricalEditor, type ElectricalData, type ElectricalNode, replaceData } from "@ghcloud/cube-graph-editor-electrical";
// import { replaceData } from "@ghcloud/cube-utils";
// import { replaceData } from "../../utils/utils";
import { Button, Space, message } from "ant-design-vue";
import { defineComponent, ref } from "vue";
import "@/style.css";
import "@/App.css";

export const LineEditor = defineComponent({
  name: "LineEditor",
  setup() {
    const editorRef = ref<unknown | null>(null);
    const graphRef = ref<Graph | null>(null);
    const electricalNodes = ref<ElectricalNode[]>([]);
    const hasLoadedDefault = ref(false);
    const updateLoading = ref(false);

    const getViewportState = (): { zoom: number; tx: number; ty: number } | null => {
      const graph = graphRef.value as unknown as
        | {
            getZoom?: () => number;
            translate?: (...args: number[]) => unknown;
          }
        | null;
      if (!graph) {
        return null;
      }

      const zoom = typeof graph.getZoom === "function" ? graph.getZoom() : null;
      const translateResult =
        typeof graph.translate === "function" ? (graph.translate() as { tx?: number; ty?: number } | undefined) : undefined;
      if (typeof zoom !== "number" || !translateResult) {
        return null;
      }

      const tx = typeof translateResult.tx === "number" ? translateResult.tx : 0;
      const ty = typeof translateResult.ty === "number" ? translateResult.ty : 0;
      return { zoom, tx, ty };
    };

    const restoreViewportState = (state: { zoom: number; tx: number; ty: number } | null): void => {
      const graph = graphRef.value as unknown as
        | {
            zoomTo?: (zoom: number) => void;
            translate?: (...args: number[]) => unknown;
          }
        | null;
      if (!graph || !state) {
        return;
      }

      if (typeof graph.zoomTo === "function") {
        graph.zoomTo(state.zoom);
      }
      if (typeof graph.translate === "function") {
        graph.translate(state.tx, state.ty);
      }
    };

    const loadDefaultGraph = async (): Promise<void> => {
      try {
        const payload = await cubeGraphEditorService.loadLineGraph();
        const { electricalData } = replaceData(payload, true);
        const result = (
          editorRef.value as { importData?: (data: ElectricalData) => void | Promise<void> } | null
        )?.importData?.(electricalData);
        if (result && typeof (result as Promise<void>).then === "function") {
          await result;
        }
        hasLoadedDefault.value = true;
      } catch (_ignore) {
        message.error("默认数据加载失败");
      }
    };

    const handleEditorReady = (graph: Graph): void => {
      graphRef.value = graph;

      if (!hasLoadedDefault.value) {
        loadDefaultGraph();
      }
    };

    const handleDataChange = (_data: ElectricalData): void => {};

    const handleExport = (): void => {
      if (!editorRef.value) {
        return;
      }

      const data = (editorRef.value as { exportData?: () => ElectricalData | null } | null)?.exportData?.();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `electrical-diagram-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      message.success("数据已导出");
    };

    /**
     * 保存：将导出的 ElectricalData 拆分为节点列表和连线列表，
     * 再连同原始 ElectricalData 一起导出为一个 JSON 对象
     *
     * 节点列表字段：
     * - id
     * - name
     * - type
     * - deviceIds
     * - childrenIds
     * - location
     *
     * 连线列表字段：
     * - id
     * - lineName
     * - fromNodeId
     * - toNodeId
     */
    const handleSave = async (): Promise<void> => {
      if (!editorRef.value) {
        return;
      }

      const data = (editorRef.value as { exportData?: () => ElectricalData | null } | null)?.exportData?.() as ElectricalData | null;
      if (!data) {
        message.warning("暂无数据可保存");
        return;
      }

      const graphNodes = (data.graph && Array.isArray(data.graph.nodes) ? data.graph.nodes : []) as unknown[];
      const graphEdges = (data.graph && Array.isArray(data.graph.edges) ? data.graph.edges : []) as unknown[];

      const nodeIdMap = new Map<string, string>();
      const edgeIdMap = new Map<string, string>();

      const isBusinessId = (id: string): boolean => /^\d+$/.test(id);

      const allNodeIds = graphNodes
        .map((n) => (n as { id?: string })?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0);
      const allEdgeIds = graphEdges
        .map((e) => (e as { id?: string })?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0);

      // 已经是业务 ID（纯数字）的，直接映射为自身；只有临时 ID 才需要向后端申请新 ID
      allNodeIds.forEach((id) => {
        if (isBusinessId(id)) {
          nodeIdMap.set(id, id);
        }
      });
      allEdgeIds.forEach((id) => {
        if (isBusinessId(id)) {
          edgeIdMap.set(id, id);
        }
      });

      const tempNodeIds = allNodeIds.filter((id) => !isBusinessId(id));
      const tempEdgeIds = allEdgeIds.filter((id) => !isBusinessId(id));

      const total = tempNodeIds.length + tempEdgeIds.length;
      if (total > 0) {
        const ids = await cubeGraphEditorService.getNewId(total);
        const nodeIds = ids.slice(0, tempNodeIds.length).map((v) => String(v));
        const edgeIds = ids.slice(tempNodeIds.length).map((v) => String(v));

        tempNodeIds.forEach((oldId, index) => {
          nodeIdMap.set(oldId, nodeIds[index] || oldId);
        });
        tempEdgeIds.forEach((oldId, index) => {
          edgeIdMap.set(oldId, edgeIds[index] || oldId);
        });
      }

      const replacePortId = (portId: unknown, oldNodeId: string, newNodeId: string): unknown => {
        if (typeof portId !== "string") {
          return portId;
        }
        const prefix = `${oldNodeId}-`;
        if (portId.startsWith(prefix)) {
          return `${newNodeId}-${portId.slice(prefix.length)}`;
        }
        return portId;
      };

      const replaceGraphNode = (raw: unknown): unknown => {
        const cloned = JSON.parse(JSON.stringify(raw)) as {
          id?: string;
          position?: { x?: number; y?: number };
          x?: number;
          y?: number;
          ports?: { items?: { id?: string; [key: string]: unknown }[] };
          data?: Record<string, unknown>;
          [key: string]: unknown;
        };
        if (!cloned || !cloned.id) {
          return cloned;
        }

        const oldId = cloned.id;
        const newId = nodeIdMap.get(oldId) || oldId;
        cloned.id = newId;

        if (cloned.ports && Array.isArray(cloned.ports.items)) {
          cloned.ports.items = cloned.ports.items.map((item) => {
            if (!item) {
              return item;
            }
            return {
              ...item,
              id: typeof item.id === "string" ? (replacePortId(item.id, oldId, newId) as string) : item.id,
            };
          });
        }
        return cloned;
      };

      const replaceGraphEdge = (raw: unknown): unknown => {
        const cloned = JSON.parse(JSON.stringify(raw)) as {
          id?: string;
          source?: string | { cell?: string; port?: unknown };
          target?: string | { cell?: string; port?: unknown };
          data?: { from?: string; to?: string; fromPort?: unknown; toPort?: unknown; [key: string]: unknown };
          [key: string]: unknown;
        };
        if (!cloned || !cloned.id) {
          return cloned;
        }

        const oldEdgeId = cloned.id;
        const newEdgeId = edgeIdMap.get(oldEdgeId) || oldEdgeId;
        cloned.id = newEdgeId;

        const getCellId = (t: unknown): string => {
          if (!t) {
            return "";
          }
          if (typeof t === "string") {
            return t;
          }
          const obj = t as { cell?: string };
          return typeof obj.cell === "string" ? obj.cell : "";
        };

        const nextSourceCell = (() => {
          const old = getCellId(cloned.source);
          return old ? nodeIdMap.get(old) || old : old;
        })();
        const nextTargetCell = (() => {
          const old = getCellId(cloned.target);
          return old ? nodeIdMap.get(old) || old : old;
        })();

        if (typeof cloned.source === "string") {
          cloned.source = nextSourceCell;
        } else if (cloned.source && typeof cloned.source === "object") {
          const src = cloned.source as { cell?: string; port?: unknown };
          const oldCell = src.cell || "";
          const newCell = oldCell ? nodeIdMap.get(oldCell) || oldCell : oldCell;
          cloned.source = {
            ...src,
            cell: newCell,
            port: oldCell ? replacePortId(src.port, oldCell, newCell) : src.port,
          };
        }

        if (typeof cloned.target === "string") {
          cloned.target = nextTargetCell;
        } else if (cloned.target && typeof cloned.target === "object") {
          const tgt = cloned.target as { cell?: string; port?: unknown };
          const oldCell = tgt.cell || "";
          const newCell = oldCell ? nodeIdMap.get(oldCell) || oldCell : oldCell;
          cloned.target = {
            ...tgt,
            cell: newCell,
            port: oldCell ? replacePortId(tgt.port, oldCell, newCell) : tgt.port,
          };
        }

        if (cloned.data) {
          const fromOld = cloned.data.from || "";
          const toOld = cloned.data.to || "";
          const fromNew = fromOld ? nodeIdMap.get(fromOld) || fromOld : fromOld;
          const toNew = toOld ? nodeIdMap.get(toOld) || toOld : toOld;
          cloned.data = {
            ...cloned.data,
            from: fromNew,
            to: toNew,
            fromPort: fromOld ? replacePortId(cloned.data.fromPort, fromOld, fromNew) : cloned.data.fromPort,
            toPort: toOld ? replacePortId(cloned.data.toPort, toOld, toNew) : cloned.data.toPort,
          };
        }

        return cloned;
      };

      const graphNodeMap = new Map<string, unknown>();
      graphNodes.forEach((gn) => {
        const n = gn as { id?: string };
        if (n && n.id) {
          graphNodeMap.set(n.id, gn);
        }
      });

      const graphEdgeMap = new Map<string, unknown>();
      graphEdges.forEach((ge) => {
        const e = ge as { id?: string };
        if (e && e.id) {
          graphEdgeMap.set(e.id, ge);
        }
      });

      const nodeList = (data.nodes || []).map((node: ElectricalNode) => {
        const foundGraphNode = graphNodes.find((gn) => {
          const g = gn as { id?: string };
          return g && g.id === node.id;
        }) as
          | {
              data?: { deviceBindings?: Record<string, unknown>; deviceId?: string; location?: string };
            }
          | undefined;

        const location: string | undefined =
          (foundGraphNode && foundGraphNode.data && (foundGraphNode.data.location as string)) || undefined;

        // 设备 ID 优先从节点自身的 deviceBindings（多选）中获取
        let deviceIdList: string[] = [];
        const nodeBindings =
          foundGraphNode && foundGraphNode.data && foundGraphNode.data.deviceBindings
            ? (foundGraphNode.data.deviceBindings as Record<string, unknown>)
            : undefined;
        if (nodeBindings && typeof nodeBindings === "object") {
          deviceIdList = Object.keys(nodeBindings);
        } else {
          // 兼容只绑定了单个设备且存到了 ElectricalData.deviceBindings 的老数据
          const { deviceId } = node as unknown as { deviceId?: string };
          if (deviceId && data.deviceBindings && data.deviceBindings[deviceId]) {
            deviceIdList = [deviceId];
          }
        }

        const graphId = node.id;
        const id = (graphId && nodeIdMap.get(graphId)) || graphId;
        const rawGraphNode = graphId ? graphNodeMap.get(graphId) : undefined;
        const webStyle = rawGraphNode ? JSON.stringify(replaceGraphNode(rawGraphNode)) : undefined;

        const deviceIds = deviceIdList.length > 0 ? deviceIdList.join(",") : undefined;
        const childrenIdList = (node.childrenIds || []).map((cid) => (cid && nodeIdMap.get(cid)) || cid);
        const childrenIds = childrenIdList.length > 0 ? childrenIdList.join(",") : undefined;

        return {
          id,
          name: node.name,
          type: node.type,
          deviceIds,
          childrenIds,
          location,
          webStyle,
        };
      });

      const nodeNameById = new Map<string, string>();
      nodeList.forEach((n) => {
        nodeNameById.set(n.id, n.name);
      });

      const edgeList = graphEdges
        .map((edgeValue) => {
          const edge = edgeValue as {
            id?: string;
            data?: { from?: string; to?: string; lineLoss?: number };
            source?: string | { cell?: string };
            target?: string | { cell?: string };
          };
          if (!edge) {
            return null;
          }

          const graphEdgeId = edge.id ?? "";
          const id = (graphEdgeId && edgeIdMap.get(graphEdgeId)) || graphEdgeId;

          const fromGraphId = edge.data?.from || (typeof edge.source === "string" ? edge.source : edge.source?.cell) || "";
          const toGraphId = edge.data?.to || (typeof edge.target === "string" ? edge.target : edge.target?.cell) || "";

          const fromNodeId = (fromGraphId && nodeIdMap.get(fromGraphId)) || fromGraphId;
          const toNodeId = (toGraphId && nodeIdMap.get(toGraphId)) || toGraphId;

          const fromName = (fromNodeId && nodeNameById.get(fromNodeId)) || fromNodeId;
          const toName = (toNodeId && nodeNameById.get(toNodeId)) || toNodeId;
          const startText = fromName || "开始节点";
          const endText = toName || "结束节点";
          const lineName = `【${startText}】-【${endText}】`;

          const rawGraphEdge = graphEdgeId ? graphEdgeMap.get(graphEdgeId) : undefined;
          const webStyle = rawGraphEdge ? JSON.stringify(replaceGraphEdge(rawGraphEdge)) : undefined;

          return {
            id,
            lineName,
            fromNodeId,
            toNodeId,
            webStyle,
          };
        })
        .filter((edge) => !!edge);

      const payload = {
        nodeList,
        connectionList: edgeList,
      };

      try {
        await cubeGraphEditorService.saveGraph(payload);
        message.success("数据已保存", 0);
      } catch (_ignore) {
        message.error("数据保存失败");
      }
    };

    const handleImport = (): void => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          try {
            const data = JSON.parse(loadEvent.target?.result as string);
            (editorRef.value as { importData?: (data: ElectricalData) => void } | null)?.importData?.(data as ElectricalData);
            message.success("数据已导入");
          } catch (_ignore) {
            message.error("数据格式错误");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };

    /**
     * 加载：从保存结构的 JSON 文件中恢复数据，仅使用其中的 ElectricalData 加载到编辑器
     *
     * 期望的 JSON 结构：
     * {
     *   "electricalData": { ... 原始 ElectricalData ... },
     *   "nodeList": [{ id, name, type, deviceIds, childrenIds, location }],
     *   "edgeList": [{ id, lineName, fromNodeId, toNodeId }]
     * }
     */
    const handleLoadSaved = (): void => {
      if (!editorRef.value) {
        return;
      }

      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          try {
            const raw = loadEvent.target?.result as string;
            const parsedUnknown = JSON.parse(raw) as unknown;

            let electricalData: ElectricalData | null = null;

            // 1. 优先使用 replaceData：从 nodeList / connectionList 结构重建 ElectricalData
            if (
              parsedUnknown &&
              typeof parsedUnknown === "object" &&
              ("nodeList" in (parsedUnknown as { nodeList?: unknown }) ||
                "connectionList" in (parsedUnknown as { connectionList?: unknown }))
            ) {
              const rebuilt = replaceData(parsedUnknown as unknown as Parameters<typeof replaceData>[0]);
              electricalData = rebuilt.electricalData as ElectricalData;
            } else if (
              parsedUnknown &&
              typeof parsedUnknown === "object" &&
              "electricalData" in (parsedUnknown as { electricalData?: unknown })
            ) {
              // 2. 兼容：旧结构中直接带 electricalData
              const wrapper = parsedUnknown as { electricalData?: unknown };
              electricalData = wrapper.electricalData as ElectricalData;
            } else {
              // 3. 兼容：整个 JSON 就是 ElectricalData
              const possible = parsedUnknown as Partial<ElectricalData>;
              if (possible && Array.isArray(possible.nodes) && possible.graph) {
                electricalData = possible as ElectricalData;
              }
            }

            if (!electricalData) {
              message.error("JSON 中未找到有效的 ElectricalData 数据");
              return;
            }

            (editorRef.value as { importData?: (data: ElectricalData) => void } | null)?.importData?.(electricalData);
            message.success("保存数据已加载");
          } catch (_ignore) {
            message.error("JSON 解析失败");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };

    const handleClear = (): void => {
      (editorRef.value as { clear?: () => void } | null)?.clear?.();
      message.info("画布已清空");
    };

    const handleUpdate = async (): Promise<void> => {
      updateLoading.value = true;
      const viewportState = getViewportState();
      try {
        await cubeGraphEditorService.updateLine();
        await loadDefaultGraph();
        restoreViewportState(viewportState);
        requestAnimationFrame(() => {
          restoreViewportState(viewportState);
        });
      } finally {
        updateLoading.value = false;
      }
    };
    const handleUndo = (): void => {
      if (!graphRef.value?.canUndo()) {
        return;
      }

      graphRef.value.undo();
      message.info("已撤销");
    };

    const handleRedo = (): void => {
      if (!graphRef.value?.canRedo()) {
        return;
      }

      graphRef.value.redo();
      message.info("已重做");
    };

    const handleZoomToFit = (): void => {
      if (!graphRef.value) {
        return;
      }

      graphRef.value.zoomToFit({ padding: 20 });
      message.info("已适应画布");
    };

    return () => (
      <div class="app">
        <header class="app-header">
          <div class="app-header__left">
            <h1 class="app-title">线损管理</h1>
          </div>
          <div class="app-header__right">
            <Space>
              {/* <Button onClick={handleUndo}>撤销</Button>
              <Button onClick={handleRedo}>重做</Button>
              <Button onClick={handleZoomToFit}>适应画布</Button>
              <Button onClick={handleImport}>导入</Button>
              <Button onClick={handleLoadSaved}>加载</Button>
              <Button onClick={handleExport}>导出</Button> */}
              <Button loading={updateLoading.value} onClick={handleUpdate} type="primary">
                更新关系
              </Button>
              {/* <Button onClick={handleClear} danger>
                清空
              </Button> */}
            </Space>
          </div>
        </header>

        <main class="app-main">
          <ElectricalEditor
            ref={editorRef}
            nodes={electricalNodes.value}
            readonly={true}
            lineLossPanel={false}
            rightPanelWidth={440}
            showRightPanel={({ edges }: { edges: Cell[] }) => edges.length > 0}
            customRightPanel={({ all, edges }: { all: Cell[]; edges: Cell[] }) => {
              const hasEdge = edges && edges.length > 0;
              if (!hasEdge) {
                return null;
              }
              return <LineLossEdgePanel selectedCells={all} readonly={true} onSaved={loadDefaultGraph} />;
            }}
            options={{
              grid: true,
              panning: true,
              scroller: false,
              mousewheel: {
                enabled: true,
                modifiers: ["ctrl", "meta"],
              },
              snapline: true,
              // 线损管理：禁止拉线新增连线，但保留默认转角/router/connector
              connecting: {
                snap: true,
                allowBlank: false,
                allowLoop: false,
                allowNode: true,
                allowEdge: false,
                allowPort: true,
                highlight: true,
                anchor: "center",
                connectionPoint: "anchor",
                router: {
                  name: "manhattan",
                },
                connector: {
                  name: "rounded",
                  args: {
                    radius: 8,
                  },
                },
                validateMagnet: () => false,
                validateConnection: () => false,
              },
              // 线损管理：仅允许查看，禁止拖动/新增/删除节点和连线
              selecting: {
                enabled: true,
                rubberband: false,
                movable: false,
                showNodeSelectionBox: true,
              },

              history: false,
              clipboard: {
                enabled: false,
              },
              keyboard: {
                enabled: false,
              },
              interacting: {
                nodeMovable: false,
                edgeMovable: false,
                vertexMovable: false,
              },
            }}
            onReady={handleEditorReady}
            onChange={handleDataChange}
          />
        </main>
      </div>
    );
  },
});
