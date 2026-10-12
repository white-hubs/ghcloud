import { registry } from "@cube-scada/core";
import { Button, Form, FormItem, InputNumber, Slider, Space } from "ant-design-vue";
import { defineComponent } from "vue";

import { useEditorStore } from "../store/use-editor-store";

const MIN_SIZE = 1;
const MAX_SIZE = 10_000;

function roundSize(value: number): number {
  return Math.round(value * 100) / 100;
}

function toFiniteNumber(value: number | string | null): number | null {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export const AppearancePanel = defineComponent({
  name: "AppearancePanel",
  setup() {
    const store = useEditorStore();

    const updateSize = (dimension: "width" | "height", value: number | string | null) => {
      const inst = store.selectedInstance;
      const parsed = toFiniteNumber(value);
      if (!inst || parsed === null) return;
      store.updateElementAppearance(inst.id, { [dimension]: parsed });
    };

    const scaleBy = (factor: number) => {
      const inst = store.selectedInstance;
      if (!inst) return;
      store.updateElementAppearance(inst.id, {
        width: roundSize(inst.width * factor),
        height: roundSize(inst.height * factor),
      });
    };

    const resetSize = () => {
      const inst = store.selectedInstance;
      if (!inst) return;
      const defaultSize = registry.get(inst.type)?.defaultSize;
      if (!defaultSize) return;
      store.updateElementAppearance(inst.id, defaultSize);
    };

    const updateRotation = (rotation: number | string | null) => {
      const inst = store.selectedInstance;
      const parsed = toFiniteNumber(rotation);
      if (!inst || parsed === null) return;
      store.updateElementAppearance(inst.id, { rotation: parsed });
    };

    const rotateBy = (delta: number) => {
      const inst = store.selectedInstance;
      if (!inst) return;
      store.updateElementAppearance(inst.id, { rotation: inst.rotation + delta });
    };

    const updateOpacityPercent = (percent: number | string | null) => {
      const inst = store.selectedInstance;
      const parsed = toFiniteNumber(percent);
      if (!inst || parsed === null) return;
      store.updateElementAppearance(inst.id, { opacity: parsed / 100 });
    };

    return () => {
      const inst = store.selectedInstance;
      if (!inst) return null;
      const opacityPercent = Math.round((inst.opacity ?? 1) * 100);

      return (
        <Form layout="vertical" size="small">
          <FormItem label="尺寸（像素）">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <InputNumber
                value={inst.width}
                min={MIN_SIZE}
                max={MAX_SIZE}
                precision={2}
                addonBefore="宽"
                onChange={(value) => updateSize("width", value)}
              />
              <InputNumber
                value={inst.height}
                min={MIN_SIZE}
                max={MAX_SIZE}
                precision={2}
                addonBefore="高"
                onChange={(value) => updateSize("height", value)}
              />
            </div>
          </FormItem>

          <FormItem label="等比缩放" tooltip="基于当前尺寸按比例放大或缩小">
            <Space wrap>
              <Button size="small" onClick={() => scaleBy(0.9)}>
                缩小 10%
              </Button>
              <Button size="small" onClick={() => scaleBy(1.1)}>
                放大 10%
              </Button>
              <Button size="small" onClick={resetSize}>
                原始大小
              </Button>
            </Space>
          </FormItem>

          <FormItem label="旋转角度">
            <InputNumber
              value={inst.rotation}
              min={0}
              max={359}
              precision={0}
              addonAfter="°"
              style={{ width: "100%" }}
              onChange={updateRotation}
            />
            <Space wrap style={{ marginTop: "8px" }}>
              <Button size="small" onClick={() => rotateBy(-90)}>
                左转 90°
              </Button>
              <Button size="small" onClick={() => rotateBy(90)}>
                右转 90°
              </Button>
              <Button size="small" onClick={() => updateRotation(0)}>
                归零
              </Button>
            </Space>
          </FormItem>

          <FormItem label="透明度">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 76px", gap: "12px", alignItems: "center" }}>
              <Slider
                min={0}
                max={100}
                value={opacityPercent}
                onChange={(value) => {
                  if (typeof value === "number") updateOpacityPercent(value);
                }}
              />
              <InputNumber min={0} max={100} precision={0} value={opacityPercent} addonAfter="%" onChange={updateOpacityPercent} />
            </div>
          </FormItem>
        </Form>
      );
    };
  },
});
