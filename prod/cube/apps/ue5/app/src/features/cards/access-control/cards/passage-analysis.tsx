import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch, provide } from "vue";

import PassageRecordsTable from "../components/passage-records-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { trafficAnalysis } from "@/infrastructure/utils/requestData/accessControl";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./passage-analysis.module.less";

type PassageItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
  eventResult: string;
};

const NORMAL_COLOR = "#328BF7";
const ABNORMAL_COLOR = "#F14545";

const resolvePassageColor = (name: string, fallback?: string, index = 0): string => {
  if (/异常|告警|报警|违规|失败|拒绝/.test(name)) return ABNORMAL_COLOR;
  if (/正常|成功|通过/.test(name)) return NORMAL_COLOR;
  if (fallback) return fallback;
  return index === 1 ? ABNORMAL_COLOR : NORMAL_COLOR;
};

const resolveEventResult = (name: string): string => {
  if (/异常|告警|报警|违规|失败|拒绝/.test(name)) return "DO_REFUSE";
  if (/正常|成功|通过/.test(name)) return "DO_PASS";
  return "";
};

export const PassageAnalysis = defineComponent({
  name: "PassageAnalysis",
  setup() {
    const { globalState } = useStateStore();
    const throughType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const throughNum = ref(0);
    const pieItems = ref<PassageItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const showModal = ref(false);
    const trafficParams = reactive({
      date: [] as string[],
      eventResult: "",
    });
    let timer: ReturnType<typeof setInterval> | null = null;

    const hasData = computed(() => pieItems.value.length > 0);

    const trafficAnalysisInfo = async (): Promise<void> => {
      try {
        const res = await trafficAnalysis(throughType.value.timeType);
        throughNum.value = Number(res?.total) || 0;
        const rows = Array.isArray(res?.arr) ? res.arr : [];
        const total = throughNum.value || 1;
        pieItems.value = rows.map((item: { label?: string; name?: string; color?: string; value?: number }, index: number) => {
          const name = item.label || item.name || "--";
          const value = Number(item.value) || 0;
          return {
            name,
            value,
            color: resolvePassageColor(name, item.color, index),
            percent: Math.round((value / total) * 1000) / 10,
            eventResult: resolveEventResult(name),
          };
        });
      } catch {
        throughNum.value = 0;
        pieItems.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openRecords = (eventResult = ""): void => {
      trafficParams.eventResult = eventResult;
      trafficParams.date = [...(throughType.value.dateRange ?? [])];
      showModal.value = true;
    };

    const openFromPie = (payload: { name?: string; data?: { originData?: PassageItem } } | PassageItem): void => {
      const resolved = (payload as { data?: { originData?: PassageItem } })?.data?.originData || (payload as PassageItem);
      const name = resolved?.name || (payload as { name?: string })?.name || "";
      const hit = pieItems.value.find((item) => item.name === name);
      openRecords(hit?.eventResult || resolveEventResult(name));
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      timer = setInterval(
        () => {
          void trafficAnalysisInfo();
        },
        (window as any).config.pageLoopRequestTime,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
        void trafficAnalysisInfo();
      },
    );

    onMounted(() => {
      void trafficAnalysisInfo();
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
            <div class={[styles.chartWrap, styles.isClickable]} onClick={() => openRecords("")}>
              <ElevatorAnalysisPie
                pieData={pieItems.value}
                onClickbar={(payload) => {
                  openFromPie(payload);
                }}
              >
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={throughNum.value} separator="" duration={1600} />
                </div>
                <div class={styles.pieCenterLabel}>通行总数</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.levelList}>
              {pieItems.value.map((item) => (
                <button
                  type="button"
                  class={[styles.levelItem, styles.isClickable]}
                  key={`${isZoom ? "zoom-" : ""}${item.name}`}
                  onClick={() => openRecords(item.eventResult)}
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
                    <span class={styles.levelShare}>{item.percent}%</span>
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
            title="通行分析"
            class="visual-v2-sub-panel v2-panel-card passage-analysis-v2-panel"
            zoomable
            zoom-title="通行分析详情"
            zoom-width={800}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="access-control-analysis" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={throughType.value}
                    onUpdate:modelValue={(v) => {
                      throughType.value = v;
                    }}
                    onSearch={trafficAnalysisInfo}
                  />
                </div>
              ),
              "zoom-content": () => renderBody(true),
              default: () => renderBody(false),
            }}
          />
        </div>
        <PassageRecordsTable
          showModal={showModal.value}
          parameter={trafficParams}
          onClose={() => {
            showModal.value = false;
          }}
        />
      </>
    );
  },
});

export default PassageAnalysis;
