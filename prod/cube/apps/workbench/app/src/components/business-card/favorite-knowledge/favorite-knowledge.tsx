import { defineComponent } from "vue";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import { Empty } from "@ghcloud/cube-ui";

import PanelCard from "../../card/card";

export default defineComponent({
  name: "FavoriteKnowledge",
  emits: ["close"],
  setup(_, { emit }) {
    const goKnowledge = (): void => {
      publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, {
        code: "KNOWLEDGE_DOCUMENT",
        path: "/portal/knowledge-document/knowledge-document",
      });
    };
    return (): JSX.Element => (
      <PanelCard title="我的收藏知识库" icon="icon-wodeshoucangzhishiku" onClose={() => emit("close")}>
        {{
          btn: () => <a onClick={goKnowledge}>查看更多</a>,
          default: () => (
            <div class="business-card-empty">
              <Empty description="暂无收藏知识" />
            </div>
          ),
        }}
      </PanelCard>
    );
  },
});
