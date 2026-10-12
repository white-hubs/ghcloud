import { defineComponent, reactive } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import styles from './course-selection-type-analysis.module.less'
import { PZService } from '@/components/businessPanel/pz-demo/card-service/service'
export const CourseSelectionTypeAnalysis = defineComponent({
  setup () {
    const colors = ['#FFAB10', '#2F8DFF', '#F14545', '#19F8F7', "#B9D9FF", '#FFAB10', '#2F8DFF', '#F14545', '#19F8F7', "#B9D9FF"]
    // 当前选中的时间范围
    const state = reactive({
      selectedTime: {
        timeType: 'TODAY',
        dateRange: [],

      },
      total: 0,
      pieData: [
        { name: '体育类', value: 45, color: '#FFAB10' },
        { name: '历史类', value: 60, color: '#2F8DFF' },
        { name: '数学类', value: 40, color: '#F14545' },
        { name: '文学类', value: 10, color: '#19F8F7' },
        { name: '艺术类', value: 150, color: "#B9D9FF" },
        { name: '科学类', value: 45, color: '#FFAB10' },
        { name: '语言类', value: 6, color: '#2F8DFF' },
        { name: '计算机类', value: 400, color: '#F14545' },
        { name: '经济类', value: 21, color: '#19F8F7' },
        { name: '管理类', value: 150, color: "#B9D9FF" }
      ]
    })
    const handleTimeChange = (): void => {
      getDataStat()
    }
    const getDataStat = async (): Promise<void> =>{
      const result = await PZService.school.getCourseTypeAnalysis({
        period: state.selectedTime.dateRange.join(','),
        type: state.selectedTime.timeType
      })
      const total = result.reduce((total, item) => total + item.courseNumber, 0)
      state.total = total
      state.pieData = result.map((item, index) => {
        return {
          name: item.courseName,
          value: item.courseNumber,
          color: colors[index]
        }
      })
    }
    const panelSlots = {
      extra: (): JSX.Element => <DateInlineForm v-model:modelValue={state.selectedTime} onSearch={() => handleTimeChange()} />,
    };
    return (): JSX.Element => (
      <SubPanelTemplate title="选课类别分析" class="course-info-overview" v-slots={panelSlots}>
        <div class={styles['elevator-analysis']} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div class='card-container-3' style={{ width: '50%' }}>
            <ElevatorAnalysisPie pieData={state.pieData} >
              <div>{state.total}</div>
              <div>课程总数</div>
            </ElevatorAnalysisPie>
          </div>
          <div class={styles.elevatorAnalysisList} >
            <ElevatorAnalysisList contentList={state.pieData} />
          </div>
        </div>
      </SubPanelTemplate>
    );
  }
})