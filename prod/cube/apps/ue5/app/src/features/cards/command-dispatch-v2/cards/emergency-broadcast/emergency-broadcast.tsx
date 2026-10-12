import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalBroadcastTable from "@/features/cards/command-dispatchNew/components/modal-broadcast-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { playStatistics } from "@/infrastructure/api/broadcast";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./emergency-broadcast.module.less";

const COLOR_LIST = ["#328BF7", "#FFC700", "#74AEE7", "#00F27B", "#29C2FF", "#EF424A"];
const totalIcon = getThemeImage("alarm-count.png");

type BroadcastItem = {
  id: string;
  name: string;
  value: number;
  color: string;
  percent: number;
};

export const EmergencyBroadcast = defineComponent({
  name: "EmergencyBroadcast",
  setup() {
    const { globalState } = useStateStore();
    const eventTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const total = ref(0);
    const pieItems = ref<BroadcastItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const broadcastShow = ref(false);
    const parameterBroadcast = reactive({
      templateId: "",
      period: "" as string,
    });
    let timer: ReturnType<typeof setInterval> | null = null;

    const hasData = computed(() => pieItems.value.length > 0);

    const loadStatistics = async (): Promise<void> => {
      try {
        const params = {
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          period: (eventTime.value.dateRange ?? []).join(","),
        };
        const res = await playStatistics(params);
        const rows = Array.isArray(res) ? res : [];
        let sum = 0;
        const mapped = rows.map((item: { id?: string; name?: string; totalNum?: number }, index: number) => {
          const value = Number(item.totalNum) || 0;
          sum += value;
          return {
            id: String(item.id ?? ""),
            name: String(item.name ?? "--"),
            value,
            color: COLOR_LIST[index % COLOR_LIST.length],
            percent: 0,
          };
        });
        const base = sum || 1;
        pieItems.value = mapped.map((item) => ({
          ...item,
          percent: Math.round((item.value / base) * 1000) / 10,
        }));
        total.value = sum;
      } catch {
        pieItems.value = [];
        total.value = 0;
      } finally {
        loaded.value = true;
      }
    };

    const openBroadcast = (item?: BroadcastItem | { name?: string } | false): void => {
      parameterBroadcast.period = (eventTime.value.dateRange ?? []).join(",");
      if (item && typeof item === "object") {
        const name = item.name || "";
        const hit = pieItems.value.find((row) => row.name === name);
        parameterBroadcast.templateId = hit?.id || (item as BroadcastItem).id || "";
      } else {
        parameterBroadcast.templateId = "";
      }
      broadcastShow.value = true;
    };

    const openFromPie = (payload: { name?: string; data?: { originData?: BroadcastItem } } | BroadcastItem): void => {
      const resolved = (payload as { data?: { originData?: BroadcastItem } })?.data?.originData || (payload as BroadcastItem);
      openBroadcast(resolved);
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      timer = setInterval(
        () => {
          void loadStatistics();
        },
        (window as any).config.pageLoopRequestTime,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
        void loadStatistics();
      },
    );

    onMounted(() => {
      void loadStatistics();
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <button type="button" class={[styles.statCard, styles.isClickable]} onClick={() => openBroadcast(false)}>
          <span class={styles.statIcon} aria-hidden="true">
            <img src={totalIcon} alt="" />
          </span>
          <span class={styles.statContent}>
            <span class={styles.statLabel}>广播记录数</span>
            <span class={styles.statValueRow}>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={total.value} separator="" duration={1600} />
              </span>
              <span class={styles.statUnit}>条</span>
            </span>
          </span>
        </button>

        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.analysisSurface}>
            <div class={[styles.chartWrap, styles.isClickable]} onClick={() => openBroadcast(false)}>
              <ElevatorAnalysisPie
                pieData={pieItems.value}
                onClickbar={(payload) => {
                  openFromPie(payload);
                }}
              >
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={total.value} separator="" duration={1600} />
                </div>
                <div class={styles.pieCenterLabel}>广播记录</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.levelList}>
              {pieItems.value.map((item) => (
                <button
                  type="button"
                  class={[styles.levelItem, styles.isClickable]}
                  key={`${isZoom ? "zoom-" : ""}${item.id || item.name}`}
                  onClick={() => openBroadcast(item)}
                >
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
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="应急广播使用情况"
            class="visual-v2-sub-panel v2-panel-card emergency-broadcast-v2-panel"
            zoomable
            zoom-title="应急广播使用情况详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="broadcast-records" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={eventTime.value}
                    onUpdate:modelValue={(v) => {
                      eventTime.value = v;
                    }}
                    onSearch={loadStatistics}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalBroadcastTable
          showModal={broadcastShow.value}
          onClose={() => {
            broadcastShow.value = false;
          }}
          parameter={parameterBroadcast}
        />
      </>
    );
  },
});

export default EmergencyBroadcast;
