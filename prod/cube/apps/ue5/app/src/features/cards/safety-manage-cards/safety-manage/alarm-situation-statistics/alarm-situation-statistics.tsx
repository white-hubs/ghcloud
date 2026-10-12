import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsSituation } from "@/infrastructure/api/alarm";
import { completionRate, finishedRatio, handleRatio, projectNumStatistics } from "@/infrastructure/api/maintain";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./alarm-situation-statistics.module.less";

type RatioItem = {
  name: string;
  value: number;
  tone: "default" | "isWarning" | "isDanger";
  color: string;
};

const toRatio = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 10) / 10 : 0;
};

const DEFAULT_ITEMS: RatioItem[] = [
  { name: "报警处理率", value: 0, tone: "default", color: "#2B7FFF" },
  { name: "隐患处理率", value: 0, tone: "default", color: "#19F8F7" },
  { name: "巡检任务完成率", value: 0, tone: "default", color: "#00F27B" },
  { name: "巡更任务完成率", value: 0, tone: "default", color: "#74AEE7" },
  { name: "小散工程异常率", value: 0, tone: "isDanger", color: "#EF424A" },
];

export const AlarmSituationStatistics = defineComponent({
  name: "AlarmSituationStatistics",
  props: {
    title: {
      type: String,
      default: "报警情况统计",
    },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const alarmTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const contentList = ref<RatioItem[]>(DEFAULT_ITEMS.map((item) => ({ ...item })));
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const changeDate = async (): Promise<void> => {
      const period = alarmTime.value.dateRange?.join(",") ?? "";
      try {
        const [patrol, project, inspectRatio, hiddenRatio, alarm] = await Promise.all([
          completionRate({ period }),
          projectNumStatistics({ period }),
          finishedRatio({ period }),
          handleRatio({ period }),
          statisticsSituation({
            areaId: globalState.business.currentAreaId,
            period,
            deviceTags: [globalState.business.currentMenu],
          }),
        ]);
        const abnormalRate = project?.total ? (Number(project.abnormal) / Number(project.total)) * 100 : 0;
        contentList.value = [
          { ...DEFAULT_ITEMS[0], value: toRatio(alarm?.handlerRatio) },
          { ...DEFAULT_ITEMS[1], value: toRatio(hiddenRatio) },
          { ...DEFAULT_ITEMS[2], value: toRatio(inspectRatio) },
          { ...DEFAULT_ITEMS[3], value: toRatio(patrol?.ratio) },
          { ...DEFAULT_ITEMS[4], value: toRatio(abnormalRate) },
        ];
      } catch {
        contentList.value = DEFAULT_ITEMS.map((item) => ({ ...item, value: 0 }));
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeDate();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }

      return (
        <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
          <div class={styles.statsGrid}>
            {contentList.value.map((item) => {
              const barWidth = Math.max(Math.min(item.value, 100), item.value > 0 ? 4 : 0);
              return (
                <div class={[styles.statCard, item.tone === "default" ? "" : styles[item.tone]]} key={item.name}>
                  <span class={styles.statLabel}>{item.name}</span>
                  <span class={styles.statValue}>
                    <CountTo startVal={0} endVal={item.value} separator="" duration={1400} decimals={1} />
                    <em class={styles.statUnit}>%</em>
                  </span>
                  <span class={styles.statBarTrack}>
                    <span
                      class={styles.statBarFill}
                      style={{
                        width: `${barWidth}%`,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                      }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card alarm-situation-statistics-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-alarm" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={alarmTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmTime.value = v;
                  }}
                  onSearch={changeDate}
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
