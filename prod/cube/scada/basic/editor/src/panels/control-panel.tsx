import type { Action } from "@cube-scada/core";
import { Collapse, CollapsePanel, Empty, List, Tag, Alert } from "ant-design-vue";
import { defineComponent, type PropType } from "vue";

import { useEditorStore } from "../store/use-editor-store";
import { EventsPanel } from "./events-panel";
import { PropertiesPanel } from "./properties-panel";

export const ControlPanel = defineComponent({
  name: "ControlPanel",
  props: {
    onPreviewPopup: { type: Function as PropType<(action: Action) => void>, default: undefined },
  },
  setup(props) {
    const store = useEditorStore();

    return () => {
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
      const controlModel = store.selectedControlModel;
      const controlSchemas = controlModel?.schemas ?? [];

      return (
        <div style="padding: 12px">
          <Collapse defaultActiveKey={["controlSummary", "controlProps", "actions"]}>
            <CollapsePanel key="controlSummary" header="控制字段总览">
              {controlSchemas.length === 0 ? (
                <Alert
                  type="info"
                  showIcon
                  message="当前图元未声明控制字段"
                  description="如需控制能力，请在图元协议中新增 domain=control 的 scada:prop。"
                />
              ) : (
                <List
                  size="small"
                  bordered
                  dataSource={controlSchemas}
                  renderItem={(schema: any) => (
                    <List.Item>
                      <div style="display:flex; align-items:center; gap:8px; width:100%">
                        <span style="font-weight:500">{schema.label}</span>
                        <Tag>{schema.type}</Tag>
                        {schema.semantic && <Tag color="blue">{schema.semantic}</Tag>}
                        {schema.controllable === true ? <Tag color="green">可控制</Tag> : <Tag color="gold">不可控制</Tag>}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </CollapsePanel>
            <CollapsePanel key="controlProps" header="控制属性">
              <PropertiesPanel domain="control" showMeta={false} />
            </CollapsePanel>
            <CollapsePanel key="actions" header="事件与动作">
              <EventsPanel onPreviewPopup={props.onPreviewPopup} />
            </CollapsePanel>
          </Collapse>
        </div>
      );
    };
  },
});
