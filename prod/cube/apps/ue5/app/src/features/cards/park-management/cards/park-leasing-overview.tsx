import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { parkLeasing } from "@/infrastructure/api/park";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./park-management-v2-shared.module.less";

type PieItem = { name: string; color: string; value: number; rate: number };
type TableRow = { name: string; useArea: string; useAreaRate: string };

const COLORS = ["#29C2FF", "#74AEE7"];
const FALLBACK_PIE: PieItem[] = [
  { name: "已租赁", color: COLORS[0], value: 0, rate: 0 },
  { name: "未租赁", color: COLORS[1], value: 0, rate: 0 },
];
const VISIBLE_ROWS = 5;
const ZOOM_ROWS = 8;

const formatRate = (raw: string | number | undefined): number => {
  const n = Number(String(raw ?? "").replace("%", ""));
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
};

export const ParkLeasingOverview = defineComponent({
  name: "ParkLeasingOverview",
  props: {
    title: { type: String, required: false, default: "园区租赁总情况" },
  },
  setup(props) {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const levelPieData = ref<PieItem[]>(FALLBACK_PIE.map((item) => ({ ...item })));
    const industryStatistics = ref<TableRow[]>(
      FALLBACK_PIE.map((item) => ({
        name: item.name,
        useArea: "0㎡",
        useAreaRate: "占比 0%",
      })),
    );
    const columns = [
      { title: "租赁情况", dataIndex: "name", width: 120 },
      { title: "面积", dataIndex: "useArea" },
      { title: "占比", dataIndex: "useAreaRate" },
    ];

    const totalArea = computed(() => levelPieData.value.reduce((sum, item) => sum + Number(item.value || 0), 0));
    const hasStructure = computed(() => levelPieData.value.length > 0);

    const getParkLeasing = async (): Promise<void> => {
      try {
        const res = await parkLeasing();
        const list = Array.isArray(res?.leased) ? res.leased : [];
        if (list.length === 0) {
          levelPieData.value = FALLBACK_PIE.map((item) => ({ ...item }));
          industryStatistics.value = FALLBACK_PIE.map((item) => ({
            name: item.name,
            useArea: "0㎡",
            useAreaRate: "占比 0%",
          }));
          return;
        }
        const sum = list.reduce((acc: number, item: { useArea?: number }) => acc + (Number(item.useArea) || 0), 0) || 1;
        levelPieData.value = list.map((item: { name?: string; useArea?: number; useAreaRate?: string | number }, index: number) => {
          const value = Number(item.useArea) || 0;
          const rate = item.useAreaRate != null ? formatRate(item.useAreaRate) : Math.round((value / sum) * 1000) / 10;
          return {
            name: item.name || "--",
            color: COLORS[index % COLORS.length],
            value,
            rate,
          };
        });
        industryStatistics.value = levelPieData.value.map((item) => ({
          name: item.name,
          useArea: `${item.value}㎡`,
          useAreaRate: `占比 ${item.rate}%`,
        }));
      } catch {
        levelPieData.value = FALLBACK_PIE.map((item) => ({ ...item }));
        industryStatistics.value = FALLBACK_PIE.map((item) => ({
          name: item.name,
          useArea: "0㎡",
          useAreaRate: "占比 0%",
        }));
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getParkLeasing();
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
              {item.value}㎡<span class="park-manage-legend-pct">占比 {item.rate}%</span>
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
                      <CountTo startVal={0} endVal={totalArea.value} separator="" duration={1600} />
                    </div>
                    <div class="park-manage-pie-label">租赁面积㎡</div>
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
            titleIcon: () => <CardTitleIcon name="overview-management" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ParkLeasingOverview;
