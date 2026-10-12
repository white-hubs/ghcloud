import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { BOILER_PANEL_CLASS, boilerZoomClass } from "@/features/cards/boiler/_shared/boiler-panel-context";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/boiler-v2-shared.module.less";

import styles from "./device-stats.module.less";

const STATUS_META: Record<string, { label: string; color: string }> = {
  ALARM: { label: "报警", color: "#F14545" },
  TROUBLE: { label: "故障", color: "#FFAB10" },
  OFFLINE: { label: "离线", color: "#7B93B0" },
  NORMAL: { label: "正常", color: "#328BF7" },
};

const STATUS_ORDER = ["ALARM", "TROUBLE", "OFFLINE", "NORMAL"];
const GENRE_COLORS = ["#328BF7", "#19F8F7", "#FFC700", "#00F27B", "#FF6E23", "#F14545"];

type StatusItem = { key: string; label: string; color: string; value: number };
type GenreItem = { name: string; value: number; color: string; percent: number };

export const DeviceStats = defineComponent({
  name: "DeviceStats",
  setup() {
    const { globalState } = useStateStore();
    const deviceStatistic = ref<StatusItem[]>(
      STATUS_ORDER.map((key) => ({
        key,
        label: STATUS_META[key].label,
        color: STATUS_META[key].color,
        value: 0,
      })),
    );
    const genreItems = ref<GenreItem[]>([]);
    const alarmTotal = ref(0);

    const deviceDataInfo = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      try {
        const res: any = await equipmentTotal(params);
        const total = Number(res?.deviceNum) || 0;
        alarmTotal.value = total;
        const statusMap = new Map<string, number>();
        (Array.isArray(res?.deviceStatusNums) ? res.deviceStatusNums : []).forEach((item: { name?: string; num?: number }) => {
          statusMap.set(String(item.name), Number(item.num) || 0);
        });
        deviceStatistic.value = STATUS_ORDER.map((key) => ({
          key,
          label: STATUS_META[key].label,
          color: STATUS_META[key].color,
          value: statusMap.get(key) ?? 0,
        }));
        const genres = Array.isArray(res?.deviceGenreNums) ? res.deviceGenreNums : [];
        const base = total || 1;
        genreItems.value = genres.map((item: { genreName?: string; num?: number }, index: number) => {
          const value = Number(item.num) || 0;
          return {
            name: String(item.genreName || "--"),
            value,
            color: GENRE_COLORS[index % GENRE_COLORS.length],
            percent: Math.round((value / base) * 1000) / 10,
          };
        });
      } catch {
        alarmTotal.value = 0;
        deviceStatistic.value = STATUS_ORDER.map((key) => ({
          key,
          label: STATUS_META[key].label,
          color: STATUS_META[key].color,
          value: 0,
        }));
        genreItems.value = [];
      }
    };

    onMounted(() => {
      void deviceDataInfo();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.body, "boiler-card-body", isZoom ? boilerZoomClass : ""]} data-no-zoom>
        <div class={styles.statisticsSurface}>
          <div class={styles.summaryRow}>
            <div class={styles.pieArea}>
              <ElevatorAnalysisPie
                pieData={
                  genreItems.value.length
                    ? genreItems.value
                    : deviceStatistic.value.map((s) => ({ name: s.label, value: s.value, color: s.color }))
                }
              >
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={alarmTotal.value} separator="" duration={1600} />
                </div>
                <div class={styles.pieCenterLabel}>设备总数</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.statusArea}>
              <div class={styles.statusGrid}>
                {deviceStatistic.value.map((item) => (
                  <div class={styles.statusItem} key={item.key}>
                    <span class={styles.statusDot} style={{ background: item.color }} />
                    <span class={styles.statusLabel}>{item.label}</span>
                    <strong class={styles.statusValue}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div class={styles.genreArea}>
            {genreItems.value.length ? (
              <div class={styles.genreList}>
                {genreItems.value.map((item) => (
                  <div class={styles.genreItem} key={item.name} title={`${item.name} 占比 ${item.percent}%`}>
                    <span class={styles.genreDot} style={{ background: item.color }} />
                    <span class={styles.genreLabel}>{item.name}</span>
                    <strong class={styles.genreValue}>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div class={styles.genreEmpty}>
                <NoData />
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="boiler-v2-root v2-panel-root">
        <SubPanelTemplate
          title="设备统计"
          class={BOILER_PANEL_CLASS}
          zoomable
          zoom-title="设备统计详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="boiler-device" />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default DeviceStats;
