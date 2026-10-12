import { defineComponent, reactive, ref } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OverviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import { PZService } from '../../../card-service/service'

export const CourseWithdrawalTimeAnalysis = defineComponent({
  setup () {
    // 模拟数据
    const barData = reactive({
      xData: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周'],
      yData: [
        {
          data: [120, 150, 180, 200, 220, 250, 280],
          name: '退课人数',
          color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
      ]
    });

    // 当前选中的时间范围
    const selectedTime = ref({
      timeType: 'THIS_WEEK',
      dateRange: []
    });

    // 处理时间选择器变化
    const handleTimeChange = (): void => {
      // 根据选择的时间范围更新模拟数据
      getData();
    };
    const getData = async (): Promise<void> =>{
      const result = await PZService.school.getCourseWithdrawalTrendAnalysis({
        type: selectedTime.value.timeType,
        period: selectedTime.value.dateRange.join(',')
      })
      barData.xData = result.map(item=>item.time)
      barData.yData[0].data = result.map(item=>item.count)
    }

    const panelSlots = {
      extra: (): JSX.Element => <DateInlineForm v-model:modelValue={selectedTime.value} onSearch={() => handleTimeChange()} />,
    };

    return (): JSX.Element=> (
      <SubPanelTemplate title="退课时间分析" class="course-info-overview" v-slots={panelSlots}>
        <div class='card-container-3'>
          <OverviewChartBar xData={barData.xData} yData={barData.yData} />
        </div>
      </SubPanelTemplate>
    );
  }
});