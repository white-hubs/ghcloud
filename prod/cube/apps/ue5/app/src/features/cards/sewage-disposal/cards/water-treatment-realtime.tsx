import { ArrowUpOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { waterTreatment } from "@/infrastructure/api/device";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./water-treatment-realtime.module.less";

const monitorIcon = getThemeImage("device-total.png");
const alarmIcon = getThemeImage("alarm-total.png");

const VISIBLE_ROWS = 5;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 30;

type MetricRow = {
  index: string;
  inlet: number | string;
  effluent: number | string;
  exceeding: boolean;
};

const LABEL_MAP: Record<string, string> = {
  ammonianitrogen: "氨氮",
  paracolon: "大肠杆菌",
};

const EXCEED_LIMIT: Record<string, number> = {
  codcr: 250,
  bod5: 100,
  ss: 60,
  ammonianitrogen: 45,
  paracolon: 5000,
};

const formatIndexLabel = (index: string): string => LABEL_MAP[index] || index;

const formatValue = (row: MetricRow, field: "inlet" | "effluent"): string => {
  const value = row[field];
  if (value === "" || value === null || value === undefined) return "--";
  if (row.index === "paracolon") return `${value} CFU/ml`;
  if (row.index === "PH") return String(value);
  return `${value} mg/L`;
};

const TitleIcon = (): JSX.Element => <CardTitleIcon name="boiler-water" />;

export const WaterTreatmentRealtime = defineComponent({
  name: "WaterTreatmentRealtime",
  setup() {
    const monitorCount = ref(6);
    const abnormalCount = ref(0);
    const listData = ref<MetricRow[]>([
      { index: "CODcr", inlet: "", effluent: "", exceeding: false },
      { index: "BOD5", inlet: "", effluent: "", exceeding: false },
      { index: "SS", inlet: "", effluent: "", exceeding: false },
      { index: "ammonianitrogen", inlet: "", effluent: "", exceeding: false },
      { index: "paracolon", inlet: "", effluent: "", exceeding: false },
      { index: "PH", inlet: "", effluent: "", exceeding: false },
    ]);

    const columns = [
      { title: "指标", dataIndex: "index", width: 110, slots: { customRender: "index" } },
      { title: "进水(mg/L)", dataIndex: "inlet", slots: { customRender: "inlet" } },
      { title: "出水(mg/L)", dataIndex: "effluent", width: 140, slots: { customRender: "effluent" } },
    ];

    const loadData = async (): Promise<void> => {
      try {
        const res = (await waterTreatment()) || {};
        let abnormal = 0;
        listData.value = listData.value.map((item) => {
          const next: MetricRow = { ...item, inlet: "", effluent: "", exceeding: false };
          Object.keys(res).forEach((key) => {
            const [metric, direction] = key.split("_");
            if (metric?.toUpperCase() !== item.index.toUpperCase()) return;
            const num = Number(res[key]);
            if (direction === "in") {
              next.inlet = Number.isFinite(num) ? num : "";
              return;
            }
            next.effluent = Number.isFinite(num) ? num : "";
            const limitKey = metric.toLowerCase();
            if (limitKey === "ph") {
              if (Number.isFinite(num) && !(num >= 6 && num <= 9)) {
                next.exceeding = true;
                abnormal += 1;
              }
            } else if (Number.isFinite(num) && EXCEED_LIMIT[limitKey] != null && num > EXCEED_LIMIT[limitKey]) {
              next.exceeding = true;
              abnormal += 1;
            }
          });
          return next;
        });
        monitorCount.value = listData.value.length;
        abnormalCount.value = abnormal;
      } catch {
        abnormalCount.value = 0;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const tableSlots = {
      index: ({ record }: { record: MetricRow }) => <span>{formatIndexLabel(record.index)}</span>,
      inlet: ({ record }: { record: MetricRow }) => <span>{formatValue(record, "inlet")}</span>,
      effluent: ({ record }: { record: MetricRow }) => (
        <span class={styles.effluentCell}>
          <span>{formatValue(record, "effluent")}</span>
          {record.exceeding ? <ArrowUpOutlined class={styles.exceedIcon} /> : null}
        </span>
      ),
    };

    const renderBody = (isZoom: boolean): JSX.Element => {
      // 详情按实际行数定高，避免 RollTable 预留空行造成大片留白
      const visibleRows = isZoom ? Math.max(listData.value.length, 1) : VISIBLE_ROWS;
      const rowHeight = isZoom ? 44 : ROW_HEIGHT;
      const headerHeight = isZoom ? 36 : HEADER_HEIGHT;
      const tableHeight = headerHeight + visibleRows * rowHeight;
      return (
        <div
          class={["water-treatment-realtime-v2-panel", styles.cardBody, isZoom ? styles.isZoom : "", isZoom ? "isZoom" : ""]}
          data-no-zoom
        >
          <div class={styles.statsRow}>
            <div class={[styles.statCard, styles.isMonitor]}>
              <span class={styles.statIcon} aria-hidden="true">
                <img src={monitorIcon} alt="" />
              </span>
              <span class={styles.statContent}>
                <span class={styles.statLabel}>监测</span>
                <span class={styles.statValueRow}>
                  <span class={styles.statValue}>
                    <CountTo startVal={0} endVal={monitorCount.value} separator="" duration={1200} />
                  </span>
                  <span class={styles.statUnit}>项</span>
                </span>
              </span>
            </div>
            <div class={[styles.statCard, styles.isAbnormal]}>
              <span class={styles.statIcon} aria-hidden="true">
                <img src={alarmIcon} alt="" />
              </span>
              <span class={styles.statContent}>
                <span class={styles.statLabel}>异常</span>
                <span class={styles.statValueRow}>
                  <span class={[styles.statValue, styles.isAbnormalValue]}>
                    <CountTo startVal={0} endVal={abnormalCount.value} separator="" duration={1200} />
                  </span>
                  <span class={styles.statUnit}>项</span>
                </span>
              </span>
            </div>
          </div>

          <div class={[styles.tableSurface, "visual-v2-roll-table"]} style={{ height: `${tableHeight}px` }}>
            <RollTable column={columns} data={listData.value} showLength={visibleRows} rowHeight={rowHeight} v-slots={tableSlots} />
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="水处理实时数据"
          class="visual-v2-sub-panel v2-panel-card water-treatment-realtime-v2-panel"
          zoomable
          zoom-title="水处理实时数据详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default WaterTreatmentRealtime;
