import { deserializePage, type ElementInstance, type PageModel } from "@cube-scada/core";
import { ActionExecutor, BindingEngine, ManualDriver } from "@cube-scada/engine";
import { RuntimeRenderer, type RuntimeElementEvent } from "@cube-scada/runtime";
import { enrichScadaPopupWithSource, scadaPopupFromActionConfig } from "@cube-scada/studio-sdk";
import { defineComponent, isProxy, onBeforeUnmount, onMounted, ref, toRaw, watch } from "vue";
import { useRoute } from "vue-router";

import { setupElements } from "../setup";

// Inline event payload type — mirrors ScadaElementEvent in @cube-scada/studio-sdk
// without creating a cross-package tsconfig rootDir conflict.
type ScadaEventType = "click" | "dblclick" | "contextmenu" | "mouseenter" | "mouseleave";
interface ScadaEventPayload {
  type: ScadaEventType;
  pageId: string;
  pageName: string;
  element: {
    id: string;
    type: string;
    name?: string;
    deviceNo?: string;
    props: Record<string, unknown>;
  };
}

type HostMsg = { type: string; [key: string]: unknown };

function deepToRaw(val: unknown): unknown {
  // 如果是 Proxy，先解开一层
  const raw = isProxy(val) ? toRaw(val) : val;

  // 如果不是对象或者是 null，直接返回
  if (raw === null || typeof raw !== "object") {
    return raw;
  }

  // 递归处理数组
  if (Array.isArray(raw)) {
    return raw.map((item: unknown) => deepToRaw(item));
  }

  // 递归处理普通对象
  const result: Record<string, unknown> = {};
  for (const key in raw) {
    result[key] = deepToRaw(raw[key as keyof typeof raw]);
  }
  return result;
}

function postToParent(msg: Record<string, unknown>): void {
  console.log("postToParent", msg);
  window.parent?.postMessage(deepToRaw(msg), "*");
}

export default defineComponent({
  name: "ViewerView",
  setup() {
    const route = useRoute();

    const page = ref<PageModel | null>(null);
    const containerRef = ref<HTMLDivElement>();
    const scale = ref(1);
    const offsetX = ref(0);
    const offsetY = ref(0);

    const driver = new ManualDriver();
    const bindingEngine = new BindingEngine();
    bindingEngine.setDriver(driver);

    const actionExecutor = new ActionExecutor();
    let popupActionSource: ElementInstance | null = null;
    actionExecutor.setContext({
      driver,
      navigate: (pageId: string) => {
        postToParent({ type: "scada:navigate", pageId });
      },
      showPopup: (config: Record<string, unknown>) => {
        const base = scadaPopupFromActionConfig(config);
        const ev = popupActionSource
          ? enrichScadaPopupWithSource(base, popupActionSource, (propCode) => driver.getTagValue(propCode))
          : base;
        postToParent({
          type: "scada:showPopup",
          popup: {
            title: ev.title,
            content: ev.content,
            contentId: ev.contentId,
            raw: ev.raw,
            sourceElement: ev.sourceElement,
            deviceBinding: ev.deviceBinding,
            style: ev.style,
            deviceData: ev.deviceData,
          },
        });
      },
      setElementVisibility: (elementId: string, visible: boolean) => {
        const current = page.value;
        if (!current || !current.elements.some((element) => element.id === elementId)) return;
        page.value = {
          ...current,
          elements: current.elements.map((element) => (element.id === elementId ? { ...element, visible } : element)),
        };
      },
    });

    let unbindPage: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;

    // ── Scale helpers ─────────────────────────────────────────────────────
    function computeScale(): void {
      const container = containerRef.value;
      const p = page.value;
      if (!container || !p) return;
      const cw = container.clientWidth || container.offsetWidth;
      const ch = container.clientHeight || container.offsetHeight;
      if (!cw || !ch) return;
      const s = Math.min(cw / p.width, ch / p.height);
      scale.value = s;
      offsetX.value = Math.max(0, (cw - p.width * s) / 2);
      offsetY.value = Math.max(0, (ch - p.height * s) / 2);
    }

    watch(page, () => {
      // Recompute once the page dimensions are known
      requestAnimationFrame(computeScale);
    });

    // ── PostMessage from host ─────────────────────────────────────────────
    function handleHostMessage(e: MessageEvent): void {
      const data = e.data as HostMsg | null;
      if (!data?.type) return;
      if (data.type === "scada:setTagValue" && typeof data.tag === "string") {
        driver.setTagValue(data.tag, data.value as string | number | boolean);
      }
    }

    // ── Element event + action execution ─────────────────────────────────
    async function handleElementEvent(runtimeEvent: RuntimeElementEvent): Promise<void> {
      const el = runtimeEvent.element;
      const eventName = runtimeEvent.eventName;

      // Only process elements that have handlers configured for this specific event type.
      // This prevents unbound events (e.g. mouseleave on a click-only element) from
      // being forwarded to SDK subscribers.
      const handlers = (el.eventHandlers ?? []).filter((h) => h.event === eventName);
      if (handlers.length === 0) return;

      for (const handler of handlers) {
        const controlAnims = handler.actions.filter((a) => a.type === "controlAnimation");
        const normalActions = handler.actions.filter((a) => a.type !== "controlAnimation");

        if (normalActions.length > 0) {
          const el = runtimeEvent.element;
          popupActionSource = el;
          try {
            await actionExecutor.execute(normalActions, {
              element: { id: el.id, type: el.type, label: el.label, deviceId: el.deviceId },
            });
          } finally {
            popupActionSource = null;
          }
        }

        if (controlAnims.length > 0) {
          const nodeEl = containerRef.value?.querySelector(`[data-preview-node-id="${el.id}"]`) as HTMLDivElement | null;
          if (nodeEl) {
            for (const action of controlAnims) {
              runControlAnimation(nodeEl, action.params as Record<string, unknown>);
            }
          }
        }
      }

      // Forward to host exactly once per (element, eventType) — even if the element
      // has multiple handlers for the same event, we only emit one SDK event.
      const currentPage = page.value;
      const scadaEvent: ScadaEventPayload = {
        type: eventName as ScadaEventType,
        pageId: currentPage?.id ?? "",
        pageName: currentPage?.name ?? "",
        element: {
          id: el.id,
          type: el.type,
          name: el.label,
          deviceNo: el.deviceId,
          props: el.props ?? {},
        },
      };
      postToParent({ type: "scada:elementEvent", event: scadaEvent });
    }

    function runControlAnimation(target: HTMLDivElement, params: Record<string, unknown>): void {
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

    // ── Lifecycle ─────────────────────────────────────────────────────────
    onMounted(async () => {
      window.addEventListener("message", handleHostMessage);

      resizeObserver = new ResizeObserver(computeScale);
      if (containerRef.value) resizeObserver.observe(containerRef.value);

      await setupElements();

      const pageParam = String(route.query.page ?? "");
      if (!pageParam) {
        postToParent({ type: "scada:error", message: "[运行端] 缺少 URL 参数 page" });
        return;
      }

      const globals: Record<string, unknown> = {};
      try {
        const rawVars = route.query.vars;
        if (rawVars && typeof rawVars === "string") {
          Object.assign(globals, JSON.parse(rawVars) as Record<string, unknown>);
        }
      } catch {
        /* ignore */
      }

      try {
        const pageModel = await fetchPage(pageParam, route.query.project as string | undefined);
        // Inject tag type config so ManualDriver coerces values correctly
        // (e.g. toggleTag's default 0/1 → false/true for boolean tags).
        driver.setTagTypes(pageModel.tags ?? []);
        bindingEngine.setGlobals(globals);
        actionExecutor.setContext({ globals });
        unbindPage = bindingEngine.bind(pageModel.elements, pageModel.aliases ?? []);
        page.value = pageModel;
        postToParent({
          type: "scada:ready",
          pageId: pageModel.id,
          pageName: pageModel.name,
          tags: pageModel.tags ?? [],
        });
      } catch (err) {
        postToParent({
          type: "scada:error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener("message", handleHostMessage);
      resizeObserver?.disconnect();
      unbindPage?.();
      bindingEngine.dispose();
    });

    // ── Render ────────────────────────────────────────────────────────────
    return () => {
      const p = page.value;
      return (
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            position: "relative",
            background: p?.background ?? "#f0f2f5",
          }}
        >
          {p ? (
            <div
              style={{
                position: "absolute",
                top: `${offsetY.value}px`,
                left: `${offsetX.value}px`,
                transformOrigin: "top left",
                transform: `scale(${scale.value})`,
              }}
            >
              <RuntimeRenderer page={p} bindingEngine={bindingEngine} onElementEvent={handleElementEvent} />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            >
              加载中…
            </div>
          )}
        </div>
      );
    };
  },
});

// ── Page fetch helper ─────────────────────────────────────────────────────

interface PageItem {
  id: string;
  name: string;
  project_id?: string | null;
}
interface PageDetail {
  id: string;
  name: string;
  content: string;
}

async function fetchPage(pageOrName: string, project?: string): Promise<PageModel> {
  const direct = await fetch(`/scada/api/pages/${encodeURIComponent(pageOrName)}`);
  if (direct.ok) {
    const d = (await direct.json()) as PageDetail;
    return deserializePage(d.content);
  }

  const listResp = await fetch("/scada/api/pages/");
  if (!listResp.ok) throw new Error(`[运行端] 获取画面列表失败: HTTP ${listResp.status}`);
  const list = (await listResp.json()) as PageItem[];

  const found = list.find((item) => {
    if (item.name !== pageOrName) return false;
    return !project || item.project_id === project;
  });
  if (!found) throw new Error(`[运行端] 未找到画面: "${pageOrName}"`);

  const detailResp = await fetch(`/scada/api/pages/${encodeURIComponent(found.id)}`);
  if (!detailResp.ok) throw new Error(`[运行端] 加载画面失败: HTTP ${detailResp.status}`);
  const d = (await detailResp.json()) as PageDetail;
  return deserializePage(d.content);
}
