import { graphToPageModel, validatePageModel } from "@cube-scada/core";
import { Alert, List, Tag, Button } from "ant-design-vue";
import { defineComponent, computed } from "vue";

import { useEditorStore } from "../store/use-editor-store";

export const ValidationPanel = defineComponent({
  name: "ValidationPanel",
  setup() {
    const store = useEditorStore();

    const validation = computed(() => {
      const _ = store.dataRevision;
      const g = store.graph;
      if (!g) {
        return { errors: [], warnings: [] };
      }
      const page = graphToPageModel(g, {
        id: store.pageId,
        name: store.pageName,
        width: store.pageWidth,
        height: store.pageHeight,
        background: store.pageBackground,
        backgroundImage: store.pageBackgroundImage,
        globals: { ...store.globalState },
        aliases: [],
        tags: [...store.pageTags],
        product: store.pageProduct ? { ...store.pageProduct } : undefined,
      });
      return validatePageModel(page);
    });

    return () => {
      const result = validation.value;
      const hasIssues = result.errors.length > 0 || result.warnings.length > 0;

      if (!hasIssues) {
        return (
          <div style="padding: 12px">
            <Alert type="success" showIcon message="预检通过：未发现配置问题" />
          </div>
        );
      }

      return (
        <div style="padding: 12px">
          <Alert
            type={result.errors.length > 0 ? "error" : "warning"}
            showIcon
            style="margin-bottom: 12px"
            message={`预检结果：${result.errors.length} 个错误，${result.warnings.length} 个警告`}
          />

          {result.errors.length > 0 && (
            <List
              size="small"
              bordered
              header={<strong>错误</strong>}
              dataSource={result.errors}
              renderItem={(item: any) => (
                <List.Item>
                  <div style="display:flex; align-items:center; gap:8px; width:100%">
                    <Tag color="red">{item.code}</Tag>
                    <span style="flex:1">{item.message}</span>
                    {item.elementId && (
                      <Button size="small" type="link" onClick={() => store.focusElement(item.elementId)}>
                        定位
                      </Button>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}

          {result.warnings.length > 0 && (
            <List
              size="small"
              bordered
              style={result.errors.length > 0 ? "margin-top: 12px" : ""}
              header={<strong>警告</strong>}
              dataSource={result.warnings}
              renderItem={(item: any) => (
                <List.Item>
                  <div style="display:flex; align-items:center; gap:8px; width:100%">
                    <Tag color="gold">{item.code}</Tag>
                    <span style="flex:1">{item.message}</span>
                    {item.elementId && (
                      <Button size="small" type="link" onClick={() => store.focusElement(item.elementId)}>
                        定位
                      </Button>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      );
    };
  },
});
