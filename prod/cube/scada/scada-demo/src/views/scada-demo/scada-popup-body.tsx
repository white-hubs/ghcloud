import type { ScadaPopupDeviceDatum, ScadaPopupEvent } from "@cube-scada/studio-sdk";
import { defineComponent, type PropType } from "vue";

import { renderScadaPopupCustomBody } from "./scada-popup-custom";

const DeviceDatum = defineComponent({
  name: "ScadaPopupDeviceDatum",
  props: {
    item: { type: Object as PropType<ScadaPopupDeviceDatum>, required: true },
    event: { type: Object as PropType<ScadaPopupEvent>, required: true },
  },
  setup(props) {
    return () => {
      const style = props.event.style.device;
      const stacked = style.layout === "columns";
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: stacked ? "1fr" : "minmax(0, 1fr) auto",
            gap: stacked ? `${Math.max(4, style.rowGap / 2)}px` : `${style.columnGap}px`,
            alignItems: "center",
            minWidth: 0,
            padding: "10px 12px",
            border: "1px solid #f0f0f0",
            borderRadius: "6px",
            background: "#fafafa",
            textAlign: style.textAlign,
          }}
        >
          <span
            style={{
              minWidth: 0,
              overflowWrap: "anywhere",
              fontSize: `${style.labelFontSize}px`,
              color: style.labelColor,
              fontWeight: style.labelFontWeight,
            }}
          >
            {props.item.label}
          </span>
          <span
            style={{
              minWidth: 0,
              overflowWrap: "anywhere",
              fontSize: `${style.valueFontSize}px`,
              color: style.valueColor,
              fontWeight: style.valueFontWeight,
            }}
          >
            {props.item.value}
          </span>
        </div>
      );
    };
  },
});

export const ScadaPopupBody = defineComponent({
  name: "ScadaPopupBody",
  props: {
    event: { type: Object as PropType<ScadaPopupEvent>, required: true },
  },
  setup(props) {
    return () => {
      const event = props.event;
      const customBody = renderScadaPopupCustomBody(event);
      const contentStyle = event.style.content;
      const hasCustomContent = customBody != null || event.content.length > 0;
      const showDeviceData = event.deviceBinding === "required";
      const hasAnyContent = hasCustomContent || showDeviceData;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {hasCustomContent ? (
            <section
              style={{
                minWidth: 0,
                color: contentStyle.color,
                fontSize: `${contentStyle.fontSize}px`,
                fontWeight: contentStyle.fontWeight,
                lineHeight: contentStyle.lineHeight,
                textAlign: contentStyle.textAlign,
              }}
            >
              {customBody}
              {event.content ? <div style={{ marginTop: customBody ? "12px" : 0, whiteSpace: "pre-wrap" }}>{event.content}</div> : null}
            </section>
          ) : null}

          {showDeviceData ? (
            <section style={{ minWidth: 0 }}>
              {event.deviceData.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: event.style.device.layout === "columns" ? "repeat(auto-fit, minmax(140px, 1fr))" : "1fr",
                    rowGap: `${event.style.device.rowGap}px`,
                    columnGap: `${event.style.device.columnGap}px`,
                  }}
                >
                  {event.deviceData.map((item) => (
                    <DeviceDatum key={item.propCode} item={item} event={event} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: "12px", color: "#8c8c8c", textAlign: event.style.device.textAlign }}>尚未配置设备属性绑定</div>
              )}
            </section>
          ) : null}

          {!hasAnyContent ? <div style={{ color: "#8c8c8c" }}>（空内容）</div> : null}
        </div>
      );
    };
  },
});
