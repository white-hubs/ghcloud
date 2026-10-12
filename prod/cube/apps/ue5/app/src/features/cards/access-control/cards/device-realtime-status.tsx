import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { deviceStatus } from "@/infrastructure/utils/requestData/accessControl";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./device-realtime-status.module.less";

type DeviceStatusItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

const ONLINE_COLOR = "#328BF7";
const OFFLINE_COLOR = "#FFAB10";
const FALLBACK_COLORS = ["#328BF7", "#FFAB10", "#19F8F7"];

const resolveDeviceColor = (name: string, fallback?: string, index = 0): string => {
  if (/离线|故障|异常|告警/.test(name)) return OFFLINE_COLOR;
  if (/在线|正常|运行/.test(name)) return ONLINE_COLOR;
  if (fallback) return fallback;
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

const parseItemName = (raw: string): { name: string; percent?: number } => {
  const matched = raw.match(/^(.*?)\s*\((\d+(?:\.\d+)?)%\)$/);
  if (!matched) return { name: raw || "--" };
  return { name: matched[1].trim() || "--", percent: Number(matched[2]) };
};

export const DeviceRealtimeStatus = defineComponent({
  name: "DeviceRealtimeStatus",
  setup() {
    const { globalState } = useStateStore();
    const eventNum = ref(0);
    const pieItems = ref<DeviceStatusItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    let timer: ReturnType<typeof setInterval> | null = null;

    const hasData = computed(() => pieItems.value.length > 0);

    const deviceRealTimeStatus = async (): Promise<void> => {
      try {
        const res: any = await deviceStatus();
        eventNum.value = Number(res?.total) || 0;
        const rows = Array.isArray(res?.data) ? res.data : [];
        const total = eventNum.value || 1;
        pieItems.value = rows.map(
          (item: { label?: string; name?: string; color?: string; value?: number; ringRatio?: number }, index: number) => {
            const parsed = parseItemName(String(item.label || item.name || "--"));
            const name = String(item.name || parsed.name || "--");
            const value = Number(item.value) || 0;
            const percent =
              typeof item.ringRatio === "number"
                ? Math.round(Number(item.ringRatio) * 10) / 10
                : typeof parsed.percent === "number"
                  ? Math.round(parsed.percent * 10) / 10
                  : Math.round((value / total) * 1000) / 10;
            return {
              name,
              value,
              color: resolveDeviceColor(name, item.color, index),
              percent,
            };
          },
        );
      } catch {
        eventNum.value = 0;
        pieItems.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      timer = setInterval(
        () => {
          void deviceRealTimeStatus();
        },
        (window as any).config.pageLoopRequestTime,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
        void deviceRealTimeStatus();
      },
    );

    onMounted(() => {
      void deviceRealTimeStatus();
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.analysisSurface}>
            <div class={styles.chartWrap}>
              <ElevatorAnalysisPie pieData={pieItems.value}>
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={eventNum.value} separator="" duration={1600} />
                </div>
                <div class={styles.pieCenterLabel}>设备总数</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.levelList}>
              {pieItems.value.map((item) => (
                <div class={styles.levelItem} key={`${isZoom ? "zoom-" : ""}${item.name}`}>
                  <span class={styles.levelTop}>
                    <span class={styles.levelName}>{item.name}</span>
                    <span class={styles.levelCount}>{item.value}</span>
                  </span>
                  <span class={styles.levelBarRow}>
                    <span class={styles.levelColor} style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    <span class={styles.levelBarTrack}>
                      <span
                        class={styles.levelBarFill}
                        style={{
                          width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                        }}
                      />
                    </span>
                  </span>
                  <span class={styles.levelBottom}>
                    <span class={styles.levelShare}>占比 {item.percent}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="设备实时状态"
          class="visual-v2-sub-panel v2-panel-card device-realtime-status-v2-panel"
          zoomable
          zoom-title="设备实时状态详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="access-control-device" />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default DeviceRealtimeStatus;
