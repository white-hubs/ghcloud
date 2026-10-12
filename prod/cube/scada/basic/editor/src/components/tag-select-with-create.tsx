import { PlusOutlined } from "@ant-design/icons-vue";
import { Select, Button, Modal, Form, FormItem, Input, InputNumber } from "ant-design-vue";
import { defineComponent, ref, type PropType } from "vue";

import type { TagOption } from "../hooks/use-field-dictionary";
import { useEditorStore } from "../store/use-editor-store";

const TYPE_OPTIONS = [
  { label: "boolean", value: "boolean" },
  { label: "number", value: "number" },
  { label: "string", value: "string" },
];

export const TagSelectWithCreate = defineComponent({
  name: "TagSelectWithCreate",
  props: {
    value: { type: String, default: "" },
    onChange: { type: Function as PropType<(v: string) => void>, required: true },
    tagOptions: { type: Array as () => TagOption[], required: true },
  },
  setup(props) {
    const store = useEditorStore();
    const modalOpen = ref(false);
    const form = ref({
      name: "",
      type: "boolean" as "boolean" | "number" | "string",
      label: "",
      min: undefined as number | undefined,
      max: undefined as number | undefined,
    });

    function openModal() {
      form.value = { name: "", type: "boolean", label: "", min: undefined, max: undefined };
      modalOpen.value = true;
    }

    function handleSave() {
      const name = form.value.name.trim();
      if (!name) return;
      store.addTag({
        name,
        type: form.value.type,
        label: form.value.label || undefined,
        min: form.value.type === "number" ? form.value.min : undefined,
        max: form.value.type === "number" ? form.value.max : undefined,
      });
      props.onChange(name);
      modalOpen.value = false;
    }

    return () => {
      const selectOptions = props.tagOptions.map((o) => ({
        label: o.label,
        value: o.value,
      }));

      return (
        <>
          <Select
            value={props.value || undefined}
            showSearch
            allowClear
            options={selectOptions}
            placeholder="选择或创建点位"
            filterOption={(input: string, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase()) ||
              (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={(v: any) => props.onChange(v ?? "")}
            style="width: 100%"
            v-slots={{
              dropdownRender: ({ menuNode }: any) => (
                <div>
                  {menuNode}
                  <div style={{ borderTop: "1px solid #f0f0f0", padding: "6px 8px" }}>
                    <Button
                      type="link"
                      size="small"
                      style="padding: 0; width: 100%; text-align: left"
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        openModal();
                      }}
                    >
                      <PlusOutlined /> 创建点位
                    </Button>
                  </div>
                </div>
              ),
            }}
          />

          <Modal
            open={modalOpen.value}
            title="创建点位"
            okText="创建并选择"
            cancelText="取消"
            onOk={handleSave}
            onCancel={() => (modalOpen.value = false)}
          >
            <Form layout="vertical" size="small" style={{ marginTop: "8px" }}>
              <FormItem label="点位名称" required>
                <Input
                  value={form.value.name}
                  placeholder="例如: pump1.speed"
                  onChange={(e: any) => (form.value.name = e.target?.value ?? e)}
                  onPressEnter={handleSave}
                />
              </FormItem>
              <FormItem label="数据类型">
                <Select value={form.value.type} options={TYPE_OPTIONS} onChange={(v: any) => (form.value.type = v)} style="width: 100%" />
              </FormItem>
              {form.value.type === "number" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <FormItem label="最小值" style={{ flex: "1" }}>
                    <InputNumber
                      value={form.value.min}
                      placeholder="不限"
                      style={{ width: "100%" }}
                      onChange={(v: any) => (form.value.min = v ?? undefined)}
                    />
                  </FormItem>
                  <FormItem label="最大值" style={{ flex: "1" }}>
                    <InputNumber
                      value={form.value.max}
                      placeholder="不限"
                      style={{ width: "100%" }}
                      onChange={(v: any) => (form.value.max = v ?? undefined)}
                    />
                  </FormItem>
                </div>
              )}
              <FormItem label="显示标签（可选）">
                <Input
                  value={form.value.label}
                  placeholder="用于显示的友好名称"
                  onChange={(e: any) => (form.value.label = e.target?.value ?? e)}
                />
              </FormItem>
            </Form>
          </Modal>
        </>
      );
    };
  },
});
