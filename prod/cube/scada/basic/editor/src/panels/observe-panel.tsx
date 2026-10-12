import { registry } from "@cube-scada/core";
import { Collapse, CollapsePanel, Empty, Button, Modal } from "ant-design-vue";
import { defineComponent, ref, computed } from "vue";

import { useEditorStore } from "../store/use-editor-store";
import { AppearancePanel } from "./appearance-panel";
import { BindingsPanel } from "./bindings-panel";
import { EdgePropertiesPanel } from "./edge-properties-panel";
import { NodePortsPanel } from "./node-ports-panel";
import { PropertiesPanel } from "./properties-panel";
import { PropertyBindingsPanel } from "./property-bindings-panel";
import { ValidationPanel } from "./validation-panel";

export const ObservePanel = defineComponent({
  name: "ObservePanel",
  setup() {
    const store = useEditorStore();
    const validationVisible = ref(false);

    const showInlinePropertyPanel = computed(() => {
      const inst = store.selectedInstance;
      if (!inst) return false;
      return Boolean(registry.get(inst.type)?.inlinePropertyPanel);
    });

    return () => {
      // 连线被选中时，显示连线样式面板
      if (store.selectedEdgeId && !store.selectedInstance) {
        return (
          <div>
            <div
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#333",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              连线样式
            </div>
            <EdgePropertiesPanel />
          </div>
        );
      }

      if (!store.selectedInstance) {
        return (
          <Empty
            description={
              <span>
                未选中图元
                <br />
                <span style="color: #999; font-size: 12px">← 从左侧图元库拖入图元，或点击画布中的图元开始配置</span>
              </span>
            }
            style="padding: 24px"
          />
        );
      }

      return (
        <div style="padding: 12px">
          <Collapse defaultActiveKey={["meta", "appearance", "observeProps", "bindings", "ports"]}>
            <CollapsePanel key="meta" header="图元信息">
              <PropertiesPanel domain="all" showMeta={true} showProps={false} />
            </CollapsePanel>
            <CollapsePanel key="appearance" header="外观与变换">
              <AppearancePanel />
            </CollapsePanel>
            <CollapsePanel key="observeProps" header="属性配置">
              <PropertiesPanel domain="observe" showMeta={false} />
            </CollapsePanel>
            <CollapsePanel key="bindings" header="Tag / 点位绑定">
              <BindingsPanel domain="observe" />
            </CollapsePanel>
            {showInlinePropertyPanel.value ? (
              <CollapsePanel key="productFields" header="产品字段（属性面板内展示）">
                <PropertyBindingsPanel />
              </CollapsePanel>
            ) : null}
            <CollapsePanel key="ports" header="连接点配置">
              <NodePortsPanel />
            </CollapsePanel>
          </Collapse>
          <Button block style="margin-top: 12px" onClick={() => (validationVisible.value = true)}>
            配置预检
          </Button>
          <Modal
            title="配置预检"
            open={validationVisible.value}
            footer={null}
            width={640}
            onCancel={() => (validationVisible.value = false)}
          >
            <ValidationPanel />
          </Modal>
        </div>
      );
    };
  },
});
