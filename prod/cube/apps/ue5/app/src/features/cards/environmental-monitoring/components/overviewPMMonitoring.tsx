import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { environmentalStatUePm } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";

import styles from "./overviewPMMonitoring.module.less";

export const OverviewPMMonitoring = defineComponent({
  name: "OverviewPMMonitoring",
  props: {
    title: { type: String, required: false, default: "PM2.5监测概览" },
  },
  setup(props, ctx) {
    const changeDate = async () => {
      const res = await environmentalStatUePm();
      contentList.value[0].value = res.max || "0" + "μg/m³";
      contentList.value[1].value = res.avg || "0" + "μg/m³";
      contentList.value[2].value = res.quality;
    };
    onMounted(() => {
      changeDate();
    });

    return (): JSX.Element => (
      <div>
        {" "}
        <SubPanelTemplate title={props.title}>
          {" "}
          <displayPanel bg-img={"overView16.png"} content-list={contentList} showimg={false}></displayPanel>
        </SubPanelTemplate>
      </div>
    );
  },
});

export default OverviewPMMonitoring;
