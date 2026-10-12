import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service/src/device-center.service";
import { CubeZDDataVizService } from "@ghcloud/cube-zhongda-heshun-service";

import { authStore } from "@/application/auth/auth-store";
import LineChart from "@/features/cards/zhongda-heshun/components/link-chart/lineChart";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

export const XskProjectProductTrends = defineComponent({
  name: "XskProjectProductTrends",
  props: {
    title: {
      type: String,
      default: "安全分析",
    },
  },
  setup(props) {
    const value = ref<string[]>([]);
    const treeData = ref([]);
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

    const getProductList = async (): Promise<void> => {
      try {
        const cubeDeviceCenterService = new CubeDeviceCenterService(authStore);
        const data = await cubeDeviceCenterService.getIotProductCategoryTree();
        treeData.value = data;
      } catch {
        // ignore
      }
    };

    const getProductTrendsList = async (productId?: string): Promise<void> => {
      try {
        const cubeZDDataVizService = new CubeZDDataVizService(authStore);
        const startTime = dayjs().subtract(6, "month").startOf("month").format("YYYY-MM-DD 00:00:00");
        const endTime = dayjs().format("YYYY-MM-DD 23:59:59");
        const params = {
          period: `${startTime},${endTime}`,
          productTypeCode: productId,
        };
        const res = await cubeZDDataVizService.getProjectProductTrends(params);
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

    const changeHandleOverview = async (changeValue: string[]): Promise<void> => {
      if (changeValue?.length) {
        await getProductTrendsList(changeValue[changeValue.length - 1]);
      } else {
        await getProductTrendsList();
      }
    };

    onMounted(() => {
      void getProductList();
      void getProductTrendsList();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title={props.title} titleFontSize="22px">
        {{
          extra: () => (
            <a-cascader
              value={value.value}
              onUpdate:value={(v: string[]) => {
                value.value = v;
              }}
              class="ant-select-inline"
              fieldNames={{ label: "categoryName", value: "categoryCode", children: "children" }}
              onChange={changeHandleOverview}
              options={treeData.value}
              placeholder="全部"
            />
          ),
          default: () => (
            <div class="chart">
              <LineChart x-data={trendsData.xData} series={trendsData.yData} showLegend={false} gridTop="15" />
            </div>
          ),
        }}
      </SubPanelTemplate>
    );
  },
});

export default XskProjectProductTrends;
