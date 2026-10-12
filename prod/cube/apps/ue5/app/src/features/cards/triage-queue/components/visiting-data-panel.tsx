import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import VisitingDataPic from "./visiting-data-pic";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { consultationData } from "@/infrastructure/api/consultation-data";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./visiting-data-panel.module.less";

export const VisitingDataPanel = defineComponent({
  name: "VisitingDataPanel",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    /**
     * 看诊数据
     */
    const visitingData = ref({
      appointmentNum: { title: "预约人数", value: 0, img: getAssetsImage("business-icon/triage-queue/1.png") },
      signNum: { title: "签到人数", value: 0, img: getAssetsImage("business-icon/triage-queue/2.png") },
      waitingNum: { title: "候诊人数", value: 0, img: getAssetsImage("business-icon/triage-queue/3.png") },
      visitNum: { title: "就诊人数", value: 0, img: getAssetsImage("business-icon/triage-queue/4.png") },
    });
    //获取看诊数据
    const getConsultationData = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      const { appointmentNum, signNum, visitNum, waitingNum } = await consultationData(params);
      visitingData.value.appointmentNum.value = appointmentNum;
      visitingData.value.signNum.value = signNum;
      visitingData.value.visitNum.value = visitNum;
      visitingData.value.waitingNum.value = waitingNum;
    };
    onMounted(() => {
      getConsultationData();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="看诊数据" class="visiting-data">
          {visitingData.map((item) => (
            <div class="item" key={item.title}>
              <VisitingDataPic img={item.img} />
              <a-statistic title={item.title}>
                {" "}
                <template>
                  {" "}
                  <count-to startVal={0} endVal={item.value} duration={2000} separator></count-to>
                </template>
              </a-statistic>
            </div>
          ))}
        </SubPanelTemplate>
      </>
    );
  },
});

export default VisitingDataPanel;
