import { resolveViewportMetrics, type ViewportMetrics } from "./viewport-metrics";

export const VIEWPORT_METRICS_CHANGE_EVENT = "ue5:viewport-metrics-change";

let stopActiveCoordinator: (() => void) | null = null;

const readCssViewport = (): { width: number; height: number } => {
  const root = document.documentElement;
  return {
    width: root.clientWidth || window.innerWidth,
    height: root.clientHeight || window.innerHeight,
  };
};

export const buildViewportCssPayload = (metrics: ViewportMetrics) => ({
  signature: `${metrics.viewportWidth}:${metrics.viewportHeight}:${metrics.uiScale}:${metrics.mode}:${metrics.panelWidthPx}`,
  fontSize: `${metrics.rootFontSize}px`,
  bodyFontSize: `${metrics.bodyFontSize}px`,
  dataset: {
    viewportSignature: `${metrics.viewportWidth}:${metrics.viewportHeight}:${metrics.uiScale}:${metrics.mode}:${metrics.panelWidthPx}`,
    viewportMode: metrics.mode,
  },
  properties: {
    "--ue5-ui-scale": String(metrics.uiScale),
    "--ue5-raw-scale": String(metrics.rawScale),
    "--ue5-width-scale": String(metrics.widthScale),
    "--ue5-viewport-width": `${metrics.viewportWidth}px`,
    "--ue5-viewport-height": `${metrics.viewportHeight}px`,
    "--ue5-panel-width": metrics.rootFontSize > 0 ? `${metrics.panelWidthPx / metrics.rootFontSize}rem` : `${metrics.panelWidthPx}px`,
    "--scale": "1",
    "--font-size-scale": "1",
    "--ue5-panel-scale-x": "none",
    "--ue5-panel-scale-y": "none",
  },
});

const applyViewportMetrics = (metrics: ViewportMetrics): void => {
  const root = document.documentElement;
  const payload = buildViewportCssPayload(metrics);
  if (root.dataset.viewportSignature === payload.signature) return;

  root.dataset.viewportSignature = payload.dataset.viewportSignature;
  root.dataset.viewportMode = payload.dataset.viewportMode;
  root.style.fontSize = payload.fontSize;
  if (document.body) {
    document.body.style.fontSize = payload.bodyFontSize;
  }
  for (const [name, value] of Object.entries(payload.properties)) {
    root.style.setProperty(name, value);
  }

  window.dispatchEvent(
    new CustomEvent<ViewportMetrics>(VIEWPORT_METRICS_CHANGE_EVENT, {
      detail: metrics,
    }),
  );
};

export const setupViewportCoordinator = (): (() => void) => {
  stopActiveCoordinator?.();

  let frame = 0;
  const update = (): void => {
    frame = 0;
    const viewport = readCssViewport();
    applyViewportMetrics(resolveViewportMetrics(viewport.width, viewport.height));
  };
  const scheduleUpdate = (): void => {
    if (frame !== 0) return;
    frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("orientationchange", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  document.addEventListener("fullscreenchange", scheduleUpdate);
  window.visualViewport?.addEventListener("resize", scheduleUpdate);

  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          scheduleUpdate();
        });
  resizeObserver?.observe(document.documentElement);

  update();

  const stop = (): void => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", scheduleUpdate);
    window.removeEventListener("orientationchange", scheduleUpdate);
    window.removeEventListener("pageshow", scheduleUpdate);
    document.removeEventListener("fullscreenchange", scheduleUpdate);
    window.visualViewport?.removeEventListener("resize", scheduleUpdate);
    resizeObserver?.disconnect();
    if (stopActiveCoordinator === stop) stopActiveCoordinator = null;
  };

  stopActiveCoordinator = stop;
  return stop;
};
