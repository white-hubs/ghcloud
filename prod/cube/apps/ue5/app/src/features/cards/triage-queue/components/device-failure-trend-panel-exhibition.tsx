import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const DeviceFailureTrendPanelExhibition = defineComponent({
  name: "DeviceFailureTrendPanelExhibition",
  setup(_props, ctx) {
    /**
     * 设备故障趋势
     */
    const deviceFailureTrendTime = ref<ModelValueItf>();
    const changeDeviceFailureTrendTime = (): void => {
      // TODO (张正) 接口调用
      const { timeType } = deviceFailureTrendTime.value;
      if (timeType === "TODAY") {
        deviceFailureTrendCharData.yData[0].data = [0, 50, 20, 200, 150, 40, 10];
        deviceFailureTrendCharData.xData = ["4", "8", "12", "16", "20", "24h"];
      } else if (timeType === "THIS_WEEK") {
        deviceFailureTrendCharData.yData[0].data = [0, 150, 220, 400, 350, 20];
        deviceFailureTrendCharData.xData = ["4", "8", "12", "16", "20", "24h"];
      } else if (timeType === "THIS_MONTH") {
        deviceFailureTrendCharData.yData[0].data = [10, 350, 520, 700, 450, 80];
        deviceFailureTrendCharData.xData = ["1", "5", "10", "15", "20", "25", "30日"];
      } else if (timeType === "THIS_YEAR") {
        deviceFailureTrendCharData.yData[0].data = [110, 1350, 1520, 1700, 550, 280];
        deviceFailureTrendCharData.xData = ["1", "3", "5", "7", "9", "12月"];
      }
    };
    const deviceFailureTrendCharData = reactive({
      xData: ["1", "2", "3", "4", "5", "6", "7天"],
      yData: [
        {
          data: [0, 50, 20, 200, 150, 40, 10],
          linearGradientColor: ["rgba(86, 142, 255, 1)", "rgba(86, 142, 255, 0.1)"],
          lineColor: "rgba(86, 142, 255, 1)",
        },
      ],
    });

    let timer = null;
    let fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(() => {
        deviceFailureTrendTime.value.timeType = fakeData[fakeIndex];
        changeDeviceFailureTrendTime();
        fakeIndex++;
        if (fakeIndex > fakeData.length - 1) {
          fakeIndex = 0;
        }
      }, 3000);
    });
    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备故障趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={deviceFailureTrendTime.value}
              onUpdate:modelValue={(v) => {
                deviceFailureTrendTime.value = v;
              }}
              onSearch={changeDeviceFailureTrendTime}
            ></DateInlineForm>
          </template>
          <LineChart
            x-data={deviceFailureTrendCharData.xData}
            series={deviceFailureTrendCharData.yData}
            showLegend={false}
            gridTop="15"
            unit={{ x: "", y: "次" }}
          />
        </SubPanelTemplate>
      </>
    );
  },
});

export default DeviceFailureTrendPanelExhibition;
