import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import {
  graphToPageModel,
  serializePage,
  deserializePage,
  pageModelToGraph,
  parseStoredPagePayload,
  validatePageModel,
  type Action,
  type ElementInstance,
  type PageModel,
  type TagDefinition,
} from "@cube-scada/core";
import { EditorLayout, useEditorStore } from "@cube-scada/editor";
import { ActionExecutor, BindingEngine, MockDriver, type MockTagConfig } from "@cube-scada/engine";
import { RuntimeRenderer, type RuntimeElementEvent } from "@cube-scada/runtime";
import { enrichScadaPopupWithSource, scadaPopupFromActionConfig, type ScadaPopupEvent } from "@cube-scada/studio-sdk";
import { message, Modal, Breadcrumb, Button, Input } from "ant-design-vue";
import { defineComponent, nextTick, ref, shallowRef, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { DEFAULT_PAGE_NAME, isNewPlaceholderPageContent } from "./page-save-name";
import { createPreviewPopupDeviceContext } from "./popup-preview-values";

const EXPORT_SCHEMA_VERSION = "2";
const DRAFT_KEY_PREFIX = "cube-scada:draft:";

function renderPreviewPopupContent(event: ScadaPopupEvent) {
  const contentStyle = event.style.content;
  const deviceStyle = event.style.device;
  const hasCustom = Boolean(event.contentId || event.content);
  const showDeviceData = event.deviceBinding === "required";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "50vh", overflowY: "auto" }}>
      {hasCustom ? (
        <section
          style={{
            color: contentStyle.color,
            fontSize: `${contentStyle.fontSize}px`,
            fontWeight: contentStyle.fontWeight,
            lineHeight: contentStyle.lineHeight,
            textAlign: contentStyle.textAlign,
          }}
        >
          {event.contentId ? (
            <div style={{ padding: "10px 12px", marginBottom: event.content ? "10px" : 0, background: "#f5f5f5", borderRadius: "6px" }}>
              自定义内容 ID：{event.contentId}
            </div>
          ) : null}
          {event.content ? <div style={{ whiteSpace: "pre-wrap" }}>{event.content}</div> : null}
        </section>
      ) : null}
      {showDeviceData ? (
        <div>
          <div
            style={{
              marginBottom: "8px",
              padding: "6px 10px",
              borderRadius: "4px",
              background: "#fffbe6",
              color: "#ad6800",
              fontSize: "12px",
            }}
          >
            预览模式：以下设备属性使用模拟值
          </div>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: deviceStyle.layout === "columns" ? "repeat(auto-fit, minmax(140px, 1fr))" : "1fr",
              rowGap: `${deviceStyle.rowGap}px`,
              columnGap: `${deviceStyle.columnGap}px`,
            }}
          >
            {event.deviceData.length > 0 ? (
              event.deviceData.map((item) => (
                <div
                  key={item.propCode}
                  style={{
                    display: "grid",
                    gridTemplateColumns: deviceStyle.layout === "columns" ? "1fr" : "minmax(0, 1fr) auto",
                    gap: `${deviceStyle.columnGap}px`,
                    padding: "10px 12px",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    borderRadius: "6px",
                    textAlign: deviceStyle.textAlign,
                  }}
                >
                  <span
                    style={{
                      color: deviceStyle.labelColor,
                      fontSize: `${deviceStyle.labelFontSize}px`,
                      fontWeight: deviceStyle.labelFontWeight,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      color: deviceStyle.valueColor,
                      fontSize: `${deviceStyle.valueFontSize}px`,
                      fontWeight: deviceStyle.valueFontWeight,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: "#8c8c8c", textAlign: deviceStyle.textAlign }}>尚未配置设备属性绑定</div>
            )}
          </section>
        </div>
      ) : null}
      {!hasCustom && !showDeviceData ? <div style={{ color: "#8c8c8c" }}>（空内容）</div> : null}
      {event.sourceElement ? (
        <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
          来源图元：{event.sourceElement.id}（{event.sourceElement.type}）
        </div>
      ) : null}
    </div>
  );
}

export default defineComponent({
  name: "EditorView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useEditorStore();

    const pageId = () => route.params.pageId as string;
    const projectId = () => route.params.projectId as string;
    const draftKey = () => `${DRAFT_KEY_PREFIX}${pageId()}`;

    const projectName = ref<string | null>(null);
    // true after a successful GET /scada/api/pages/:id — tells save() to use PUT
    const pageExistsOnServer = ref(false);
    const pageNameRequiredOnSave = shallowRef(false);
    const saveNameModalVisible = shallowRef(false);
    const pendingPageName = shallowRef(DEFAULT_PAGE_NAME);

    async function loadProjectName() {
      const pid = projectId();
      if (!pid || pid === "_") {
        return;
      }
      try {
        const resp = await fetch(`/scada/api/projects/${pid}`);
        if (resp.ok) {
          const proj = (await resp.json()) as { name: string };
          projectName.value = proj.name;
        }
      } catch {
        /* non-fatal */
      }
    }

    const backPath = computed(() => {
      const pid = projectId();
      return pid && pid !== "_" ? `/projects/${pid}` : "/projects";
    });

    const breadcrumbItems = computed(() => {
      const items = [{ label: "所有项目", path: "/projects" }];
      if (projectId() && projectId() !== "_" && projectName.value) {
        items.push({ label: projectName.value, path: `/projects/${projectId()}` });
      }
      items.push({ label: store.pageName || "加载中…", path: "" });
      return items;
    });

    const bindingEngine = new BindingEngine();
    const previewActionExecutor = new ActionExecutor();
    const previewPopupActionSource: { current: ElementInstance | null } = { current: null };
    const previewVisible = ref(false);
    const previewPage = ref<PageModel | null>(null);
    const previewCanvasRef = ref<HTMLDivElement>();
    const importInputRef = ref<HTMLInputElement>();
    const pageLoadedOnce = ref(false);
    function setPreviewElementVisibility(elementId: string, visible: boolean) {
      const current = previewPage.value;
      if (!current || !current.elements.some((element) => element.id === elementId)) return;
      previewPage.value = {
        ...current,
        elements: current.elements.map((element) => (element.id === elementId ? { ...element, visible } : element)),
      };
    }

    previewActionExecutor.setContext({
      navigate: (targetPageId: string) => {
        message.info(`预览动作：导航到 ${targetPageId}`);
      },
      showPopup: (config: Record<string, unknown>) => {
        const base = scadaPopupFromActionConfig(config);
        const src = previewPopupActionSource.current;
        const previewContext = src ? createPreviewPopupDeviceContext(src) : null;
        const ev = previewContext ? enrichScadaPopupWithSource(base, previewContext.source, previewContext.readValue) : base;
        Modal.info({ title: ev.title, content: renderPreviewPopupContent(ev), width: 520 });
      },
      setElementVisibility: setPreviewElementVisibility,
    });

    onUnmounted(() => {
      bindingEngine.dispose();
    });

    // ── localStorage draft helpers ────────────────────────────────────────────

    async function saveToLocalStorage() {
      const page = await buildCurrentPage();
      if (!page) {
        return;
      }
      try {
        localStorage.setItem(
          draftKey(),
          JSON.stringify({
            schemaVersion: EXPORT_SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
            page,
          }),
        );
      } catch {
        /* quota exceeded — silently ignore */
      }
    }

    function loadFromLocalStorage(): PageModel | null {
      try {
        const raw = localStorage.getItem(draftKey());
        if (!raw) {
          return null;
        }
        return parseImportedPage(raw);
      } catch {
        return null;
      }
    }

    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
    function scheduleSave() {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      autoSaveTimer = setTimeout(saveToLocalStorage, 1000);
    }

    // ── Page model helpers ────────────────────────────────────────────────────

    async function buildCurrentPage(id = store.pageId): Promise<PageModel | null> {
      await nextTick();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });
      const g = store.graph;
      if (!g) {
        return null;
      }
      return graphToPageModel(g, {
        id,
        name: store.pageName,
        width: store.pageWidth,
        height: store.pageHeight,
        background: store.pageBackground,
        backgroundImage: store.pageBackgroundImage,
        globals: { ...store.globalState },
        aliases: [],
        tags: [...store.pageTags],
        product: store.pageProduct ? { ...store.pageProduct } : undefined,
      });
    }

    function parseImportedPage(rawText: string): PageModel {
      const parsed = JSON.parse(rawText) as unknown;
      const asRecord = parsed as Record<string, unknown> | null;
      const maybePage = asRecord && typeof asRecord === "object" && "page" in asRecord ? (asRecord.page as unknown) : parsed;
      return deserializePage(JSON.stringify(maybePage));
    }

    function applyPageToStore(page: PageModel, source: "导入" | "加载") {
      const g = store.graph;
      if (!g) {
        message.error(`${source}失败：画布尚未初始化`);
        return;
      }
      pageModelToGraph(g, page);
      store.pageId = page.id;
      store.pageName = page.name; // 恢复页面名称加载
      store.pageWidth = page.width;
      store.pageHeight = page.height;
      store.pageBackground = page.background;
      store.pageBackgroundImage = page.backgroundImage;
      store.pageProduct = page.product ? { ...page.product } : undefined;
      store.replaceGlobalState(page.globals ?? {});
      store.replaceAllTags(page.tags ?? []);
    }

    // ── Server persistence ───────────────────────────────────────────────────

    async function readApiErrorMessage(resp: Response, fallback: string): Promise<string> {
      try {
        const body = (await resp.json()) as { message?: string };
        return typeof body.message === "string" && body.message.trim() ? body.message : fallback;
      } catch {
        return fallback;
      }
    }

    async function persistCurrentPage(): Promise<boolean> {
      const routeId = pageId();
      const targetId = pageExistsOnServer.value ? routeId : store.pageId;
      const page = await buildCurrentPage(targetId);
      if (!page) {
        return false;
      }

      const validation = validatePageModel(page);
      if (validation.errors.length > 0) {
        message.error(`保存失败：发现 ${validation.errors.length} 个配置错误。${validation.errors[0].message}`);
        return false;
      }
      if (validation.warnings.length > 0) {
        message.warning(`存在 ${validation.warnings.length} 个配置警告，已继续保存。`);
      }

      const json = serializePage(page);
      const currentId = targetId;

      // Capture a thumbnail of the current canvas (non-blocking on failure)
      const thumbnail = await store.captureThumbnail().catch(() => null);

      try {
        if (pageExistsOnServer.value) {
          const updateResp = await fetch(`/scada/api/pages/${currentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: store.pageName,
              content: json,
              ...(thumbnail ? { thumbnail } : {}),
            }),
          });
          if (!updateResp.ok) {
            throw new Error(await readApiErrorMessage(updateResp, `保存失败: HTTP ${updateResp.status}`));
          }
          message.success("图纸已保存");
        } else {
          const pid = projectId();
          const createResp = await fetch("/scada/api/pages/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: store.pageName,
              content: json,
              ...(pid && pid !== "_" ? { project_id: pid } : {}),
              ...(thumbnail ? { thumbnail } : {}),
            }),
          });
          if (!createResp.ok) {
            throw new Error(await readApiErrorMessage(createResp, `创建失败: HTTP ${createResp.status}`));
          }

          const created = (await createResp.json()) as { id: string };
          store.pageId = created.id;
          pageExistsOnServer.value = true;
          const newRoute = pid && pid !== "_" ? `/projects/${pid}/pages/${created.id}` : `/projects/_/pages/${created.id}`;
          router.replace(newRoute);
          message.success("图纸已创建并保存");
        }
        return true;
      } catch (error) {
        message.error(error instanceof Error ? error.message : "服务器保存失败，已自动保留本地草稿");
        return false;
      }
    }

    async function handleSave() {
      if (!pageExistsOnServer.value || pageNameRequiredOnSave.value) {
        pendingPageName.value = store.pageName.trim() || DEFAULT_PAGE_NAME;
        saveNameModalVisible.value = true;
        return;
      }
      await persistCurrentPage();
    }

    async function confirmPageNameAndSave() {
      const pageName = pendingPageName.value.trim();
      if (!pageName) {
        message.warning("请输入画面名称");
        return;
      }
      store.pageName = pageName;
      saveNameModalVisible.value = false;
      if (await persistCurrentPage()) {
        pageNameRequiredOnSave.value = false;
      }
    }

    async function loadPageFromServer() {
      const id = pageId();
      if (!id) {
        return;
      }
      try {
        const resp = await fetch(`/scada/api/pages/${id}`);
        if (resp.ok) {
          const pageRecord = (await resp.json()) as { id: string; name: string; content: string };
          if (pageRecord.content) {
            const rawPage = parseStoredPagePayload(pageRecord.content);
            const page = deserializePage(JSON.stringify(rawPage ?? {}));
            page.id = pageRecord.id;
            if (pageRecord.name && (!page.name || page.name === "未命名画面")) {
              page.name = pageRecord.name;
            }
            applyPageToStore(page, "加载");
            pageExistsOnServer.value = true;
            pageNameRequiredOnSave.value = isNewPlaceholderPageContent(pageRecord.content);
            message.success("已加载图纸");
            return;
          }
        }
      } catch (error) {}

      const draft = loadFromLocalStorage();
      if (draft) {
        draft.id = id;
        applyPageToStore(draft, "加载");
        message.success("已从本地缓存恢复图纸");
      } else {
        store.pageId = pageId();
        store.pageName = "未命名画面";
      }
    }

    // ── Import / Export ──────────────────────────────────────────────────────

    async function handleExport() {
      const page = await buildCurrentPage();
      if (!page) {
        return;
      }
      const payload = {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        page,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.pageName || "page"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success("已导出 JSON 文件");
    }

    function handleImport() {
      importInputRef.value?.click();
    }

    async function handleImportFile(file: File) {
      try {
        const text = await file.text();
        const page = parseImportedPage(text);
        const validation = validatePageModel(page);
        if (validation.errors.length > 0) {
          message.error(`导入失败：发现 ${validation.errors.length} 个配置错误`);
          return;
        }
        if (validation.warnings.length > 0) {
          message.warning(`导入完成，但有 ${validation.warnings.length} 个配置警告`);
        }
        applyPageToStore(page, "导入");
        message.success("图纸导入成功");
      } catch {
        message.error("导入失败：文件格式无效或内容损坏");
      } finally {
        if (importInputRef.value) {
          importInputRef.value.value = "";
        }
      }
    }

    function handleClearCanvas() {
      Modal.confirm({
        title: "确认清空画板？",
        content: "此操作将删除画板上所有图元及配置，无法撤销。",
        okText: "清空",
        okButtonProps: { danger: true },
        cancelText: "取消",
        onOk() {
          const g = store.graph;
          if (!g) {
            return;
          }
          g.clearCells();
          store.pageName = "未命名画面";
          store.pageWidth = 1920;
          store.pageHeight = 1080;
          store.pageBackground = "#f0f2f5";
          store.pageBackgroundImage = undefined;
          store.replaceGlobalState({});
          store.replaceAllTags([]);
          if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = null;
          }
          try {
            localStorage.removeItem(draftKey());
          } catch {
            /* ignore */
          }
          message.success("画板已清空");
        },
      });
    }

    // ── Preview (fixes T2: now calls bindingEngine.bind()) ───────────────────

    async function openPreview() {
      const page = await buildCurrentPage();
      if (!page) {
        return;
      }

      // Ensure previous preview subscriptions/timers are fully released
      // before creating a new preview session.
      bindingEngine.dispose();
      bindingEngine.clearStore();

      const tagConfig: Record<string, MockTagConfig> = {};
      for (const tag of store.pageTags) {
        tagConfig[tag.name] = {
          type: tag.type === "boolean" ? "boolean" : tag.type === "string" ? "string" : "number",
          min: (tag as TagDefinition).min,
          max: (tag as TagDefinition).max,
        };
      }

      // Preview should be stable: only change by explicit writes/actions.
      const newDriver = new MockDriver(tagConfig, 1000, { randomize: false });
      bindingEngine.setDriver(newDriver);
      bindingEngine.setGlobals(store.globalState);
      previewActionExecutor.setContext({ driver: newDriver, globals: store.globalState });

      newDriver.reset();
      // T2 fix: actually call bind() so the engine subscribes and updates the reactive store
      bindingEngine.bind(page.elements, page.aliases ?? []);

      previewPage.value = page;
      previewVisible.value = true;
    }

    // ── Auto-save wiring ─────────────────────────────────────────────────────

    let autoSaveListenersReady = false;
    watch(
      () => store.graph,
      async (graph) => {
        if (!graph) {
          return;
        }
        if (!autoSaveListenersReady) {
          autoSaveListenersReady = true;
          graph.on("node:added", scheduleSave);
          graph.on("node:removed", scheduleSave);
          graph.on("edge:added", scheduleSave);
          graph.on("edge:removed", scheduleSave);
        }
        if (pageLoadedOnce.value) {
          return;
        }
        pageLoadedOnce.value = true;
        await Promise.all([loadPageFromServer(), loadProjectName()]);
        await nextTick();
        scheduleSave();
      },
      { immediate: true },
    );

    watch(() => store.dataRevision, scheduleSave);
    watch(
      [() => store.pageName, () => store.pageWidth, () => store.pageHeight, () => store.pageBackground, () => store.pageBackgroundImage],
      scheduleSave,
    );
    watch(() => store.globalState, scheduleSave, { deep: true });

    // ── Preview action handling ───────────────────────────────────────────────

    async function executePreviewActions(elementId: string, actions: Action[]) {
      const controlAnimations = actions.filter((a) => a.type === "controlAnimation");
      const normalActions = actions.filter((a) => a.type !== "controlAnimation");
      if (normalActions.length > 0) {
        const page = previewPage.value;
        const elInst = page?.elements.find((e) => e.id === elementId) ?? null;
        previewPopupActionSource.current = elInst;
        try {
          const ordered = [...normalActions].sort((a, b) => {
            const score = (action: Action) => {
              if (action.type !== "toggleTag" && action.type !== "setTag") {
                return 1;
              }
              const tag = String(action.params?.tag ?? "");
              const def = store.pageTags.find((t) => t.name === tag);
              return def?.type === "boolean" ? 0 : 1;
            };
            return score(a) - score(b);
          });
          const elementOpts =
            elInst != null
              ? {
                  element: {
                    id: elInst.id,
                    type: elInst.type,
                    label: elInst.label,
                    deviceId: elInst.deviceId,
                  },
                }
              : { element: { id: elementId, type: "", label: undefined, deviceId: undefined } };
          await previewActionExecutor.execute(ordered, elementOpts);
        } finally {
          previewPopupActionSource.current = null;
        }
      }
      if (controlAnimations.length > 0) {
        const nodeEl = previewCanvasRef.value?.querySelector(`[data-preview-node-id="${elementId}"]`) as HTMLDivElement | null;
        if (!nodeEl) {
          return;
        }
        for (const action of controlAnimations) {
          runPreviewAnimation(nodeEl, action.params);
        }
      }
    }

    function previewConfiguredPopup(action: Action) {
      const base = scadaPopupFromActionConfig(action.params ?? {});
      const source = store.selectedInstance;
      const previewContext = source ? createPreviewPopupDeviceContext(source) : null;
      const event = previewContext ? enrichScadaPopupWithSource(base, previewContext.source, previewContext.readValue) : base;
      Modal.info({ title: event.title, content: renderPreviewPopupContent(event), width: 520 });
    }

    function runPreviewAnimation(target: HTMLDivElement, params: Record<string, any>) {
      const name = String(params?.animation ?? params?.name ?? params?.mode ?? "pulse").toLowerCase();
      if (name === "spin") {
        target.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 500, iterations: 1 });
        return;
      }
      target.animate(
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(1.08)", opacity: 0.88 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 360, iterations: 1 },
      );
    }

    const handleRuntimeElementEvent = ({ element, eventName, event }: RuntimeElementEvent) => {
      if (eventName === "contextmenu") {
        event.preventDefault();
      }
      const handlers = Array.isArray(element.eventHandlers) ? element.eventHandlers : [];
      const matched = handlers.filter((h) => h.event === eventName && Array.isArray(h.actions) && h.actions.length > 0);
      for (const handler of matched) {
        void executePreviewActions(element.id, handler.actions);
      }
    };

    return () => (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100% - 70px)", overflow: "hidden" }}>
        {/* Breadcrumb bar */}
        <div
          style={{
            height: "48px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => router.push(backPath.value)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#888",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: "12px" }} />
          </button>
          <Breadcrumb>
            {breadcrumbItems.value.map((item, idx) => (
              <Breadcrumb.Item key={idx}>
                {item.path ? (
                  <span style={{ cursor: "pointer", color: "#888", fontSize: "13px" }} onClick={() => router.push(item.path)}>
                    {item.label}
                  </span>
                ) : (
                  <span style={{ fontSize: "13px", color: "#333" }}>{item.label}</span>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <Button type="primary" onClick={() => void handleSave()}>
              保存画面
            </Button>
            <Button onClick={handleImport}>导入</Button>
            <Button onClick={() => void handleExport()}>导出</Button>
            <Button onClick={() => void openPreview()}>预览</Button>
          </div>
        </div>

        {/* Editor layout */}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <EditorLayout showDocumentActions={false} onPreviewPopup={previewConfiguredPopup} onClear={handleClearCanvas} />
        </div>

        {/* Hidden file input for import */}
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              void handleImportFile(file);
            }
          }}
        />

        {/* First-save name modal */}
        <Modal
          open={saveNameModalVisible.value}
          title="保存画面"
          okText="保存"
          cancelText="取消"
          destroyOnClose
          onOk={() => {
            void confirmPageNameAndSave();
          }}
          onCancel={() => {
            saveNameModalVisible.value = false;
          }}
        >
          <div style={{ marginBottom: "8px", color: "#595959" }}>画面名称</div>
          <Input
            value={pendingPageName.value}
            placeholder="请输入画面名称"
            autofocus
            onUpdate:value={(value: string) => {
              pendingPageName.value = value;
            }}
            onPressEnter={() => {
              void confirmPageNameAndSave();
            }}
          />
        </Modal>

        <Modal
          open={previewVisible.value}
          title={`预览 — ${previewPage.value?.name ?? "未命名画面"}`}
          footer={null}
          width="86vw"
          onCancel={() => {
            previewVisible.value = false;
          }}
          afterClose={() => {
            // Prevent old subscriptions from leaking into the next preview open.
            bindingEngine.dispose();
            bindingEngine.clearStore();
            previewPage.value = null;
          }}
        >
          <div
            style={{
              width: "100%",
              maxHeight: "72vh",
              overflow: "auto",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              background: "#fafafa",
              padding: "12px",
            }}
          >
            {previewPage.value && (
              <div
                ref={previewCanvasRef}
                style={{
                  position: "relative",
                  width: `${previewPage.value.width}px`,
                  height: `${previewPage.value.height}px`,
                  background: previewPage.value.background,
                  margin: "0 auto",
                  overflow: "hidden",
                }}
              >
                <RuntimeRenderer page={previewPage.value} bindingEngine={bindingEngine} onElementEvent={handleRuntimeElementEvent} />
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  },
});
