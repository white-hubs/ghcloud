import { computed, defineComponent, onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { usageStatByType } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import BaseBar from "@/shared-ui/panel/charts/bar/baseBar";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./water-usage-situation.module.less";

const titleIcon = getThemeImage("energy-consumption-statistics.png");

export const WaterUsageSituation = defineComponent({
  name: "WaterUsageSituation",
  setup() {
    const alarmTypeTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const hasData = computed(() => xData.value.length > 0 && yData.value.some((value) => Number(value) > 0));

    const areaAlarmStatistic = async (): Promise<void> => {
      const params = {
        period: alarmTypeTime.value.dateRange?.join(",") ?? "",
        type: alarmTypeTime.value.timeType,
      };
      try {
        const res = await usageStatByType(params);
        const list = Array.isArray(res) ? res : [];
        xData.value = list.map((item: { waterTypeName: string }) => item.waterTypeName).filter(Boolean);
        yData.value = list.map((item: { totalUsage: number }) => Number(item.totalUsage) || 0);
      } catch {
        xData.value = [];
        yData.value = [];
      }
    };

    onMounted(() => {
      void areaAlarmStatistic();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["water-usage-situation-v2", isZoom ? "is-zoom" : ""]}>
        <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {hasData.value ? (
            <BaseBar
              xData={xData.value}
              series={[{ name: "用量", data: yData.value }]}
              colors={["#2989FF"]}
              showLegend={false}
              gridTop={isZoom ? "12%" : "18%"}
            />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root water-usage-situation-v2-root">
        <SubPanelTemplate
          title="净水用量情况"
          class="visual-v2-sub-panel v2-panel-card water-usage-situation-v2-panel"
          zoomable
          zoom-title="净水用量情况详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={alarmTypeTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmTypeTime.value = v;
                  }}
                  onSearch={areaAlarmStatistic}
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

export default WaterUsageSituation;
