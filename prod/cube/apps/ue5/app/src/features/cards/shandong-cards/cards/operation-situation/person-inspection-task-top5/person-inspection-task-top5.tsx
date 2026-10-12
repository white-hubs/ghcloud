import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeMaintainStatisticsService } from "@/infrastructure/api/service";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./person-inspection-task-top5.module.less";

type TaskRankItem = {
  name: string;
  total: number;
  finish: number;
  rate: number;
};

const ROW_COLORS = ["#EF424A", "#FFAB10", "#2B7FFF", "#4DA6FF", "#00C2E0"];

export const PersonInspectionTaskTop5 = defineComponent({
  name: "PersonInspectionTaskTop5",
  setup() {
    const timeRange = ref<ModelValueItf>({
      timeType: "THIS_MONTH",
      dateRange: [],
    });
    const list = ref<TaskRankItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const maxTotal = ref(1);

    const getData = async (): Promise<void> => {
      try {
        const result = await cubeMaintainStatisticsService.getPatrolTaskTop5({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange?.join(",") ?? "",
        });
        const rows = Array.isArray(result) ? [...result] : [];
        rows.sort((a: { total?: number }, b: { total?: number }) => (Number(b.total) || 0) - (Number(a.total) || 0));
        const mapped = rows.slice(0, 5).map((item: { name?: string; total?: number; finishNum?: number }) => {
          const total = Number(item.total) || 0;
          const finish = Number(item.finishNum) || 0;
          return {
            name: item.name || "--",
            total,
            finish,
            rate: total > 0 ? Math.round((finish / total) * 1000) / 10 : 0,
          };
        });
        list.value = mapped;
        maxTotal.value = Math.max(...mapped.map((item) => item.total), 1);
      } catch {
        list.value = [];
        maxTotal.value = 1;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getData();
    });

    const renderRows = (isZoom: boolean): JSX.Element[] =>
      list.value.map((item, index) => {
        const totalWidth = Math.max((item.total / maxTotal.value) * 100, item.total > 0 ? 4 : 0);
        const finishWidth = item.total > 0 ? Math.max((item.finish / item.total) * totalWidth, item.finish > 0 ? 4 : 0) : 0;
        const color = ROW_COLORS[index % ROW_COLORS.length];
        return (
          <div class={styles.rankItem} key={`${isZoom ? "zoom-" : ""}${item.name}-${index}`}>
            <div class={styles.rankTop}>
              <span class={styles.rankLeft}>
                <span class={styles.rankIndex}>{index + 1}</span>
                <span class={styles.rankName} title={item.name}>
                  {item.name}
                </span>
              </span>
              <span class={styles.rankMeta}>
                <span class={styles.rankCount}>
                  {item.finish}/{item.total}
                  <em class={styles.rankUnit}>个</em>
                </span>
                <span class={styles.rankShare}>完成率 {item.rate}%</span>
              </span>
            </div>
            <div class={styles.rankBarTrack}>
              <span class={styles.rankBarTotal} style={{ width: `${totalWidth}%`, background: `${color}55` }} />
              <span
                class={styles.rankBarFinish}
                style={{
                  width: `${finishWidth}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                }}
              />
            </div>
          </div>
        );
      });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.zoomBody : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : list.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.listSurface, isZoom ? styles.isZoomList : ""]}>{renderRows(isZoom)}</div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="人员巡检任务top5"
          class="visual-v2-sub-panel v2-panel-card person-inspection-task-top5-v2-panel"
          zoomable
          zoom-title="人员巡检任务top5详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={timeRange.value}
                  onUpdate:modelValue={(v) => {
                    timeRange.value = v;
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

export default PersonInspectionTaskTop5;
