import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsEnterprises } from "@/infrastructure/api/park";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./park-management-v2-shared.module.less";

type PieItem = { name: string; color: string; value: number; rate: number };
type TableRow = { industry: string; num: number | string; rate: string };

const COLORS = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const VISIBLE_ROWS = 5;
const ZOOM_ROWS = 8;

const formatRate = (raw: string | number | undefined): number => {
  const n = Number(String(raw ?? "").replace("%", ""));
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
};

export const ParkEnterpriseIndustryStats = defineComponent({
  name: "ParkEnterpriseIndustryStats",
  props: {
    title: { type: String, required: false, default: "租赁企业行业情况统计" },
  },
  setup(props) {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const levelPieData = ref<PieItem[]>([]);
    const industryStatistics = ref<TableRow[]>([]);
    const throughNum = ref(0);
    const columns = [
      { title: "行业类型", dataIndex: "industry", width: 120 },
      { title: "使用", dataIndex: "num" },
      { title: "占比", dataIndex: "rate" },
    ];

    const hasStructure = computed(() => levelPieData.value.length > 0);

    const getStatisticsEnterprises = async (): Promise<void> => {
      try {
        const res = await statisticsEnterprises();
        const list = Array.isArray(res?.industryStatisticsEnterprises) ? res.industryStatisticsEnterprises : [];
        throughNum.value = Number(res?.total) || 0;
        levelPieData.value = list.map((item, index) => ({
          name: item.industry || "--",
          color: COLORS[index % COLORS.length],
          value: Number(item.num) || 0,
          rate: formatRate(item.rate),
        }));
        industryStatistics.value = list.map((item) => ({
          industry: item.industry || "--",
          num: Number(item.num) || 0,
          rate: `占比 ${formatRate(item.rate)}%`,
        }));
      } catch {
        throughNum.value = 0;
        levelPieData.value = [];
        industryStatistics.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getStatisticsEnterprises();
    });

    const renderLegend = (): JSX.Element => (
      <div class="park-manage-legend">
        {levelPieData.value.map((item) => (
          <div class="park-manage-legend-item" key={item.name}>
            <span class="park-manage-legend-left">
              <i class="park-manage-legend-dot" style={{ backgroundColor: item.color }} />
              <span class="park-manage-legend-name" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="park-manage-legend-value">
              {item.value}
              <span class="park-manage-legend-pct">占比 {item.rate}%</span>
            </span>
          </div>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["park-manage-pie-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasStructure.value ? (
            <>
              <div class={["park-manage-pie-wrap", isZoom ? "is-zoom" : ""]}>
                <ElevatorAnalysisPie class="park-manage-pie" pie-class="park-manage-pie-chart" pieData={levelPieData.value}>
                  <div class="park-manage-pie-center">
                    <div class="park-manage-pie-value">
                      <CountTo startVal={0} endVal={throughNum.value} separator="" duration={1600} />
                    </div>
                    <div class="park-manage-pie-label">企业总数</div>
                  </div>
                </ElevatorAnalysisPie>
              </div>
              {renderLegend()}
            </>
          ) : (
            <div class={["park-manage-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
        {hasStructure.value ? (
          <div class="park-manage-table-surface" data-no-zoom>
            <RollTable column={columns} data={industryStatistics.value} showLength={isZoom ? ZOOM_ROWS : VISIBLE_ROWS} />
          </div>
        ) : null}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-classification" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ParkEnterpriseIndustryStats;
