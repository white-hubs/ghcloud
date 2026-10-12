import { computed, defineComponent, onMounted, ref, provide } from "vue";

import { FaultHandleStatus, FaultHandleStatusMap } from "@ghcloud/cube-maintain-service";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeMaintainStatisticsService } from "@/infrastructure/api/service";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./fault-object-status-statistics.module.less";

type FaultStatusItem = {
  name: string;
  value: number;
  ratio: number;
  color: string;
  tone: "handling" | "reject" | "undo" | "pass";
};

const STATUS_META = new Map([
  [FaultHandleStatus.HANDLING, { color: "#2B7FFF", tone: "handling" as const }],
  [FaultHandleStatus.REJECT, { color: "#F14545", tone: "reject" as const }],
  [FaultHandleStatus.UNDO, { color: "#FFAB10", tone: "undo" as const }],
  [FaultHandleStatus.PASS, { color: "#00C98D", tone: "pass" as const }],
]);

export const FaultObjectStatusStatistics = defineComponent({
  name: "FaultObjectStatusStatistics",
  setup() {
    const timeRange = ref<ModelValueItf>({
      timeType: "THIS_MONTH",
      dateRange: [],
    });
    const faultData = ref<FaultStatusItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const total = computed(() => faultData.value.reduce((sum, item) => sum + item.value, 0));

    const getData = async (): Promise<void> => {
      loaded.value = false;
      try {
        const result = await cubeMaintainStatisticsService.getFaultHandleStatusStatistics({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange?.join(",") ?? "",
        });
        const rows = Array.isArray(result) ? result : [];
        faultData.value = rows.map((item) => {
          const meta = STATUS_META.get(item.statusType) ?? { color: "#2B7FFF", tone: "handling" as const };
          const rawRatio = Number(item.rate) || 0;
          return {
            name: FaultHandleStatusMap.get(item.statusType) || "--",
            value: Number(item.num) || 0,
            ratio: Math.round((rawRatio > 1 ? rawRatio : rawRatio * 100) * 10) / 10,
            color: meta.color,
            tone: meta.tone,
          };
        });
      } catch {
        faultData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.zoomBody : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : faultData.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.analysisSurface}>
            <div class={styles.pieWrap}>
              <ElevatorAnalysisPie class={styles.pie} pie-class={styles.pieChart} pieData={faultData.value}>
                <div class={styles.pieCenter}>
                  <strong>
                    <CountTo startVal={0} endVal={total.value} separator="" duration={1200} />
                  </strong>
                  <span>故障总数</span>
                </div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.statusList}>
              {faultData.value.map((item) => (
                <div class={[styles.statusItem, styles[item.tone]]} key={item.name}>
                  <div class={styles.statusMeta}>
                    <span class={styles.statusName}>
                      <i style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <strong>{item.value}</strong>
                  </div>
                  <div class={styles.statusTrack}>
                    <span style={{ width: `${Math.min(100, Math.max(0, item.ratio))}%`, backgroundColor: item.color }} />
                  </div>
                  <span class={styles.statusRatio}>占比 {item.ratio}%</span>
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
          title="故障对象状态统计"
          class="visual-v2-sub-panel v2-panel-card fault-object-status-statistics-v2-panel"
          zoomable
          zoom-title="故障对象状态统计详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-alarm" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={timeRange.value}
                  onUpdate:modelValue={(value) => {
                    timeRange.value = value;
                  }}
                  onSearch={getData}
                  timeList={[
                    { label: "本周", value: "THIS_WEEK" },
                    { label: "本月", value: "THIS_MONTH" },
                    { label: "今年", value: "THIS_YEAR" },
                  ]}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});
