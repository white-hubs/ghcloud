import { defineComponent, reactive } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import "./delivery-v2-shared.module.less";

export const StarOrderDistribution = defineComponent({
  name: "StarOrderDistribution",
  setup() {
    const statistic = reactive([
      {
        title: "累计订单",
        value: 1164407,
        color: "#4D9DFF",
      },
      {
        title: "非月结正常订单",
        value: 1163863,
        color: "#2989FF",
      },
      {
        title: "月结正常订单",
        value: 544,
        color: "#58FAB6",
      },
      {
        title: "退款订单",
        value: 23643,
        color: "#FF6E23",
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
          title="订单分布统计"
          class="visual-v2-sub-panel v2-panel-card delivery-v2-panel"
          zoomable
          zoom-title="订单分布统计详情"
          zoom-width={680}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="delivery-order" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default StarOrderDistribution;
