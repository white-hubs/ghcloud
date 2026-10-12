import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { px2rem } from "@/infrastructure/utils/common";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./device-analysis-panel.module.less";

export const DeviceAnalysisPanel = defineComponent({
  name: "DeviceAnalysisPanel",
  props: {
    chartHeight: { type: Number, required: false, default: 220 },
  },
  setup(props, ctx) {
    const changeAppointmentTime = (): void => {
      // TODO  接口调用
      const { timeType } = appointmentTime.value;
      if (timeType === "TODAY") {
        appointmentChartData.value[0].value = 70;
        appointmentChartData.value[1].value = 100;
        appointmentChartData.value[2].value = 100;
        appointmentChartData.value[3].value = 100;
      } else if (timeType === "THIS_WEEK") {
        appointmentChartData.value[0].value = 170;
        appointmentChartData.value[1].value = 120;
        appointmentChartData.value[2].value = 120;
        appointmentChartData.value[3].value = 130;
      } else if (timeType === "THIS_MONTH") {
        appointmentChartData.value[0].value = 210;
        appointmentChartData.value[1].value = 200;
        appointmentChartData.value[2].value = 210;
        appointmentChartData.value[3].value = 230;
      } else if (timeType === "THIS_YEAR") {
        appointmentChartData.value[0].value = 732;
        appointmentChartData.value[1].value = 190;
        appointmentChartData.value[2].value = 248;
        appointmentChartData.value[3].value = 213;
      }

      appointmentTotalNum.value = appointmentChartData.value.reduce(function (total, value) {
        return total + value.value;
      }, 0);
      appointmentListtData.value = appointmentChartData.value.map((e) => {
        return {
          ...e,
          ratio: `${((e.value / appointmentTotalNum.value) * 100).toFixed(2)}%`,
        };
      });
    };
    const appointmentChartData = ref<{ name: string; value: number; color: string; ratio?: string }[]>([
      { name: "护士站主机", value: 70, color: "#FFAB10" },
      { name: "床头分机", value: 100, color: "#2F8DFF" },
      { name: "病房门口机", value: 100, color: "#F14545" },
      { name: "卫生间分机", value: 100, color: "#19F8F7" },
    ]);
    const appointmentListtData = ref<{ name: string; value: number; color: string; ratio?: string }[]>([]);

    let timer = null;
    let fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(
        () => {
          appointmentTime.value.timeType = fakeData[fakeIndex];
          changeAppointmentTime();
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
        <SubPanelTemplate title="设备统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={appointmentTime}
              onUpdate:modelValue={(v) => {
                appointmentTime.value = v;
              }}
              onSearch={changeAppointmentTime}
            ></DateInlineForm>
          </template>
          <div class="elevator-analysis">
            <div class="chart" style={{ height: px2rem(chartHeight + "px") }}>
              <elevator-analysis-pie pieData={appointmentChartData.value}>
                <div style="color: #fff;text-align: center;font-size: 14px;"> {appointmentTotalNum}</div>
                <div style="color: #fff;text-align: center;font-size: 14px;"> 设备总数</div>
              </elevator-analysis-pie>
            </div>
            <elevatorAnalysisList contentList={appointmentListtData.value} style="margin-left: 10px;width: 150px;"></elevatorAnalysisList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default DeviceAnalysisPanel;
