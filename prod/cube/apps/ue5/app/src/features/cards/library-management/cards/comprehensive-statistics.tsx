import { defineComponent } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { tidyUpStatisticsPage } from "@/infrastructure/api/library-management";
import { px2rem } from "@/infrastructure/utils/common";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";

export const ComprehensiveStatistics = defineComponent({
  name: "ComprehensiveStatistics",
  setup(_props, ctx) {
    const chartHeight = 220;
    const yData = ref([
      { name: "待编目", value: 0, itemStyle: { color: "#EF424A" } },
      { name: "待接收", value: 0, itemStyle: { color: "#19F8F7" } },
      { name: "已接收", value: 0, itemStyle: { color: "#328BF7" } },
      { name: "典藏退回", value: 0, itemStyle: { color: "#FFC700" } },
    ]);
    const getTidyUpStatisticsPage = async () => {
      const wait = await tidyUpStatisticsPage({ status: 0 });
      const toAccepted = await tidyUpStatisticsPage({ status: 1 });
      const accepted = await tidyUpStatisticsPage({ status: 2 });
      const returnAccepted = await tidyUpStatisticsPage({ status: 3 });
      yData.value[0].value = wait.total;
      yData.value[1].value = toAccepted.total;
      yData.value[2].value = accepted.total;
      yData.value[3].value = returnAccepted.total;
    };
    onMounted(async () => {
      getTidyUpStatisticsPage();
    });

    return (): JSX.Element => (
      <SubPanelTemplate>
        {" "}
        <div style={{ height: px2rem(chartHeight + "px") }}>
          {" "}
          <pieGuidance height={"80%"} position="inside" radius={["0%", "80%"]} y-data={yData.value}></pieGuidance>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default ComprehensiveStatistics;
