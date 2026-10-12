import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { recordStatus, statisticsLevel } from "@/infrastructure/api/alarm";
import { AlarmLevelType } from "@/infrastructure/api/models/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./alarm-level-statistics.module.less";

const titleIcon = getThemeImage("alarm-event.png");
const alarmCountIcon = getThemeImage("alarm-count.png");
const alarmUnhandledIcon = getThemeImage("alarm-count-unhandled.png");
const alarmHandledIcon = getThemeImage("alarm-count-handled.png");

const levelColors = ["#f14545", "#ffab10", "#2f8dff", "#655dd1"];
const levelCodeMap: Record<string, string> = {
  一级: "one_level",
  二级: "two_level",
  三级: "three_level",
  四级: "four_level",
};

type PieDataItem = {
  name: string;
  value: number;
  color: string;
  levelCode: string;
  chainRatio: number;
  isGrow: boolean;
  percent: number;
};

export const AlarmLevelStatistics = defineComponent({
  name: "AlarmLevelStatistics",
  setup() {
    const { globalState } = useStateStore();
    const topTimeFrame = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });
    const alarmModalShow = ref(false);
    const parameter = reactive({
      alarmLevelCode: "",
      alarmStatus: "" as string | undefined,
      filterAlarmStatus: "" as string | undefined,
      dateRange: [] as string[],
      departmentId: "" as string | undefined,
      deviceTags: [
        "builtin.app::SECURITY_MONITORING",
        "builtin.app::ELECTRICMANAGE",
        "builtin.app::FIRECONTROL",
        "builtin.app::GAS_MANAGEMENT",
        "builtin.app::ROTATINGMANAGE",
      ].toString(),
    });
    const levelData = ref<AlarmLevelType[]>([
      {
        alarmNum: 0,
        name: "一级报警",
        chainRatio: 0,
        isGrow: false,
      },
    ]);
    const summary = reactive({
      total: 0,
      unresolved: 0,
      handled: 0,
    });
    const hasData = computed(() => levelData.value.some((item) => Number(item.alarmNum) > 0));
    const pieData = computed<PieDataItem[]>(() => {
      const total = summary.total || levelData.value.reduce((sum, item) => sum + (Number(item.alarmNum) || 0), 0) || 1;
      return levelData.value.map((item, index) => {
        const value = Number(item.alarmNum) || 0;
        return {
          name: item.name,
          value,
          color: levelColors[index] || levelColors[levelColors.length - 1],
          levelCode: levelCodeMap[item.name.substring(0, 2)] || "",
          chainRatio: item.chainRatio,
          isGrow: Boolean(item.isGrow),
          percent: Math.round((value / total) * 1000) / 10,
        };
      });
    });
    let timer: ReturnType<typeof setInterval> | null = null;

    const openSummaryModal = (mode?: "total" | "unresolved" | "handled"): void => {
      parameter.alarmLevelCode = "";
      parameter.departmentId = undefined;
      parameter.dateRange = [...topTimeFrame.value.dateRange];
      if (mode === "handled") {
        parameter.alarmStatus = "ALARM_HANDLER";
        parameter.filterAlarmStatus = undefined;
      } else if (mode === "unresolved") {
        parameter.alarmStatus = undefined;
        parameter.filterAlarmStatus = ["ALARM_HANDLER"].toString();
      } else {
        parameter.alarmStatus = undefined;
        parameter.filterAlarmStatus = undefined;
      }
      alarmModalShow.value = true;
    };

    const openPieLevelModal = (item: PieDataItem): void => {
      parameter.alarmStatus = undefined;
      parameter.filterAlarmStatus = undefined;
      parameter.departmentId = undefined;
      parameter.dateRange = [...topTimeFrame.value.dateRange];
      parameter.alarmLevelCode = item.levelCode;
      alarmModalShow.value = true;
    };

    async function getAlarmLevel() {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
        deviceTags: parameter.deviceTags,
      };
      try {
        const [levelRes, statusRes] = await Promise.all([statisticsLevel(params), recordStatus(params)]);
        levelData.value = (Array.isArray(levelRes) ? levelRes : []).map((item) => ({
          ...item,
          isGrow: item.chainRatio > 0,
          name: item.name.includes("报警") ? item.name : `${item.name}报警`,
        }));
        summary.total = Number(statusRes.alarmNum) || 0;
        summary.unresolved = Number(statusRes.alarmUnresolvedHandlerNum) || 0;
        summary.handled = Number(statusRes.alarmHandlerNum) || 0;
      } catch {
        levelData.value = [];
        summary.total = 0;
        summary.unresolved = 0;
        summary.handled = 0;
      }
    }

    const init = (): void => {
      void getAlarmLevel();
    };

    onMounted(() => {
      init();
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["alarm-level-statistics-v2-panel", styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body"]}
        data-no-zoom
      >
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal]} onClick={() => openSummaryModal("total")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={alarmCountIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>报警数</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={summary.total} separator="" duration={2000} />
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isHandled]} onClick={() => openSummaryModal("handled")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={alarmHandledIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>已处理数</span>
              <span class={[styles.statValue, styles.isHandledValue]}>
                <CountTo startVal={0} endVal={summary.handled} separator="" duration={2000} />
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isUnresolved]} onClick={() => openSummaryModal("unresolved")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={alarmUnhandledIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>未处理数</span>
              <span class={[styles.statValue, styles.isUnresolvedValue]}>
                <CountTo startVal={0} endVal={summary.unresolved} separator="" duration={2000} />
              </span>
            </span>
          </button>
        </div>

        <div class={[styles.analysisSurface, hasData.value ? "" : styles.isEmpty]}>
          {hasData.value ? (
            <>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie pieData={pieData.value} onClickbar={openPieLevelModal}>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={summary.total} separator="" duration={2000} />
                  </div>
                  <div class={styles.pieCenterLabel}>报警总数</div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.levelList}>
                {pieData.value.map((item) => (
                  <button
                    key={`${isZoom ? "zoom-" : ""}${item.name}`}
                    type="button"
                    class={styles.levelItem}
                    onClick={() => openPieLevelModal(item)}
                  >
                    <span class={styles.levelName}>
                      <i class={styles.levelColor} style={{ background: item.color }} />
                      <span class={styles.levelNameText} title={item.name}>
                        {item.name}
                      </span>
                    </span>
                    <span class={styles.levelCount}>
                      {item.value}
                      <em class={styles.levelUnit}>次</em>
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="报警级别统计"
            class="visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel alarm-level-statistics-v2-panel"
            zoomable
            zoom-title="报警级别统计详情"
            zoom-width={920}
            v-slots={{
              titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
              extra: () => (
                <div class="air-conditioning-header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={topTimeFrame.value}
                    onUpdate:modelValue={(v) => {
                      topTimeFrame.value = v;
                    }}
                    onSearch={getAlarmLevel}
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

export default AlarmLevelStatistics;
