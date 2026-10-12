import { defineComponent, reactive } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import "./delivery-v2-shared.module.less";

export const StarUserDistribution = defineComponent({
  name: "StarUserDistribution",
  setup() {
    const statistic = reactive([
      {
        title: "累计用户",
        value: 5966,
        color: "#4D9DFF",
      },
      {
        title: "企业用户",
        value: 5,
        color: "#19F8F7",
      },
      {
        title: "批发商",
        value: 4424,
        color: "#FFC700",
      },
      {
        title: "采购商",
        value: 1542,
        color: "#58FAB6",
      },
    ]);

    const formatNumber = (value: number): string => Number(value || 0).toLocaleString("zh-CN");

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["delivery-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="delivery-v2-stat-grid">
          {statistic.map((item) => (
            <div
              class="delivery-v2-stat-card delivery-v2-surface"
              key={item.title}
              style={{
                "--delivery-accent": item.color,
                "--delivery-accent-soft": `${item.color}26`,
              }}
            >
              <span class="delivery-v2-stat-label" title={item.title}>
                <i class="delivery-v2-stat-dot" />
                {item.title}
              </span>
              <span class="delivery-v2-stat-value" title={formatNumber(item.value)}>
                {formatNumber(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="delivery-v2-root">
        <SubPanelTemplate
          title="用户分布统计"
          class="visual-v2-sub-panel v2-panel-card delivery-v2-panel"
          zoomable
          zoom-title="用户分布统计详情"
          zoom-width={680}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="delivery-user" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default StarUserDistribution;
