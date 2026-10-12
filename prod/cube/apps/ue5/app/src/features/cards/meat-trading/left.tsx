import { defineComponent } from "vue";
import { reactive, onMounted } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { TenantType } from "@/infrastructure/api/models/ouaa";
import { getTenantInfo } from "@/infrastructure/api/ouaa";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
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

    onMounted(async () => {
      let res = await getTenantInfo(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant);
      Object.assign(tenantData, res);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="市场简介">
            <div class="hospitalInfo">
              {tenantData.logo && <img src={tenantData.logo.path} alt></img>}
              <div class="hospitalInfo-text">
                <div class="hospitalInfo-title"></div>
                <div class="scroll_box">
                  {" "}
                  <div class="scroll-text"> {tenantData.remark}</div>
                </div>
              </div>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
