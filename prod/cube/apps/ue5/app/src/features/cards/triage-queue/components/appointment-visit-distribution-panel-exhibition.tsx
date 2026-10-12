import { defineComponent } from "vue";
import { onMounted, onUnmounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./appointment-visit-distribution-panel-exhibition.module.less";

export const AppointmentVisitDistributionPanelExhibition = defineComponent({
  name: "AppointmentVisitDistributionPanelExhibition",
  setup(_props, ctx) {
    /**
     * 预约就诊分布
     */
    const appointmentTime = ref<ModelValueItf>();
    const changeAppointmentTime = (): void => {
      // TODO (张正) 接口调用
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
        appointmentChartData.value[1].value = 1900;
        appointmentChartData.value[2].value = 2048;
        appointmentChartData.value[3].value = 2133;
      }

      const appointmentTotalNum = appointmentChartData.value.reduce(function (total, value) {
        return total + value.value;
      }, 0);
      appointmentListtData.value = appointmentChartData.value.map((e) => {
        return {
          ...e,
          label: e.label + `（${((e.value / appointmentTotalNum) * 100).toFixed(2)}%）`,
        };
      });
    };
    const appointmentChartData = ref<{ label: string; value: number; color: string }[]>([
      { label: "心内科", value: 70, color: "#FFAB10" },
      { label: "耳鼻喉科", value: 100, color: "#2F8DFF" },
      { label: "肠胃科", value: 100, color: "#F14545" },
      { label: "烧伤科", value: 100, color: "#19F8F7" },
      { label: "呼吸道科", value: 100, color: "#19F8F7" },
    ]);
    const appointmentListtData = ref<{ label: string; value: number; color: string }[]>([]);

    let timer = null;
    let fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(() => {
        appointmentTime.value.timeType = fakeData[fakeIndex];
        changeAppointmentTime();
        fakeIndex++;
        if (fakeIndex > fakeData.length - 1) {
          fakeIndex = 0;
        }
      }, 1000 * 20);
    });
    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="预约就诊分布">
          <template>
            {" "}
            <DateInlineForm
              modelValue={appointmentTime.value}
              onUpdate:modelValue={(v) => {
                appointmentTime.value = v;
              }}
              onSearch={changeAppointmentTime}
            ></DateInlineForm>
          </template>
          <div class="appointment-data">
            <PlanPie pieData={appointmentChartData.value}>
              {" "}
              <img src={getAssetsImage("business-icon/triage-queue-appointment.png")} />
            </PlanPie>
            <PieList roundPieData={appointmentListtData.value}></PieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AppointmentVisitDistributionPanelExhibition;
