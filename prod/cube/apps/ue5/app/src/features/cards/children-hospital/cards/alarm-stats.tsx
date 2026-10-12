import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel, statisticsStatus } from "@/infrastructure/api/alarm";
import { deviceAlarmNum } from "@/infrastructure/api/device";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./alarm-stats.module.less";

const alarmCountIcon = getThemeImage("alarm-count.png");
const COLOR_LIST = ["#2F8DFF", "#19F8F7", "#FFC700", "#F14545"];

type StatItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

export const AlarmStats = defineComponent({
  name: "AlarmStats",
  setup() {
    const { globalState } = useStateStore();
    const receiveOverviewTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const alarmCount = ref(0);
    const alarmRatio = ref(0);
    const deviceAlarmStatistics = ref<StatItem[]>([]);
    const alarmLevelStatistics = ref<StatItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const pieData = computed(() => [...deviceAlarmStatistics.value, ...alarmLevelStatistics.value]);
    const hasAlarmStats = computed(() => pieData.value.length > 0);

    const toStatItems = (rows: Array<{ label?: string; name?: string; value?: number; color?: string }>, total: number): StatItem[] => {
      const base = total || 1;
      return rows.map((item, index) => {
        const value = Number(item.value) || 0;
        return {
          name: String(item.label || item.name || "--"),
          value,
          color: item.color || COLOR_LIST[index % COLOR_LIST.length],
          percent: Math.round((value / base) * 1000) / 10,
        };
      });
    };

    const changeHandleReceiveOverviewTime = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: receiveOverviewTime.value.dateRange.join(","),
        type: receiveOverviewTime.value.timeType,
      };
      try {
        const [status, deviceAlarmRes, alarmLevelRes] = await Promise.all([
          statisticsStatus(params),
          deviceAlarmNum(params),
          statisticsLevel(params),
        ]);
        const count = Number(status?.alarmNum || 0);
        alarmCount.value = count;
        alarmRatio.value = Number(status?.chainRatio || 0);
        const deviceRows = (deviceAlarmRes?.result || []).map((item: any, index: number) => ({
          label: item.genreName,
          value: Number(item.alarmNum || 0),
          color: COLOR_LIST[index % COLOR_LIST.length],
        }));
        const levelRows = (alarmLevelRes || []).map((item: any, index: number) => ({
          label: item.name,
          value: Number(item.alarmNum || 0),
          color: COLOR_LIST[index % COLOR_LIST.length],
        }));
        deviceAlarmStatistics.value = toStatItems(deviceRows, count);
        alarmLevelStatistics.value = toStatItems(levelRows, count);
      } catch {
        alarmCount.value = 0;
        alarmRatio.value = 0;
        deviceAlarmStatistics.value = [];
        alarmLevelStatistics.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeHandleReceiveOverviewTime();
    });

    const renderRatio = (): JSX.Element => {
      const ratio = Number(alarmRatio.value || 0);
      const isUp = ratio > 0;
      return (
        <div class={[styles.ratio, isUp ? styles.ratioUp : styles.ratioDown]}>
          <span>环比</span>
          <i />
          <strong>
            {isUp ? "+" : ""}
            {ratio}%
          </strong>
        </div>
      );
    };

    const renderStatGroup = (title: string, data: StatItem[]): JSX.Element | null => {
      if (!data.length) return null;
      return (
        <div class={styles.statGroup}>
          <div class={styles.groupTitle}>{title}</div>
          <div class={styles.groupList}>
            {data.map((item) => (
              <div class={styles.groupItem} key={`${title}-${item.name}`}>
                <span class={styles.groupName}>
                  <i style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statCard}>
          <span class={styles.statIcon} aria-hidden="true">
            <img src={alarmCountIcon} alt="" />
          </span>
          <span class={styles.statContent}>
            <span class={styles.statLabel}>报警数</span>
            <span class={styles.statValue}>
              <CountTo startVal={0} endVal={alarmCount.value} separator="" duration={1600} />
            </span>
          </span>
          {renderRatio()}
        </div>

        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasAlarmStats.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.analysisSurface}>
            <div class={styles.chartWrap}>
              <ElevatorAnalysisPie pieData={pieData.value}>
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={alarmCount.value} separator="" duration={1600} />
                </div>
                <div class={styles.pieCenterLabel}>报警总数</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.groupWrap}>
              {renderStatGroup("设备报警统计", deviceAlarmStatistics.value)}
              {renderStatGroup("报警等级统计", alarmLevelStatistics.value)}
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="报警态势"
          class="visual-v2-sub-panel v2-panel-card hospital-alarm-situation-v2-panel"
          zoomable
          zoom-title="报警态势详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="child-hospital-alarm" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={receiveOverviewTime.value}
                  onUpdate:modelValue={(v) => {
                    receiveOverviewTime.value = v;
                  }}
                  onSearch={changeHandleReceiveOverviewTime}
                />
              </div>
            ),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default AlarmStats;
