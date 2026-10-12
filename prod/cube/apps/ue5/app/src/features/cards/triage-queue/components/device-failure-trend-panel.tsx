import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmTrend } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

export const DeviceFailureTrendPanel = defineComponent({
  name: "DeviceFailureTrendPanel",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    /**
     * 设备故障趋势
     */
    const trend = ref<ModelValueItf>();
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      xData.arr = res.xdata;
      series[0].data = res.ydata;
    };

    let timer = null;

    onMounted(() => {});
    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备故障趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={trend.value}
              onUpdate:modelValue={(v) => {
                trend.value = v;
              }}
              onSearch={alarmTrendInfo}
            ></DateInlineForm>
          </template>
          <LineChart x-data={xData.arr} series={series} showLegend={false} gridTop="20" unit={{ x: "", y: "次" }} />
        </SubPanelTemplate>
      </>
    );
  },
});

export default DeviceFailureTrendPanel;
