import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatistics } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import type { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./alarm-statistics.module.less";

const alarmCountIcon = getThemeImage("alarm-count.png");

type MetricTone = "handle" | "actual";

type MetricItem = {
  key: MetricTone;
  title: string;
  percent: number;
  count: number;
  color: string;
  alarmStatus?: string;
};

export const AlarmStatistics = defineComponent({
  name: "AlarmStatistics",
  setup() {
    const { globalState } = useStateStore();
    const timeFrame = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmModalShow = ref(false);
    const summary = reactive({
      total: 0,
      handle: 0,
      actual: 0,
      handleRate: 0,
      actualRate: 0,
    });
    const parameter = reactive({
      alarmLevelCode: "",
      alarmStatus: "" as string | undefined,
      dateRange: [] as string[],
      departmentId: "" as string | undefined,
    });

    const metrics = computed<MetricItem[]>(() => [
      {
        key: "handle",
        title: "报警处理占比",
        percent: summary.handleRate,
        count: summary.handle,
        color: "#5AD0EA",
        alarmStatus: "ALARM_HANDLER",
      },
      {
        key: "actual",
        title: "报警真实占比",
        percent: summary.actualRate,
        count: summary.actual,
        color: "#2989FF",
      },
    ]);

    const getAlarmStatistics = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value?.dateRange?.join(",") ?? "",
      };
      try {
        const res: any = await alarmStatistics(params);
        const total = Number(res?.alarmNum) || 0;
        const handle = Number(res?.alarmHandlerNum) || 0;
        const actual = Number(res?.alarmActualNum) || 0;
        summary.total = total;
        summary.handle = handle;
        summary.actual = actual;
        if (total > 0) {
          summary.handleRate = Math.round((handle / total) * 10000) / 100;
          summary.actualRate = Math.round((actual / total) * 10000) / 100;
        } else {
          summary.handleRate = 0;
          summary.actualRate = 0;
        }
      } catch {
        summary.total = 0;
        summary.handle = 0;
        summary.actual = 0;
        summary.handleRate = 0;
        summary.actualRate = 0;
      }
    };

    const openSummaryModal = (): void => {
      parameter.alarmLevelCode = "";
      parameter.departmentId = undefined;
      parameter.alarmStatus = undefined;
      parameter.dateRange = [...(timeFrame.value?.dateRange ?? [])];
      alarmModalShow.value = true;
    };

    const openMetricModal = (item: MetricItem): void => {
      parameter.alarmLevelCode = "";
      parameter.departmentId = undefined;
      parameter.alarmStatus = item.alarmStatus;
      parameter.dateRange = [...(timeFrame.value?.dateRange ?? [])];
      alarmModalShow.value = true;
    };

    const ringStyle = (item: MetricItem): Record<string, string> => {
      const clamped = Math.max(0, Math.min(100, item.percent));
      return {
        background: `conic-gradient(${item.color} ${clamped}%, rgba(125, 198, 255, 0.16) 0)`,
      };
    };

    onMounted(() => {
      void getAlarmStatistics();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body"]} data-no-zoom>
        <button type="button" class={[styles.summaryCard, styles.isTotal]} onClick={openSummaryModal}>
          <span class={styles.statIcon} aria-hidden="true">
            <img src={alarmCountIcon} alt="" />
          </span>
          <span class={styles.statContent}>
            <span class={styles.statLabel}>报警总数</span>
            <span class={styles.statValue}>
              <CountTo startVal={0} endVal={summary.total} separator="" duration={1600} />
              <em class={styles.statUnit}>次</em>
            </span>
          </span>
        </button>

        <div class={styles.metricGrid}>
          {metrics.value.map((item) => (
            <button
              key={`${isZoom ? "zoom-" : ""}${item.key}`}
              type="button"
              class={[styles.metricCard, styles[`tone-${item.key}`]]}
              onClick={() => openMetricModal(item)}
            >
              <div class={styles.ring} style={ringStyle(item)}>
                <div class={styles.ringHole}>
                  <span class={styles.percentValue}>{item.percent.toFixed(1)}</span>
                  <span class={styles.percentUnit}>%</span>
                </div>
              </div>
              <div class={styles.metricMeta}>
                <span class={styles.metricTitle}>{item.title}</span>
                <span class={styles.metricCount}>
                  <span class={styles.metricCountValue}>
                    <CountTo startVal={0} endVal={item.count} separator="" duration={1600} />
                  </span>
                  <span class={styles.metricCountSplit}>/</span>
                  <span class={styles.metricCountTotal}>{summary.total}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="报警统计"
            class="visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel alarm-statistics-v2-panel"
            zoomable
            zoom-title="报警统计详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-alarm" />,
              extra: () => (
                <div class={["air-conditioning-header-toolbar", styles.headerToolbar]} data-no-zoom>
                  <DateInlineForm
                    modelValue={timeFrame.value}
                    onUpdate:modelValue={(v) => {
                      timeFrame.value = v;
                    }}
                    onSearch={getAlarmStatistics}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalAlarmTableNew showModal={alarmModalShow.value} onClose={() => (alarmModalShow.value = false)} parameter={parameter} />
      </>
    );
  },
});

export default AlarmStatistics;
