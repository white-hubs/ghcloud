import { defineComponent, onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import styles from "./parking-car-charge-trend.module.less";
import { chargingTrends } from '@/utils/requestData/parkingSpaceManage'

// 收费趋势
export const ParkingCarChargeTrend = defineComponent({
  name: "ParkingCarChargeTrend",
  setup() {
    const trend = ref();
    const xData = reactive<{ arr: string[] }>({ arr: [] });
    const series = reactive<{ arr: { data: number[]; linearGradientColor: string[] }[] }>({
      arr: [
        {
          data: [],
          linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
        },
      ],
    });
    const chargingTrendsInfo = async () => {
      if (!trend.value) {
        trend.value = { timeType: 'day' };
      }
      const res = await chargingTrends({ dimension: trend.value.timeType });
      xData.arr = res.xdata;
      series.arr[0].data = res.series[0].value;
    };

    onMounted(() => {
      chargingTrendsInfo();
    });

    const SubPanelTemplateTyped = SubPanelTemplate as any;
    const DateInlineFormTyped = DateInlineForm as any;
    const LineChartTyped = LineChart as any;

    return () => (
      <SubPanelTemplateTyped
        title="收费趋势"
        v-slots={{
          extra: () => (
            <DateInlineFormTyped
              v-model:modelValue={trend.value}
              onSearch={chargingTrendsInfo}
            />
          ),
        }}
      >
        <div class={styles.chart}>
          <LineChartTyped xData={xData.arr} series={series.arr} title="元" />
        </div>
      </SubPanelTemplateTyped>
    );
  },
});
