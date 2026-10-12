import { computed, defineComponent, onMounted, reactive } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { utilizationRate } from "@/infrastructure/api/park";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./park-management-v2-shared.module.less";

const COLORS = {
  used: "#29C2FF",
  unused: "#74AEE7",
};

export const ParkSpaceUtilization = defineComponent({
  name: "ParkSpaceUtilization",
  props: {
    title: { type: String, required: false, default: "空间利用率" },
  },
  setup(props) {
    const metrics = reactive([
      { title: "总面积", value: 0, unit: "㎡", className: "is-total" },
      { title: "可用面积", value: 0, unit: "㎡", className: "is-available" },
    ]);
    const utilization = reactive({ proportion: 0 });

    const getRateValue = (): number => Math.min(100, Math.max(0, Number(utilization.proportion) || 0));

    const pieData = computed(() => {
      const total = Math.max(0, Number(metrics[0].value) || 0);
      const used = Math.max(0, Number(metrics[1].value) || 0);
      const unused = Math.max(0, total - used);
      if (total <= 0) {
        return [
          { name: "可用面积", color: COLORS.used, value: 0, rate: 0 },
          { name: "其余面积", color: COLORS.unused, value: 0, rate: 0 },
        ];
      }
      const rate = Math.round((used / total) * 1000) / 10;
      const unusedRate = Math.round((unused / total) * 1000) / 10;
      return [
        { name: "可用面积", color: COLORS.used, value: used, rate },
        { name: "其余面积", color: COLORS.unused, value: unused, rate: unusedRate },
      ];
    });

    const getUtilizationRate = async (): Promise<void> => {
      try {
        const res = await utilizationRate();
        metrics[0].value = Number(res?.total) || 0;
        metrics[1].value = Number(res?.useArea) || 0;
        utilization.proportion = Number(res?.utilizationRate) || 0;
      } catch {
        metrics[0].value = 0;
        metrics[1].value = 0;
        utilization.proportion = 0;
      }
    };

    onMounted(() => {
      void getUtilizationRate();
    });

    const renderLegend = (): JSX.Element => (
      <div class="park-manage-legend">
        {pieData.value.map((item) => (
          <div class="park-manage-legend-item" key={item.name}>
            <span class="park-manage-legend-left">
              <i class="park-manage-legend-dot" style={{ backgroundColor: item.color }} />
              <span class="park-manage-legend-name" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="park-manage-legend-value">
              {item.value}㎡<span class="park-manage-legend-pct">占比 {item.rate}%</span>
            </span>
          </div>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="park-manage-metric-grid" data-no-zoom>
          {metrics.map((item) => (
            <div class={["park-manage-metric-card", item.className]} key={item.title}>
              <span class="park-manage-metric-label">{item.title}</span>
              <span class="park-manage-metric-value" title={`${item.value}${item.unit}`}>
                <CountTo startVal={0} endVal={item.value} duration={1600} separator="" />
                <span class="park-manage-metric-unit">{item.unit}</span>
              </span>
            </div>
          ))}
        </div>

        <div class={["park-manage-pie-row", "park-manage-rate-pie-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class={["park-manage-pie-wrap", isZoom ? "is-zoom" : ""]}>
            <ElevatorAnalysisPie class="park-manage-pie" pie-class="park-manage-pie-chart" pieData={pieData.value}>
              <div class="park-manage-pie-center">
                <div class="park-manage-pie-value">
                  <CountTo startVal={0} endVal={getRateValue()} separator="" duration={1600} />
                  <span class="park-manage-pie-unit">%</span>
                </div>
                <div class="park-manage-pie-label">空间利用率</div>
              </div>
            </ElevatorAnalysisPie>
          </div>
          {renderLegend()}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-region" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ParkSpaceUtilization;
