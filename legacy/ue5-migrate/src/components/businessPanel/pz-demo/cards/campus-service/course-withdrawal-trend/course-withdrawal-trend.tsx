import { defineComponent, reactive, ref } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { PZService } from '@/components/businessPanel/pz-demo/card-service/service'
export const CourseWithdrawalTrend = defineComponent({
  setup () {
    // 模拟数据
    const lineChartData = reactive({
      xData: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      yData: [
        {
          name: '退课人数',
          data: [120, 150, 180, 200, 220, 250, 280, 300, 320, 350],
          linearGradientColor: ['rgba(41, 137, 255, 0.5)', 'rgba(41, 137, 255, 0.1)'],
          lineColor: 'rgba(41, 137, 255, 1)',
          smooth: true,
          symbolSize: 8
        }
      ]
    });

    // 当前选中的时间范围
    const selectedTime = ref({
      timeType: 'TODAY',
      dateRange: []
    });

    // 处理时间选择器变化
    const handleTimeChange = (): void => {
      // 根据选择的时间范围更新模拟数据
      getData()
    };
    const getData = async (): Promise<void> =>{
      const result = await PZService.school.getCourseWithdrawalTrendAnalysis({
        type: selectedTime.value.timeType,
        period: selectedTime.value.dateRange.join(',')
      })
      lineChartData.xData = result.map(item=>item.time)
      lineChartData.yData[0].data = result.map(item=>item.count)
    }

    const panelSlots = {
      extra: (): JSX.Element => <DateInlineForm v-model:modelValue={selectedTime.value} onSearch={() => handleTimeChange()} />,
    };

    return (): JSX.Element => (
      <SubPanelTemplate title="退课趋势" class="course-info-overview" v-slots={panelSlots}>
        <div class='card-container-3'>
          <LineChart xData={lineChartData.xData} series={lineChartData.yData} showLegend={true} titles={['退课人数']} gridTop="15" unit={{ x: '', y: '人' }} axisPointer={true} />
        </div>
      </SubPanelTemplate>
    );
  }
});