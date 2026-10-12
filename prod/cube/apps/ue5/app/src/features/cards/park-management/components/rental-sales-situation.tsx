import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { rentRecordStatRentedSold } from "@/infrastructure/api/youxianqu-park";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../cards/park-management-v2-shared.module.less";
import "./rental-sales-situation.module.less";

type PieItem = { name: string; value: number; color: string; rate: number };
type RowItem = { name: string; useArea: string; useAreaRate: string };

const COLORS = ["#29C2FF", "#FFC700", "#35E69B"];
const FALLBACK: PieItem[] = [
  { name: "已租赁", value: 0, color: COLORS[0], rate: 0 },
  { name: "预定", value: 0, color: COLORS[1], rate: 0 },
  { name: "已售", value: 0, color: COLORS[2], rate: 0 },
];
const VISIBLE_ROWS = 3;
const ZOOM_ROWS = 5;

const toWan = (raw: number): number => Math.round((raw / 10000) * 100) / 100;

export const RentalSalesSituation = defineComponent({
  name: "RentalSalesSituation",
  props: {
    title: { type: String, required: false, default: "园区租售总情况" },
  },
  setup(props) {
    const pieData = ref<PieItem[]>(FALLBACK.map((item) => ({ ...item })));
    const totalRaw = ref(0);
    const columns = [
      { title: "租赁情况", dataIndex: "name", width: 120 },
      { title: "面积", dataIndex: "useArea" },
      { title: "占比", dataIndex: "useAreaRate" },
    ];

    const totalWan = computed(() => toWan(totalRaw.value));
    const tableRows = computed<RowItem[]>(() =>
      pieData.value.map((item) => ({
        name: item.name,
        useArea: `${toWan(item.value)}万㎡`,
        useAreaRate: `占比 ${item.rate}%`,
      })),
    );

    const changeTopTimeFrame = async (): Promise<void> => {
      try {
        const res = await rentRecordStatRentedSold();
        const total = Number(res?.total) || 0;
        const rented = Number(res?.rented) || 0;
        const reserve = Number(res?.reserve) || 0;
        const sold = Number(res?.sold) || 0;
        totalRaw.value = total;
        const values = [rented, reserve, sold];
        pieData.value = FALLBACK.map((item, index) => {
          const value = values[index] || 0;
          const rate = total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
          return { ...item, value, rate };
        });
      } catch {
        totalRaw.value = 0;
        pieData.value = FALLBACK.map((item) => ({ ...item }));
      }
    };

    onMounted(() => {
      void changeTopTimeFrame();
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
              {toWan(item.value)}万㎡
              <span class="park-manage-legend-pct">占比 {item.rate}%</span>
            </span>
          </div>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["park-manage-pie-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class={["park-manage-pie-wrap", isZoom ? "is-zoom" : ""]}>
            <ElevatorAnalysisPie class="park-manage-pie" pie-class="park-manage-pie-chart" pieData={pieData.value}>
              <div class="park-manage-pie-center">
                <div class="park-manage-pie-value">
                  <CountTo startVal={0} endVal={totalWan.value} decimals={2} separator="" duration={1600} />
                </div>
                <div class="park-manage-pie-label">总使用面积万㎡</div>
              </div>
            </ElevatorAnalysisPie>
          </div>
          {renderLegend()}
        </div>
        <div class="park-manage-table-surface" data-no-zoom>
          <RollTable column={columns} data={tableRows.value} showLength={isZoom ? ZOOM_ROWS : VISIBLE_ROWS} />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel rental-sales-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-overview" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default RentalSalesSituation;
