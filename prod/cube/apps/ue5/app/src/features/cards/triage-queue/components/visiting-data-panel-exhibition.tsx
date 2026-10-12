import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import VisitingDataPic from "./visiting-data-pic";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { consultationData } from "@/infrastructure/api/consultation-data";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { storeArea } from "@/visualization-core/stores/area";
import { storeMenu } from "@/visualization-core/stores/menu";

import styles from "./visiting-data-panel-exhibition.module.less";

export const VisitingDataPanelExhibition = defineComponent({
  name: "VisitingDataPanelExhibition",
  setup(_props, ctx) {
    const piniaStoreMenu = storeMenu();
    const piniaStoreArea = storeArea();

    /**
     * 看诊数据
     */
    const visitingData = ref({
      appointmentNum: { title: "预约人数", value: 310, img: getAssetsImage("business-icon/triage-queue/1.png") },
      signNum: { title: "签到人数", value: 280, img: getAssetsImage("business-icon/triage-queue/2.png") },
      waitingNum: { title: "候诊人数", value: 75, img: getAssetsImage("business-icon/triage-queue/3.png") },
      visitNum: { title: "就诊人数", value: 40, img: getAssetsImage("business-icon/triage-queue/4.png") },
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

export default VisitingDataPanelExhibition;
