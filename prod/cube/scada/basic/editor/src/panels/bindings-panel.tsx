import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { registry, type Binding, type PropDomain } from "@cube-scada/core";
import { Table, Button, Drawer, Form, FormItem, Select, Input, Empty, Space, Popconfirm, message, Alert } from "ant-design-vue";
import { defineComponent, ref, computed, type PropType } from "vue";

import { TagSelectWithCreate } from "../components/tag-select-with-create";
import { useFieldDictionary, type TagValueType } from "../hooks/use-field-dictionary";
import { useEditorStore } from "../store/use-editor-store";

export const BindingsPanel = defineComponent({
  name: "BindingsPanel",
  props: {
    domain: { type: String as PropType<PropDomain | "all">, default: "observe" },
  },
  setup(props) {
    const store = useEditorStore();
    const { options: tagOptions, loading: tagLoading } = useFieldDictionary();
    const drawerVisible = ref(false);
    const editingIndex = ref(-1);
    const form = ref<Partial<Binding>>({});

    const def = computed(() => {
      const inst = store.selectedInstance;
      return inst ? registry.get(inst.type) : undefined;
    });

    const propOptions = computed(() => {
      if (!def.value) return [];
      return def.value.propsSchema
        .filter((s) => {
          if (props.domain === "all") return true;
          return (s.domain ?? "observe") === props.domain;
        })
        .map((s) => ({
          label: s.label,
          value: s.name,
        }));
    });

    // prop type → compatible tag types
    const PROP_TO_TAG_TYPES: Record<string, TagValueType[]> = {
      boolean: ["boolean"],
      number: ["number"],
      string: ["string"],
      color: ["string"],
      select: ["string", "number", "boolean"],
    };

    const typeMismatchWarning = computed(() => {
      const propName = form.value.propName;
      const tagName = form.value.tagName;
      const hasTransform = !!form.value.transform?.trim();
      if (!propName || !tagName || hasTransform) return null;

      const propSchema = def.value?.propsSchema.find((s) => s.name === propName);
      const tagDef = store.pageTags.find((t) => t.name === tagName);
      if (!propSchema || !tagDef) return null;

      const compatible = PROP_TO_TAG_TYPES[propSchema.type] ?? [];
      if (!compatible.includes(tagDef.type as TagValueType)) {
        return `属性 "${propName}" 期望 ${propSchema.type}，但点位 "${tagName}" 类型为 ${tagDef.type}，建议添加转换表达式。`;
      }
      return null;
    });

    const globalTokenOptions = computed(() =>
      Object.keys(store.globalState).map((key) => ({
        label: `\${global.${key}}`,
        value: `\${global.${key}}`,
      })),
    );

    function appendGlobalToken(token: string) {
      const current = form.value.tagName ?? "";
      form.value.tagName = current ? `${current}${token}` : token;
    }

    function openAdd() {
      editingIndex.value = -1;
      form.value = {
        id: `b-${Date.now()}`,
        propName: "",
        tagName: "",
        transform: undefined,
      };
      drawerVisible.value = true;
    }

    function openEditById(bindingId: string) {
      const inst = store.selectedInstance;
      if (!inst) return;
      const index = inst.bindings.findIndex((binding) => binding.id === bindingId);
      if (index < 0) return;
      editingIndex.value = index;
      form.value = { ...inst.bindings[index] };
      drawerVisible.value = true;
    }

    function toTagsValue(value: unknown): string[] {
      if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
      if (typeof value === "string" && value.length > 0) return [value];
      return [];
    }

    function save() {
      const inst = store.selectedInstance;
      if (!inst || !form.value.propName) return;

      if (typeMismatchWarning.value) {
        void message.warning(typeMismatchWarning.value);
      }

      const bindings = [...inst.bindings];
      const existingBinding = editingIndex.value >= 0 ? bindings[editingIndex.value] : undefined;
      const binding: Binding = {
        ...existingBinding,
        id: form.value.id || `b-${Date.now()}`,
        propName: form.value.propName!,
        tagName: form.value.tagName || "",
        transform: form.value.transform || undefined,
      };

      if (editingIndex.value >= 0) {
        bindings[editingIndex.value] = binding;
      } else {
        bindings.push(binding);
      }

      store.updateBindings(inst.id, bindings);
      drawerVisible.value = false;
    }

    function removeById(bindingId: string) {
      const inst = store.selectedInstance;
      if (!inst) return;
      const bindings = inst.bindings.filter((binding) => binding.id !== bindingId);
      store.updateBindings(inst.id, bindings);
    }

    const columns = [
      { title: "属性", dataIndex: "propName", key: "propName", width: 80 },
      { title: "逻辑 Tag", dataIndex: "tagName", key: "tagName", ellipsis: true },
      {
        title: "操作",
        key: "action",
        width: 80,
        customRender: ({ record }: any) => (
          <Space size={4}>
            <Button type="link" size="small" onClick={() => openEditById(record.id)}>
              <EditOutlined />
            </Button>
            <Popconfirm title="确认删除？" onConfirm={() => removeById(record.id)}>
              <Button type="link" size="small" danger>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return () => {
      const inst = store.selectedInstance;
      if (!inst || !def.value) {
        return <Empty description="未选中图元" style="padding: 24px" />;
      }
      const allowedPropNames = new Set(propOptions.value.map((item) => item.value));
      const visibleBindings = inst.bindings.filter((binding) => {
        if (props.domain === "all") return true;
        return allowedPropNames.has(binding.propName);
      });

      return (
        <div style="padding: 12px">
          <Button type="dashed" block onClick={openAdd} style="margin-bottom: 12px">
            <PlusOutlined /> 添加绑定
          </Button>

          <Table columns={columns} dataSource={visibleBindings} rowKey="id" size="small" pagination={false} />

          <Drawer
            title={editingIndex.value >= 0 ? "编辑绑定" : "添加绑定"}
            open={drawerVisible.value}
            onClose={() => (drawerVisible.value = false)}
            width={360}
            footer={
              <Space>
                <Button onClick={() => (drawerVisible.value = false)}>取消</Button>
                <Button type="primary" onClick={save}>
                  确定
                </Button>
              </Space>
            }
          >
            <Form layout="vertical" size="small">
              <FormItem label="绑定属性">
                <Select
                  value={form.value.propName}
                  options={propOptions.value}
                  placeholder="选择属性"
                  onChange={(v: any) => (form.value.propName = v)}
                />
              </FormItem>
              <FormItem label="逻辑 Tag (Tag / Alias)">
                <TagSelectWithCreate
                  value={form.value.tagName ?? ""}
                  tagOptions={tagOptions.value}
                  onChange={(v) => (form.value.tagName = v)}
                />
                <div style={{ marginTop: "4px", color: "#999", fontSize: "12px" }}>
                  Demo 中可将产品属性映射到此逻辑 Tag，无需重复选择图元属性。
                </div>
              </FormItem>
              <FormItem label="插入全局变量">
                <Space wrap>
                  {globalTokenOptions.value.length === 0 ? (
                    <span style="color:#999">暂无可插入变量</span>
                  ) : (
                    globalTokenOptions.value.map((item) => (
                      <Button key={item.value} size="small" onClick={() => appendGlobalToken(item.value)}>
                        {item.label}
                      </Button>
                    ))
                  )}
                </Space>
              </FormItem>
              {typeMismatchWarning.value && (
                <Alert
                  type="warning"
                  showIcon
                  message="类型不匹配"
                  description={typeMismatchWarning.value}
                  style={{ marginBottom: "12px" }}
                />
              )}
              <FormItem label="转换表达式 (可选)">
                <Input.TextArea
                  value={form.value.transform}
                  placeholder="例如: value === true ? 'red' : 'green'  （用 value 引用当前点位值，或用点位路径如 props.running）"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                  onChange={(e: any) => (form.value.transform = e.target?.value ?? e)}
                />
              </FormItem>
            </Form>
          </Drawer>
        </div>
      );
    };
  },
});
