import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import LineChart from "@/shared-ui/panel/lineChart";

export const ComparisonPropertyRevenue = defineComponent({
  name: "ComparisonPropertyRevenue",
  setup(_props, ctx) {
    const titles = ["收入", "支出"];

    const xDataGas = ref<string[]>([1, 2, 3, 4, 5, 6]);
    const yDataGas = ref<
      {
        name: string;
        data: number[];
        linearGradientColor?: string[];
        lineColor?: string;
        showSymbol?: boolean;
        smooth?: boolean;
        symbolSize?: number;
      }[]
    >([
      {
        name: "收入",
        data: [1, 2, 3, 4, 5, 6],
      },
      {
        name: "支出",
        data: [6, 5, 4, 3, 2, 1],
      },
    ]);

    return (): JSX.Element => (
      <SubPanelTemplate>
        {" "}
        <div class="chart">
          {" "}
          <LineChart
            x-data={xDataGas.value}
            series={yDataGas.value}
            showLegend={true}
            showBackground={true}
            titles={titles}
            gridTop="15"
            unit={{ x: "", y: "元" }}
            axisPointer={true}
          />
        </div>
      </SubPanelTemplate>
    );
  },
});

export default ComparisonPropertyRevenue;
