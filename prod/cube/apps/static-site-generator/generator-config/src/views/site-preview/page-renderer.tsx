// oxlint-disable typescript/no-explicit-any
import { defineComponent, type PropType } from "vue";

import type { PreviewPage } from "./preview-utils";
import { getVueComponent } from "@/designer/component-map";

export const PageRenderer = defineComponent({
  props: {
    page: {
      type: Object as PropType<PreviewPage>,
      required: true,
    },
  },
  setup(props) {
    return (): JSX.Element => {
      const { page } = props;
      const components = page?.components || [];

      if (components.length === 0) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>页面暂无组件配置</div>;
      }

      return (
        <>
          {components.map((comp, index) => {
            const vueComponent = getVueComponent(comp.name);
            if (!vueComponent) {
              return (
                <div
                  key={`missing-${index}`}
                  style={{ padding: "40px", textAlign: "center", color: "#999", border: "1px dashed #d9d9d9", margin: "8px 0" }}
                >
                  无法预览组件：{comp.name}
                </div>
              );
            }
            const VueComp = vueComponent as any;
            return <VueComp key={`${comp.name}-${index}`} {...comp.props} />;
          })}
        </>
      );
    };
  },
});
