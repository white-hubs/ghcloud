import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { locationList } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-point-abnormal-top5.module.less";

type AbnormalRow = {
  locationName?: string;
  abnormalNum?: number | string;
  patrolRatio?: number | string;
  key?: string | number;
};

export const PatrolPointAbnormalTop5 = defineComponent({
  name: "PatrolPointAbnormalTop5",
  setup() {
    const alarmTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const planListData = ref<AbnormalRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const column = [
      {
        title: "巡更点",
        dataIndex: "locationName",
        flex: 1.2,
        align: "left" as const,
      },
      {
        title: "异常次数",
        dataIndex: "abnormalNum",
        flex: 0.8,
        align: "center" as const,
      },
      {
        title: "巡更率",
        dataIndex: "patrolRatio",
        flex: 0.8,
        align: "center" as const,
      },
    ];

    const changeAlarmTime = async (): Promise<void> => {
      try {
        const res = await locationList({ period: alarmTime.value.dateRange?.join(",") ?? "" });
        const rows = Array.isArray(res) ? res : [];
        planListData.value = rows.map((item: AbnormalRow, index: number) => ({
          ...item,
          key: item.key ?? `${item.locationName ?? "point"}-${index}`,
          locationName: item.locationName || "--",
          abnormalNum: item.abnormalNum ?? 0,
          patrolRatio: item.patrolRatio == null || item.patrolRatio === "" ? "--" : item.patrolRatio,
        }));
      } catch {
        planListData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeAlarmTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : planListData.value.length === 0 ? (
            <div class={styles.emptySurface}>
              <NoData />
            </div>
          ) : (
            <RollTable column={column} data={planListData.value} showLength={isZoom ? 10 : 5} />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡更点异常top5统计"
          class="visual-v2-sub-panel v2-panel-card patrol-point-abnormal-top5-v2-panel"
          zoomable
          zoom-title="巡更点异常top5统计详情"
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
                  onSearch={changeAlarmTime}
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

export default PatrolPointAbnormalTop5;
