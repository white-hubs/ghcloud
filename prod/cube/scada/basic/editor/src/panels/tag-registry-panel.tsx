import { PlusOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import type { TagDefinition } from "@cube-scada/core";
import { Button, Form, FormItem, Input, InputNumber, Select, Tag, Space, Popconfirm, Empty } from "ant-design-vue";
import { defineComponent, ref } from "vue";

import { useEditorStore } from "../store/use-editor-store";

const TYPE_OPTIONS = [
  { label: "布尔型", value: "boolean" },
  { label: "数字型", value: "number" },
  { label: "字符串型", value: "string" },
];

const TYPE_COLOR: Record<string, string> = {
  boolean: "blue",
  number: "green",
  string: "orange",
};

export const TagRegistryPanel = defineComponent({
  name: "TagRegistryPanel",
  setup() {
    const store = useEditorStore();
    const adding = ref(false);
    const form = ref<Partial<TagDefinition & { name: string; type: "boolean" | "number" | "string" }>>({
      name: "",
      type: "boolean",
    });

    function countTagUsage(tagName: string): number {
      let count = 0;
      for (const el of store.graph?.getNodes() ?? []) {
        const data = (el as any).getData() ?? {};
        for (const b of data.bindings ?? []) {
          if (b.tagName === tagName || String(b.tagName ?? "").includes(tagName)) count++;
        }
        for (const h of data.eventHandlers ?? []) {
          for (const a of h.actions ?? []) {
            if (a.params?.tag === tagName) count++;
          }
        }
      }
      return count;
    }

    function submitAdd() {
      const name = form.value.name?.trim();
      if (!name) return;
      store.addTag({
        name,
        type: form.value.type ?? "boolean",
        label: form.value.label,
        description: form.value.description,
        min: form.value.type === "number" ? form.value.min : undefined,
        max: form.value.type === "number" ? form.value.max : undefined,
        step: form.value.type === "number" ? form.value.step : undefined,
      });
      form.value = { name: "", type: "boolean" };
      adding.value = false;
    }

    return () => {
      const tags = store.pageTags;

      return (
        <div>
          {!adding.value ? (
            <Button type="dashed" block size="small" onClick={() => (adding.value = true)} style="margin-bottom: 8px">
              <PlusOutlined /> 添加点位
            </Button>
          ) : (
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "12px",
                background: "#fafafa",
              }}
            >
              <Form layout="vertical" size="small">
                <FormItem label="点位名称" required>
                  <Input
                    value={form.value.name}
                    placeholder="例如: pump1.speed"
                    onChange={(e: any) => (form.value.name = e.target?.value ?? e)}
                  />
                </FormItem>
                <FormItem label="数据类型">
                  <Select value={form.value.type} options={TYPE_OPTIONS} onChange={(v: any) => (form.value.type = v)} style="width: 100%" />
                </FormItem>
                {form.value.type === "number" && (
                  <>
                    <FormItem label="最小值">
                      <InputNumber value={form.value.min} onChange={(v: any) => (form.value.min = v ?? undefined)} style="width: 100%" />
                    </FormItem>
                    <FormItem label="最大值">
                      <InputNumber value={form.value.max} onChange={(v: any) => (form.value.max = v ?? undefined)} style="width: 100%" />
                    </FormItem>
                  </>
                )}
                <FormItem label="显示标签 (可选)">
                  <Input
                    value={form.value.label}
                    placeholder="用于显示的友好名称"
                    onChange={(e: any) => (form.value.label = e.target?.value ?? e)}
                  />
                </FormItem>
              </Form>
              <Space>
                <Button type="primary" size="small" onClick={submitAdd}>
                  创建
                </Button>
                <Button size="small" onClick={() => (adding.value = false)}>
                  取消
                </Button>
              </Space>
            </div>
          )}

          {tags.length === 0 ? (
            <Empty description="暂未定义点位" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div style="display: flex; flex-direction: column; gap: 6px">
              {tags.map((tag) => {
                const usageCount = countTagUsage(tag.name);
                const deleteTitle = usageCount > 0 ? `该点位被 ${usageCount} 处引用，删除后引用将失效，确认删除？` : "确认删除此点位？";

                return (
                  <div
                    key={tag.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 8px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "4px",
                      background: "#fff",
                    }}
                  >
                    <Tag color={TYPE_COLOR[tag.type] ?? "default"}>{tag.type}</Tag>
                    <span style="flex: 1; font-size: 13px; font-family: monospace">{tag.name}</span>
                    {tag.label && <span style="color: #999; font-size: 12px">{tag.label}</span>}
                    {tag.type === "number" && (tag.min != null || tag.max != null) && (
                      <span style="color: #aaa; font-size: 11px">
                        [{tag.min ?? "−∞"}, {tag.max ?? "+∞"}]
                      </span>
                    )}
                    <Popconfirm title={deleteTitle} onConfirm={() => store.removeTagByName(tag.name)}>
                      <Button type="link" size="small" danger>
                        <DeleteOutlined />
                      </Button>
                    </Popconfirm>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };
  },
});
