import { registry, type PropDomain, type DeviceBindingMode } from "@cube-scada/core";
import { Form, FormItem, Input, Empty, Select } from "ant-design-vue";
import { defineComponent, computed, type PropType } from "vue";

import { useEditorStore } from "../store/use-editor-store";
import { PropField } from "./prop-field";

export const PropertiesPanel = defineComponent({
  name: "PropertiesPanel",
  props: {
    domain: { type: String as PropType<PropDomain | "all">, default: "all" },
    showMeta: { type: Boolean, default: true },
    showProps: { type: Boolean, default: true },
  },
  setup(props) {
    const store = useEditorStore();

    const def = computed(() => {
      const inst = store.selectedInstance;
      return inst ? registry.get(inst.type) : undefined;
    });

    return () => {
      const inst = store.selectedInstance;
      if (!inst || !def.value) {
        return <Empty description="未选中图元" style="padding: 24px" />;
      }

      return (
        <Form layout="vertical" size="small" style="padding: 12px">
          {props.showMeta && (
            <>
              <FormItem label="ID">
                <span style="font-family: monospace; font-size: 12px; color: #999">{inst.id}</span>
              </FormItem>
              <FormItem label="类型">
                <span>{def.value.label}</span>
              </FormItem>
              <FormItem label="图元名称" tooltip="工程师自定义标签，如 P-101，显示在画布上">
                <Input
                  value={inst.label ?? ""}
                  placeholder="例如: P-101"
                  onChange={(e: any) => store.updateInstanceMeta(inst.id, { label: e.target?.value ?? "" })}
                />
              </FormItem>
              <FormItem label="初始显示状态" tooltip="隐藏状态会在编辑画布中保留半透明占位，在预览和运行端中不显示">
                <Select
                  value={inst.visible === false ? "hidden" : "visible"}
                  options={[
                    { label: "显示", value: "visible" },
                    { label: "隐藏", value: "hidden" },
                  ]}
                  onChange={(value: string) => store.updateInstanceMeta(inst.id, { visible: value === "visible" })}
                />
              </FormItem>
              <FormItem
                label="运行端设备绑定"
                tooltip="组态不连接真实设备。选「需要」时，运行端（如 scada-demo）可为该图元选配模拟设备，弹窗内可展示对应动态数据。"
              >
                <Select<DeviceBindingMode>
                  style={{ width: "100%" }}
                  value={(inst.deviceBinding ?? "off") as DeviceBindingMode}
                  options={[
                    { label: "不需要", value: "off" },
                    { label: "需要运行端绑定设备", value: "required" },
                  ]}
                  onChange={(v: DeviceBindingMode) => store.updateInstanceMeta(inst.id, { deviceBinding: v })}
                />
              </FormItem>
              {(inst.deviceBinding ?? "off") === "required" ? (
                <FormItem
                  label="属性绑定名称"
                  tooltip="运行端配置产品与属性绑定时用此名称区分图元；可与上方「图元名称」不同，建议在同一画面内可读且尽量唯一。"
                >
                  <Input
                    value={inst.propertyBindName ?? ""}
                    placeholder="例如: 主泵运行状态"
                    onChange={(e: any) => store.updateInstanceMeta(inst.id, { propertyBindName: e.target?.value ?? "" })}
                  />
                </FormItem>
              ) : null}
              <FormItem label="设备备注" tooltip="可选备注（非运行端绑定依据；真实设备绑定在运行端完成）">
                <Input
                  value={inst.deviceId ?? ""}
                  placeholder="例如: EQ-2024-001"
                  onChange={(e: any) => store.updateInstanceMeta(inst.id, { deviceId: e.target?.value ?? "" })}
                />
              </FormItem>
            </>
          )}
          {props.showProps &&
            def.value.propsSchema
              .filter((schema) => {
                if (props.domain === "all") return true;
                return (schema.domain ?? "observe") === props.domain;
              })
              .map((schema) => (
                <FormItem key={schema.name} label={schema.label}>
                  <PropField
                    schema={schema}
                    value={inst.props[schema.name] ?? schema.default}
                    onChange={(v: any) => store.updateProp(inst.id, schema.name, v)}
                  />
                </FormItem>
              ))}
        </Form>
      );
    };
  },
});
