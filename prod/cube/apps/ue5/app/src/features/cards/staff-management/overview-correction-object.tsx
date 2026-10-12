import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { criminalStatisticsStatus } from "@/infrastructure/api/lingchuanhik";
import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./overview-correction-object.module.less";

export const OverviewCorrectionObject = defineComponent({
  name: "OverviewCorrectionObject",
  setup(_props, ctx) {
    const reservationData = ref([
      {
        title: "在册在矫",
        value: 100,
        flag: "registeredInCorrectionTotal",
      },
      {
        title: "在校在矫",
        value: 100,
        flag: "underSupervisionCorrectionTotal",
      },
      {
        title: "校外在矫",
        value: 100,
        flag: "correctionOutsidePrisonTotal",
      },
    ]);
    const getCriminalStatisticsStatus = async () => {
      const res = await criminalStatisticsStatus();
      reservationData.value.forEach((item) => {
        item.value = res[item.flag];
      });
    };
    onMounted(() => {
      getCriminalStatisticsStatus();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="学生概况">
          <div class="appointment-statistics">
            {reservationData.map((item) => (
              <div class="statistics-item" key={item.title}>
                <div class="statistics-box">
                  <div class="monitorPanel-left">
                    <div class="bg">
                      <img src={getAssetsImage("overView4.png")} alt />
                      <img class="rotate aniamtion-electric-fan" src={getAssetsImage("overView13.png")} alt />
                    </div>
                  </div>
                  <div class="monitorPanel-right">
                    <div class="statistics-value"> {item.value}</div>
                    <div class="statistics-title"> {item.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default OverviewCorrectionObject;
