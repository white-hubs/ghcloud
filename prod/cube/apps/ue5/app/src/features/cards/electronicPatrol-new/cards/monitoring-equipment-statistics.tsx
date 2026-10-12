import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TaskStatistics } from "@/infrastructure/api/maintain";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./monitoring-equipment-statistics.module.less";

const heroIcon = getThemeImage("device-total.png");
const pendingIcon = getThemeImage("device-total-offline.png");
const runningIcon = getThemeImage("device-total-online.png");
const finishedIcon = getThemeImage("device-total.png");
const abnormalIcon = getThemeImage("alarm-count-unhandled.png");

type StatusItem = {
  name: string;
  value: number;
  tone: "isAmber" | "isCyan" | "isSuccess" | "isRed";
  icon: string;
};

type MetricItem = {
  title: string;
  value: number;
  unit?: string;
};

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const MonitoringEquipmentStatistics = defineComponent({
  name: "MonitoringEquipmentStatistics",
  setup() {
    const alarmTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const total = ref(0);
    const statusList = ref<StatusItem[]>([
      { name: "待接收", value: 0, tone: "isAmber", icon: pendingIcon },
      { name: "执行中", value: 0, tone: "isCyan", icon: runningIcon },
      { name: "已结束", value: 0, tone: "isSuccess", icon: finishedIcon },
      { name: "异常结束", value: 0, tone: "isRed", icon: abnormalIcon },
    ]);
    const metrics = ref<MetricItem[]>([
      { title: "包含巡更路线", value: 0, unit: "条" },
      { title: "涉及巡更点", value: 0, unit: "个" },
      { title: "巡更覆盖率", value: 0, unit: "%" },
    ]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const changeDates = async (): Promise<void> => {
      try {
        const data = await TaskStatistics({
          period: alarmTime.value.dateRange?.join(",") ?? "",
          type: alarmTime.value.timeType,
        });
        total.value = toNumber(data?.taskNumberStatistics?.totalNumber);
        statusList.value = [
          {
            name: "待接收",
            value: toNumber(data?.taskStatusStatistics?.toBeReceivedNumber),
            tone: "isAmber",
            icon: pendingIcon,
          },
          {
            name: "执行中",
            value: toNumber(data?.taskStatusStatistics?.inExecutionNumber),
            tone: "isCyan",
            icon: runningIcon,
          },
          {
            name: "已结束",
            value: toNumber(data?.taskStatusStatistics?.finishedNumber),
            tone: "isSuccess",
            icon: finishedIcon,
          },
          {
            name: "异常结束",
            value: toNumber(data?.taskStatusStatistics?.abnormalFinishedNumber),
            tone: "isRed",
            icon: abnormalIcon,
          },
        ];
        metrics.value = [
          {
            title: "包含巡更路线",
            value: toNumber(data?.taskLineStatistics?.totalNumber),
            unit: "条",
          },
          {
            title: "涉及巡更点",
            value: toNumber(data?.taskLineStatistics?.locationNumber),
            unit: "个",
          },
          {
            title: "巡更覆盖率",
            value: toNumber(data?.taskLineStatistics?.locationCoverageRate),
            unit: "%",
          },
        ];
      } catch {
        total.value = 0;
        statusList.value = statusList.value.map((item) => ({ ...item, value: 0 }));
        metrics.value = metrics.value.map((item) => ({ ...item, value: 0 }));
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeDates();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }

      return (
        <div class={["monitoring-equipment-v2-panel", styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
          <div class={styles.heroCard}>
            <span class={styles.heroIcon} aria-hidden="true">
              <img src={heroIcon} alt="" />
            </span>
            <span class={styles.heroContent}>
              <span class={styles.heroLabel}>巡更任务总数</span>
              <span class={styles.heroValue}>
                {loaded.value ? <CountTo startVal={0} endVal={total.value} separator="" duration={1400} /> : "--"}
                <em class={styles.heroUnit}>个</em>
              </span>
            </span>
          </div>

          <div class={styles.statsGrid}>
            {statusList.value.map((item) => (
              <div class={[styles.statCard, styles[item.tone]]} key={item.name}>
                <span class={styles.statIcon} aria-hidden="true">
                  <img src={item.icon} alt="" />
                </span>
                <span class={styles.statContent}>
                  <span class={styles.statLabel}>{item.name}</span>
                  <span class={styles.statValue}>
                    {loaded.value ? <CountTo startVal={0} endVal={item.value} separator="" duration={1400} /> : "--"}
                    <em class={styles.statUnit}>个</em>
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div class={styles.metricRow}>
            {metrics.value.map((item) => (
              <div class={styles.metricCard} key={item.title}>
                <span class={styles.metricLabel} title={item.title}>
                  {item.title}
                </span>
                <span class={styles.metricValue}>
                  {loaded.value ? <CountTo startVal={0} endVal={item.value} separator="" duration={1400} /> : "--"}
                  {item.unit ? <em class={styles.metricUnit}>{item.unit}</em> : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="监控设备统计"
          class="visual-v2-sub-panel v2-panel-card monitoring-equipment-v2-panel"
          zoomable
          zoom-title="监控设备统计详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-monitor" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={alarmTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmTime.value = v;
                  }}
                  onSearch={changeDates}
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

export default MonitoringEquipmentStatistics;
