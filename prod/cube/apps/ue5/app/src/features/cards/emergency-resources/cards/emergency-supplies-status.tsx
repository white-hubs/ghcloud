import { defineComponent } from "vue";
import { reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencySuppliesStock } from "@/infrastructure/api/emergency";
import stackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";

import styles from "./emergency-supplies-status.module.less";

export const EmergencySuppliesStatus = defineComponent({
  name: "EmergencySuppliesStatus",
  setup(_props, ctx) {
    const buildUtilization = reactive({
      xData: [],
      yData: [
        {
          name: "入库数量",
          data: [],
        },
        {
          name: "出库数量",
          data: [],
        },
      ],
    });

    const getMaterialStatistics = async () => {
      const res = await emergencySuppliesStock();
      buildUtilization.xData = res.map((e) => e.name);
      buildUtilization.yData[0].data = res.map((e) => e.inValue);
      buildUtilization.yData[1].data = res.map((e) => e.outValue);
    };

    onMounted(() => {
      getMaterialStatistics();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="当前应急物资情况统计">
        {" "}
        <div class="charts">
          {" "}
          <stackedColumn unit={"件"} xData={buildUtilization.xData} yData={buildUtilization.yData}></stackedColumn>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default EmergencySuppliesStatus;
