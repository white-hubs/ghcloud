import { defineComponent, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { PZService } from '../../../card-service/service'

// 模拟获取今日报事总人数的函数
const fetchTodayRepairCount = async (): Promise<number> => {
  return PZService.property.getPropertyComplaintRepairTodayRepairCount()
}

export const PropertyRepairTodayReporter = defineComponent({
  setup () {
    const todayRepairCount = ref(0);

    onMounted(async () => {
      todayRepairCount.value = await fetchTodayRepairCount();
    });

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.15rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }} class='card-container-4'>
          <h3 style={{
            fontSize: '0.1rem',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '10px'
          }}>物业今日报修人数</h3>
          <p style={{
            fontSize: '0.12rem',
            fontWeight: 'bold',
            color: '#91cc75',
            margin: '0'
          }}>今日报事总人数: {todayRepairCount.value} 人</p>
        </div>
      </SubPanelTemplate>
    )
  }
})