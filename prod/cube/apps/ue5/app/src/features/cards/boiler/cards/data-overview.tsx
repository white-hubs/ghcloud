import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { BOILER_PANEL_CLASS, boilerZoomClass } from "@/features/cards/boiler/_shared/boiler-panel-context";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDataOverView } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/boiler-v2-shared.module.less";

import styles from "./data-overview.module.less";

export const DataOverview = defineComponent({
  name: "DataOverview",
  setup() {
    const { globalState } = useStateStore();
    const overviewTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const state = reactive({
      alarmData: [
        { eventName: "用水量", value: 0, rate: 0, color: "#F14545" },
        { eventName: "用电量", value: 0, rate: 0, color: "#FFC700" },
      ],
    });

    const changeOverviewTimeTime = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: overviewTime.value.dateRange.join(","),
        type: overviewTime.value.timeType,
      };
      try {
        const result = await getDataOverView(param);
        state.alarmData[0].value = Number(result?.waterValue) || 0;
        state.alarmData[0].rate = Number(result?.waterRate) || 0;
        state.alarmData[1].value = Number(result?.electricityValue) || 0;
        state.alarmData[1].rate = Number(result?.electricityRate) || 0;
      } catch {
        state.alarmData[0].value = 0;
        state.alarmData[0].rate = 0;
        state.alarmData[1].value = 0;
        state.alarmData[1].rate = 0;
      }
    };

    onMounted(() => {
      void changeOverviewTimeTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.body, "boiler-card-body", isZoom ? boilerZoomClass : ""]} data-no-zoom>
        <div class={styles.metricGrid}>
          {state.alarmData.map((item, index) => {
            const rate = Number(item.rate) || 0;
            return (
              <div class={[styles.metricCard, "boiler-surface"]} key={item.eventName}>
                <div class={[styles.metricIcon, index === 0 ? styles.water : styles.energy]}>{index === 0 ? "水" : "电"}</div>
                <div class={styles.metricMain}>
                  <span class={styles.metricLabel}>{item.eventName}</span>
                  <span class={styles.metricValue}>{item.value}</span>
                </div>
                <div class={[styles.metricRate, rate > 0 ? styles.rateUp : rate < 0 ? styles.rateDown : styles.rateFlat]}>
                  <span class={styles.rateArrow}>{rate > 0 ? "↑" : rate < 0 ? "↓" : "—"}</span>
                  <span>{Math.abs(rate)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="boiler-v2-root v2-panel-root">
        <SubPanelTemplate
          title="数据概览"
          class={BOILER_PANEL_CLASS}
          zoomable
          zoom-title="数据概览详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="boiler-overview" />,
            extra: () => (
              <div class="boiler-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={overviewTime.value}
                  onUpdate:modelValue={(v) => {
                    overviewTime.value = v;
                  }}
                  onSearch={changeOverviewTimeTime}
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

export default DataOverview;
