import { defineComponent, onMounted, reactive } from "vue";

import { cubeParkingLotService } from "@/api/service";
import LineAndPillar from "@/components/businessPanel/public/charts/lineAndPillar/lineAndPillar.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

import styles from "./parking-car-stay.module.less";

export const ParkingCarStay = defineComponent({
  name: "ParkingCarStay",
  setup() {
    const lineAndPillarData = reactive({
      title: "滞留车辆数",
      xdata: [],
      yData: [
        {
          name: "滞留车辆数",
          type: "bar",
          data: [],
          color: "#FFC700",
        },
        {
          name: "滞留车辆占比",
          type: "line",
          data: [],
          color: "#2981EA",
        },
      ],
    });

    const stayCarData = async () => {
      const res = await cubeParkingLotService.getRetentionTrafficTrend();
      lineAndPillarData.xdata = res?.xdata;
      lineAndPillarData.yData[0].data = res?.series[0].value;
      lineAndPillarData.yData[1].data = res?.series[1].value;
    };

    onMounted(() => {
      stayCarData();
    });

    return () => (
      <SubPanelTemplate
        title="滞留车辆分析"
        zoomable
        zoom-title="滞留车辆分析详情"
        zoom-width={1200}
        v-slots={{
          "zoom-content": () => (
            <div class={styles.zoomChart} data-no-zoom>
              <LineAndPillar title={lineAndPillarData.title} xData={lineAndPillarData.xdata} yData={lineAndPillarData.yData} />
            </div>
          ),
        }}
      >
        <div class={styles.chart} data-no-zoom>
          <LineAndPillar title={lineAndPillarData.title} xData={lineAndPillarData.xdata} yData={lineAndPillarData.yData} />
        </div>
      </SubPanelTemplate>
    );
  },
});
