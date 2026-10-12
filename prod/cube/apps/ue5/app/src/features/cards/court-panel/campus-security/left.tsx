import { defineComponent } from "vue";

import CourtTrailDevice from "./components/court-trail-device";
import RealTimeCourtTrial from "./components/real-time-court-trial";
import SpaceBasicInfo from "./components/space-basic-info";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="空间基础信息">
          {" "}
          <SpaceBasicInfo />
        </SubPanelTemplate>
        <SubPanelTemplate title="实时庭审信息">
          <template>
            <div class="refresh">
              <div class="text"> 切换</div>
              <img src="/resource/v1/ue5-migrate/assets/images/refresh-icon.png" alt srcset></img>
            </div>
          </template>
          <RealTimeCourtTrial />
        </SubPanelTemplate>
        <SubPanelTemplate title="庭审设备信息">
          {" "}
          <CourtTrailDevice />
        </SubPanelTemplate>
      </>
    );
  },
});

export default Left;
