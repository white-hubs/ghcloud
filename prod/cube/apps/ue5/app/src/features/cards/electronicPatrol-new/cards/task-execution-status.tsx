import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TaskAbnormal, TaskMissing, completionRate, taskAbnormalNum } from "@/infrastructure/api/maintain";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./task-execution-status.module.less";

type RatioItem = {
  name: string;
  value: number;
  tone: "default" | "isCyan" | "isWarning" | "isDanger";
  color: string;
};

const toRatio = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 10) / 10 : 0;
};

export const TaskExecutionStatus = defineComponent({
  name: "TaskExecutionStatus",
  setup() {
    const alarmTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const contentList = ref<RatioItem[]>([
      { name: "任务完成率", value: 0, tone: "default", color: "#2B7FFF" },
      { name: "巡更点漏巡占比", value: 0, tone: "isWarning", color: "#FFAB10" },
      { name: "任务完成时长占比", value: 0, tone: "isCyan", color: "#19F8F7" },
      { name: "巡更点异常占比", value: 0, tone: "isDanger", color: "#EF424A" },
    ]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const loadTaskData = async (): Promise<void> => {
      const period = alarmTime.value.dateRange?.join(",") ?? "";
      try {
        const [missing, abnormalNum, abnormal, completion] = await Promise.all([
          TaskMissing({ period }),
          TaskAbnormal({ period }),
          taskAbnormalNum({ period }),
          completionRate({ period }),
        ]);
        contentList.value = [
          { name: "任务完成率", value: toRatio(completion?.ratio), tone: "default", color: "#2B7FFF" },
          { name: "巡更点漏巡占比", value: toRatio(missing?.proportion), tone: "isWarning", color: "#FFAB10" },
          { name: "任务完成时长占比", value: toRatio(abnormalNum?.proportion), tone: "isCyan", color: "#19F8F7" },
          {
            name: "巡更点异常占比",
            value: toRatio(abnormal?.abnormalRatio),
            tone: "isDanger",
            color: "#EF424A",
          },
        ];
      } catch {
        contentList.value = contentList.value.map((item) => ({ ...item, value: 0 }));
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void loadTaskData();
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
                    {loaded.value ? <CountTo startVal={0} endVal={item.value} separator="" duration={1400} decimals={1} /> : "--"}
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
          title="任务执行情况"
          class="visual-v2-sub-panel v2-panel-card task-execution-v2-panel"
          zoomable
          zoom-title="任务执行情况详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={alarmTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmTime.value = v;
                  }}
                  onSearch={loadTaskData}
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

export default TaskExecutionStatus;
