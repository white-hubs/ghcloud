import { PlusOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import type { ElementPropertyBinding } from "@cube-scada/core";
import { registry } from "@cube-scada/core";
import { Button, Input, Space } from "ant-design-vue";
import { defineComponent, computed } from "vue";

import { useEditorStore } from "../store/use-editor-store";

export const PropertyBindingsPanel = defineComponent({
  name: "PropertyBindingsPanel",
  setup() {
    const store = useEditorStore();

    const visible = computed(() => {
      const inst = store.selectedInstance;
      if (!inst) return false;
      return Boolean(registry.get(inst.type)?.inlinePropertyPanel);
    });

    const rows = computed((): ElementPropertyBinding[] => {
      const inst = store.selectedInstance;
      if (!inst) return [];
      return [...(inst.propertyBindings ?? [])];
    });

    function persist(next: ElementPropertyBinding[]) {
      const inst = store.selectedInstance;
      if (!inst) return;
      store.updateInstanceMeta(inst.id, { propertyBindings: next });
    }

    function addRow() {
      persist([...rows.value, { propCode: "", propName: "" }]);
    }

    function removeRow(index: number) {
      persist(rows.value.filter((_, i) => i !== index));
    }

    function patchRow(index: number, patch: Partial<ElementPropertyBinding>) {
      persist(rows.value.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    }

    return () => {
      if (!visible.value) return null;

      return (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 8 }}>
            决定属性面板在画布和运行端展示哪些产品属性。属性编码需与产品物模型编码一致，字段顺序即展示顺序；绑定设备后会填充实时值。
          </div>
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            {rows.value.map((row, index) => (
              <Space key={index} style={{ width: "100%", display: "flex" }} align="start" wrap>
                <Input
                  placeholder="属性编码"
                  value={row.propCode}
                  onChange={(e: { target: { value: string } }) => patchRow(index, { propCode: e?.target?.value ?? "" })}
                  style={{ minWidth: 100, flex: 1 }}
                />
                <Input
                  placeholder="显示名称"
                  value={row.propName}
                  onChange={(e: { target: { value: string } }) => patchRow(index, { propName: e?.target?.value ?? "" })}
                  style={{ minWidth: 100, flex: 1 }}
                />
                <Input
                  placeholder="单位"
                  value={row.unitName ?? ""}
                  onChange={(e: { target: { value: string } }) => patchRow(index, { unitName: e?.target?.value?.trim() || undefined })}
                  style={{ width: 72 }}
                />
                <Button type="text" danger onClick={() => removeRow(index)}>
                  <DeleteOutlined />
                </Button>
              </Space>
            ))}
            <Button block type="dashed" onClick={addRow}>
              <PlusOutlined /> 添加字段
            </Button>
          </Space>
        </div>
      );
    };
  },
});
