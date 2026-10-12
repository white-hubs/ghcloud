import { defineComponent, reactive } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import "./delivery-v2-shared.module.less";

export const StarRevenueDistribution = defineComponent({
  name: "StarRevenueDistribution",
  setup() {
    const statistic = reactive([
      {
        title: "累计运费",
        value: 27094779.87,
        color: "#4D9DFF",
      },
      {
        title: "实收运费",
        value: 23716692.33,
        color: "#2989FF",
      },
      {
        title: "待月结算",
        value: 9613,
        color: "#FFC700",
      },
      {
        title: "已退款运费",
        value: 433844.74,
        color: "#FF6E23",
      },
    ]);

    const formatNumber = (value: number): string =>
      Number(value || 0).toLocaleString("zh-CN", {
        maximumFractionDigits: 2,
      });

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
          title="营收分布统计"
          class="visual-v2-sub-panel v2-panel-card delivery-v2-panel"
          zoomable
          zoom-title="营收分布统计详情"
          zoom-width={680}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="delivery-revenue" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default StarRevenueDistribution;
