import type { ScadaPopupEvent } from "@cube-scada/studio-sdk";

/**
 * 按组态「弹出窗口」动作中的 {@link ScadaPopupEvent.contentId} 渲染宿主侧 UI。
 * 返回内容会与纯文本及设备 label/value 数据组合展示；返回 `null` 时跳过自定义区域。
 */
export function renderScadaPopupCustomBody(event: ScadaPopupEvent): JSX.Element | null {
  switch (event.contentId) {
    case "demo-trend":
      return (
        <div style={{ padding: "8px 0" }}>
          <p style={{ margin: "0 0 8px" }}>自定义弹窗示例：此处可接入 ECharts、表格、路由子页面等。</p>
          <div
            style={{
              height: "120px",
              background: "linear-gradient(90deg,#e0f2fe,#bae6fd)",
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              color: "#0369a1",
              fontSize: "14px",
              fontFamily: "monospace",
            }}
          >
            contentId = demo-trend
          </div>
        </div>
      );
    case "demo-device":
      return (
        <div>
          <p style={{ margin: "0 0 6px" }}>
            <strong>设备详情（scada-demo 自定义）</strong>
          </p>
          <p style={{ margin: 0 }}>动作原始参数 `raw`，可扩展字段供宿主路由或请求使用：</p>
          <pre
            style={{
              margin: "8px 0 0",
              padding: "8px",
              background: "#f9fafb",
              borderRadius: "6px",
              fontSize: "11px",
              overflow: "auto",
              maxHeight: "200px",
            }}
          >
            {JSON.stringify(event.raw, null, 2)}
          </pre>
        </div>
      );
    default:
      return null;
  }
}
