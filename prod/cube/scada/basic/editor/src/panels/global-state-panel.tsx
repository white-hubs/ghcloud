import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { Button, Form, FormItem, Input, Space, Empty } from "ant-design-vue";
import { defineComponent, ref } from "vue";

import { useEditorStore } from "../store/use-editor-store";

export const GlobalStatePanel = defineComponent({
  name: "GlobalStatePanel",
  setup() {
    const store = useEditorStore();
    const newKey = ref("");

    function addKey() {
      const key = newKey.value.trim();
      if (!key) return;
      if (Object.prototype.hasOwnProperty.call(store.globalState, key)) return;
      store.updateGlobalState(key, "");
      newKey.value = "";
    }

    return () => {
      const entries = Object.entries(store.globalState);

      return (
        <div style="padding: 12px">
          <Space.Compact style="width: 100%; margin-bottom: 12px">
            <Input
              value={newKey.value}
              placeholder="新增全局变量 key（例如: siteId）"
              onChange={(e: any) => (newKey.value = e.target?.value ?? e)}
              onPressEnter={addKey}
            />
            <Button type="primary" onClick={addKey}>
              <PlusOutlined />
            </Button>
          </Space.Compact>

          {entries.length === 0 ? (
            <Empty description="暂无全局变量" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Form layout="vertical" size="small">
              {entries.map(([key, value]) => (
                <FormItem key={key} label={key}>
                  <Space.Compact style="width: 100%">
                    <Input
                      value={value}
                      placeholder={`请输入 ${key}`}
                      onChange={(e: any) => store.updateGlobalState(key, e.target?.value ?? e)}
                    />
                    <Button danger onClick={() => store.removeGlobalState(key)}>
                      <DeleteOutlined />
                    </Button>
                  </Space.Compact>
                </FormItem>
              ))}
            </Form>
          )}
        </div>
      );
    };
  },
});
