import { defineComponent, reactive, onMounted, ref } from "vue";

import { cubeParkingLotService } from "@/api/service";
import StackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import Traffic from "@/components/businessPanel/public/traffic.vue";

import styles from "./parking-car-in-out.module.less";

// 车辆进出场
export const ParkingCarInOut = defineComponent({
  name: "ParkingCarInOut",
  setup() {
    const timeType = ref({
      timeType: "TODAY",
      dateRange: [],
    });
    const trafficList = reactive([
      {
        color: "#2989FF",
        label: "驶入",
        value: 0,
      },
      {
        color: "#FF6E23",
        label: "驶出",
        value: 0,
      },
    ]);
    const lineData = reactive({
      title: "辆",
      xData: [],
      yData: [
        {
          data: [],
          name: "驶入",
          colors: [
            {
              offset: 0,
              color: "rgba(41, 137, 255, 1)",
            },
            {
              offset: 1,
              color: "rgba(41, 137, 255, 0.20)",
            },
          ],
        },
        {
          data: [],
          name: "驶出",
          colors: [
            {
              offset: 0,
              color: "rgba(255, 110, 35, 1)",
            },
            {
              offset: 1,
              color: "rgba(255, 110, 35, 0.02)",
            },
          ],
        },
      ],
    });
    const getData = async () => {
      try {
        const params = {
          type: timeType.value.timeType,
          period: timeType.value.dateRange.join(","),
        };
        const result = await Promise.all([
          cubeParkingLotService.getParkingAccessTotal(params),
          cubeParkingLotService.getParkingAccessTrend(params),
        ]);

        trafficList[0].value = Number(result[0]?.inNum ?? 0);
        trafficList[1].value = Number(result[0]?.outNum ?? 0);
        lineData.xData = result[1]?.inTrendVOS.map((e) => e.period);
        lineData.yData[0].data = result[1]?.inTrendVOS.map((e) => e.num);
        lineData.yData[1].data = result[1]?.outTrendVOS.map((e) => e.num);
      } catch {}
    };
    onMounted(() => {
      getData();
    });

    return () => (
      <SubPanelTemplate
        title="车流趋势"
        zoomable
        zoom-title="车流趋势详情"
        v-slots={{
          extra: () => <DateInlineForm v-model:modelValue={timeType.value} onSearch={getData} data-no-zoom />,
          "zoom-content": () => (
            <div class={styles.zoomContent}>
              <div class={styles.zoomTrafficBox} data-no-zoom>
                {trafficList.map((item) => (
                  <Traffic key={item.color} trafficInfo={item}></Traffic>
                ))}
              </div>
              <div class={styles.zoomChart} data-no-zoom>
                <StackedLine
                  title={lineData.title}
                  yData={lineData.yData}
                  xData={lineData.xData}
                  color={["#2989FF", "#FF6E23"]}
                  height={380}
                ></StackedLine>
              </div>
            </div>
          ),
        }}
      >
        <div class={styles.trafficBox} data-no-zoom>
          {trafficList.map((item) => (
            <Traffic key={item.color} trafficInfo={item}></Traffic>
          ))}
        </div>
        <div class={styles.chart} data-no-zoom>
          <StackedLine title={lineData.title} yData={lineData.yData} xData={lineData.xData} color={["#2989FF", "#FF6E23"]}></StackedLine>
        </div>
      </SubPanelTemplate>
    );
  },
});
