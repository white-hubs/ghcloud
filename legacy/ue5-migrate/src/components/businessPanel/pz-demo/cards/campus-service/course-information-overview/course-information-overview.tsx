import { defineComponent, reactive, ref } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OverviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { PZService } from '@/components/businessPanel/pz-demo/card-service/service'

export const CourseInformationOverview = defineComponent({
  setup () {
    // 当前选中的时间范围
    const selectedTime = ref({
      timeType: 'TODAY',
      dateRange: []
    });

    // 优化课程类别
    const optimizedBarData = reactive({
      xData: ['实践教学', '创新创业', '在线课程', '研讨课程', '讲座', '实验', '专题'],
      yData: [
        {
          data: [15, 25, 35, 45, 85, 95, 105],
          name: '',
          color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
        },
      ]
    });
    // 处理时间选择器变化
    const handleTimeChange = (): void => {
      getOverviewData();
    };
    const getOverviewData = async (): Promise<void> => {
      const data = await PZService.school.getCourseOverview({
        type: selectedTime.value.timeType,
        period: selectedTime.value.dateRange.join(','),
      });
      optimizedBarData.xData = data.map(item=>item.courseName)
      const yDataList = data.map(item=>item.courseNumber)
      optimizedBarData.yData[0].data = yDataList
    }
    const panelSlots = {
      extra: (): JSX.Element => <DateInlineForm v-model:modelValue={selectedTime.value} onSearch={() => handleTimeChange()} />,
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="课程信息总览" class="course-info-overview" v-slots={panelSlots}>
          <div class='card-container-2'>
            <OverviewChartBar xData={optimizedBarData.xData} yData={optimizedBarData.yData} />
          </div>
        </SubPanelTemplate>
      </>
    );
  }
});