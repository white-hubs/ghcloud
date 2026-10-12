import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { distributionAppointmentVisits } from "@/infrastructure/api/consultation-data";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./appointment-visit-distribution-panel.module.less";

export const AppointmentVisitDistributionPanel = defineComponent({
  name: "AppointmentVisitDistributionPanel",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    /**
     * 预约就诊分布
     */
    const appointmentTime = ref<ModelValueItf>();
    const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const appointmentData = ref<{ label: string; value: number; color: string }[]>([]);

    const getDistributionAppointmentVisits = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: appointmentTime.value.dateRange.join(","),
        type: appointmentTime.value.timeType,
      };
      let res = await distributionAppointmentVisits(params);
      appointmentData.value = [];
      res.distributionAppointmentVisit.forEach((item, index) => {
        let obj = {
          label: item.subject,
          color: colorList[index],
          value: item.appointmentNum ?? 0,
        };
        appointmentData.value.push(obj);
      });
    };
    onMounted(() => {
      getDistributionAppointmentVisits();
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
              onSearch={getDistributionAppointmentVisits}
            ></DateInlineForm>
          </template>
          <div class="appointment-data">
            <PlanPie pieData={appointmentData.value}>
              {" "}
              <img src={getAssetsImage("business-icon/triage-queue-appointment.png")} />
            </PlanPie>
            <PieList roundPieData={appointmentData.value}></PieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AppointmentVisitDistributionPanel;
