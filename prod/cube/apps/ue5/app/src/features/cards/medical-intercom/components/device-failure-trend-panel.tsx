import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getXaxleData, px2rem } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const DeviceFailureTrendPanel = defineComponent({
  name: "DeviceFailureTrendPanel",
  props: {
    chartHeight: { type: Number, required: false, default: 300 },
  },
  setup(props, ctx) {
    const changeDeviceFailureTrendTime = (): void => {
      // TODO  接口调用
      deviceFailureTrendCharData.xData = getXaxleData(deviceFailureTrendTime.value.timeType);
      const { timeType } = deviceFailureTrendTime.value;
      if (timeType === "TODAY") {
        deviceFailureTrendCharData.yData[0].data = [
          0, 0, 0, 0, 0, 10, 20, 40, 50, 20, 100, 120, 80, 60, 50, 50, 40, 50, 53, 55, 60, 50, 45, 48, 50,
        ];
      } else if (timeType === "THIS_WEEK") {
        deviceFailureTrendCharData.yData[0].data = [0, 150, 220, 400, 350, 20, 100];
      } else if (timeType === "THIS_MONTH") {
        deviceFailureTrendCharData.yData[0].data = [350, 350, 520, 633, 596, 520, 476, 479, 470, 386, 407, 420, 500, 440, 450, 380, 220];
      } else if (timeType === "THIS_YEAR") {
        deviceFailureTrendCharData.yData[0].data = [110, 1350, 1520, 1700, 550, 280, 360];
      }
    };
    const deviceFailureTrendCharData = reactive({
      xData: getXaxleData("TODAY"),
      yData: [
        {
          data: [10, 10, 10, 10, 10, 0, 0, 50, 20, 200, 150, 40, 10, 50],
          linearGradientColor: ["rgba(86, 142, 255, 1)", "rgba(86, 142, 255, 0.1)"],
          lineColor: "rgba(86, 142, 255, 1)",
        },
      ],
    });

    let timer = null;
    let fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(
        () => {
          deviceFailureTrendTime.value.timeType = fakeData[fakeIndex];
          changeDeviceFailureTrendTime();
          fakeIndex++;
          if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0;
            clearInterval(timer);
          }
        },
        (window as any).config.pageLoopRequestTime,
      );
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
              modelValue={deviceFailureTrendTime}
              onUpdate:modelValue={(v) => {
                deviceFailureTrendTime.value = v;
              }}
              onSearch={changeDeviceFailureTrendTime}
            ></DateInlineForm>
          </template>
          <div style={{ height: px2rem(chartHeight + "px") }}>
            {" "}
            <LineChart
              x-data={deviceFailureTrendCharData.xData}
              series={deviceFailureTrendCharData.yData}
              showLegend={false}
              gridTop="15"
              unit={{ x: "", y: "次" }}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default DeviceFailureTrendPanel;
