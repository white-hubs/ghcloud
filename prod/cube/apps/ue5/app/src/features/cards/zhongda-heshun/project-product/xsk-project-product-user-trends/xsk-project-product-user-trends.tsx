import dayjs from "dayjs";
import { defineComponent, onMounted, reactive } from "vue";

import { CubeZDDataVizService } from "@ghcloud/cube-zhongda-heshun-service";

import { authStore } from "@/application/auth/auth-store";
import LineChart from "@/features/cards/zhongda-heshun/components/link-chart/lineChart";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

export const XskProjectProductUserTrends = defineComponent({
  name: "XskProjectProductUserTrends",
  props: {
    title: {
      type: String,
      default: "安全分析",
    },
  },
  setup(props) {
    const trendsData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          linearGradientColor: ["rgba(47, 141, 255, 0.50)", "rgba(47, 141, 255, 0.02)"],
          lineColor: "rgba(47, 141, 255, 0.50)",
        },
      ],
    });

    const getProductTrendsList = async (): Promise<void> => {
      try {
        const cubeZDDataVizService = new CubeZDDataVizService(authStore);
        const startTime = dayjs().subtract(6, "month").startOf("month").format("YYYY-MM-DD 00:00:00");
        const endTime = dayjs().format("YYYY-MM-DD 23:59:59");
        const params = {
          period: `${startTime},${endTime}`,
        };
        const res = await cubeZDDataVizService.getProjectProductUserTrends(params);
        trendsData.xData = [];
        trendsData.yData[0].data = [];
        if (res) {
          res.forEach((item) => {
            trendsData.xData.push(`${item.date}月`);
            trendsData.yData[0].data.push(item.count);
          });
        }
      } catch {
        // ignore
      }
    };

    onMounted(() => {
      void getProductTrendsList();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title={props.title} titleFontSize="22px">
        <div class="chart">
          <LineChart x-data={trendsData.xData} series={trendsData.yData} showLegend={false} gridTop="15" />
        </div>
      </SubPanelTemplate>
    );
  },
});

export default XskProjectProductUserTrends;
