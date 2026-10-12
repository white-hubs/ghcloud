import { defineComponent } from "vue";
import { reactive, ref, onMounted } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TenantType } from "@/infrastructure/api/models/ouaa";
import { getTenantDetails } from "@/infrastructure/api/ouaa";

import styles from "./introduction-of-hospital.module.less";

export const IntroductionOfHospital = defineComponent({
  name: "IntroductionOfHospital",
  setup(_props, ctx) {
    const tenantData = reactive<TenantType>({
      address: "",
      areaCovered: 0,
      building: 0,
      code: "",
      files: [],
      id: "",
      location: "",
      logo: {
        id: "",
        name: "",
        path: "",
        size: "",
        suffix: "",
      },
      name: "",
      remark: "",
    });

    const getTenantInfo = async () => {
      const tenantId = CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant;
      const res = await getTenantDetails(tenantId);
      Object.assign(tenantData, res);
    };

    onMounted(() => {
      getTenantInfo();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="院区介绍">
          <div class="hospitalInfo">
            {tenantData.logo && <img src={tenantData.logo.path} alt />}
            <div class="hospitalInfo-text">
              <div class="hospitalInfo-title"> {tenantData.name}</div>
              <div class="scroll_box">
                {" "}
                <div class="scroll-text"> {tenantData.remark}</div>
              </div>
            </div>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default IntroductionOfHospital;
