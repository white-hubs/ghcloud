import { computed, defineComponent, onMounted, ref } from "vue";

import UniversalPanelCardIcon from "@/features/cards/universal-panel/_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "@/features/cards/universal-panel/_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import useCommon from "@/visualization-core/hooks/useCommon";

import "@/features/cards/universal-panel/_shared/universal-panel-v2-shared.less";

import styles from "./lift-status-monitor.module.less";

type StatusKey = "NORMAL" | "ALARM" | "TROUBLE" | "OFFLINE";
type StatusRow = {
  key: StatusKey;
  label: string;
  value: number;
  percent: number;
  color: string;
};

const statusMeta: Record<StatusKey, Omit<StatusRow, "value" | "percent">> = {
  NORMAL: { key: "NORMAL", label: "正常", color: "#00c982" },
  ALARM: { key: "ALARM", label: "报警", color: "#f14545" },
  TROUBLE: { key: "TROUBLE", label: "故障", color: "#ffab10" },
  OFFLINE: { key: "OFFLINE", label: "离线", color: "#7ca5c9" },
};

const emptyStatusRows = (): StatusRow[] =>
  (Object.keys(statusMeta) as StatusKey[]).map((key) => ({ ...statusMeta[key], value: 0, percent: 0 }));

export const LiftStatusMonitor = defineComponent({
  name: "LiftStatusMonitor",
  setup() {
    const { getEquipmentNumber } = useCommon();
    const { currentTheme } = useVisualTheme();
    const total = ref(0);
    const rows = ref<StatusRow[]>(emptyStatusRows());
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");

    const loadData = async (): Promise<void> => {
      try {
        const res: any = await getEquipmentNumber();
        const statusNums = Array.isArray(res?.deviceStatusNums) ? res.deviceStatusNums : [];
        const statusMap = new Map<string, number>();
        statusNums.forEach((item: any) => {
          statusMap.set(String(item?.name ?? "").toUpperCase(), Number(item?.num) || 0);
        });
        const sum = statusNums.reduce((result: number, item: any) => result + (Number(item?.num) || 0), 0);
        total.value = Number(res?.deviceNum) || sum;
        const base = Math.max(total.value, sum, 1);
        rows.value = (Object.keys(statusMeta) as StatusKey[]).map((key) => {
          const value = statusMap.get(key) ?? 0;
          return { ...statusMeta[key], value, percent: Math.round((value / base) * 1000) / 10 };
        });
      } catch {
        total.value = 0;
        rows.value = emptyStatusRows();
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : "", ...(isZoom ? universalPanelZoomClass : [])]} data-no-zoom>
        <div class={styles.analysisSurface}>
          <div class={styles.chartWrap}>
            <ElevatorAnalysisPie
              class={styles.statusRing}
              pieData={rows.value.map((item) => ({ name: item.label, value: item.value, color: item.color }))}
              radius={isMinimalWhite.value ? "78" : "75"}
              ringVariant={isMinimalWhite.value ? "clean" : "default"}
            >
              <span class={styles.pieCenterValue}>
                <CountTo startVal={0} endVal={total.value} separator="" duration={1400} />
              </span>
              <span class={styles.pieCenterLabel}>设备总数</span>
            </ElevatorAnalysisPie>
          </div>
          <div class={styles.statusList}>
            {rows.value.map((item) => (
              <div class={[styles.statusItem, styles[`is${item.key}`]]} key={`${isZoom ? "zoom-" : ""}${item.key}`}>
                <div class={styles.statusTop}>
                  <span class={styles.statusName}>
                    <span class={styles.statusDot} style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span class={styles.statusCount}>{item.value}台</span>
                </div>
                <div class={styles.statusBarTrack}>
                  <span
                    class={styles.statusBarFill}
                    style={{ width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`, background: item.color }}
                  />
                </div>
                <span class={styles.statusPercent}>占比 {item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="电梯状态监测"
          class={`${UNIVERSAL_PANEL_V2_CLASS} lift-status-monitor-v2-panel`}
          zoomable
          zoom-title="电梯状态监测详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="alarm" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default LiftStatusMonitor;
