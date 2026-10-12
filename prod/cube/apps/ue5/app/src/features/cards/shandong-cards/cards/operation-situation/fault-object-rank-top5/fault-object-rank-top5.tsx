import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeMaintainStatisticsService } from "@/infrastructure/api/service";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./fault-object-rank-top5.module.less";

type RankItem = {
  name: string;
  value: number;
  ratio: number;
};

export const FaultObjectRankTop5 = defineComponent({
  name: "FaultObjectRankTop5",
  setup() {
    const timeRange = ref<ModelValueItf>({
      timeType: "THIS_MONTH",
      dateRange: [],
    });
    const resultData = ref<RankItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const getData = async (): Promise<void> => {
      try {
        const result = await cubeMaintainStatisticsService.getFaultObjectTop5({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange?.join(",") ?? "",
        });
        const rows = Array.isArray(result) ? [...result] : [];
        rows.sort((a: { faultNum?: number }, b: { faultNum?: number }) => (Number(b.faultNum) || 0) - (Number(a.faultNum) || 0));
        const total = rows.reduce((sum: number, item: { faultNum?: number }) => sum + (Number(item.faultNum) || 0), 0) || 1;
        resultData.value = rows.slice(0, 5).map((item: { faultObject?: string; faultNum?: number }) => {
          const value = Number(item.faultNum) || 0;
          return {
            name: item.faultObject || "--",
            value,
            ratio: Math.round((value / total) * 1000) / 10,
          };
        });
      } catch {
        resultData.value = [];
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
        ) : resultData.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.listSurface, isZoom ? styles.isZoomList : ""]}>
            {resultData.value.map((item, index) => (
              <div class={styles.rankItem} key={`${isZoom ? "zoom-" : ""}${item.name}-${index}`}>
                <EventAlarmItem
                  sort={index + 1}
                  name={item.name}
                  count={item.value}
                  ratio={`${item.ratio}%`}
                  linkRatio={0}
                  modes="环比"
                  sn={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="故障对象排行榜top5"
          class="visual-v2-sub-panel v2-panel-card fault-object-rank-top5-v2-panel"
          zoomable
          zoom-title="故障对象排行榜top5详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-alarm" />,
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

export default FaultObjectRankTop5;
