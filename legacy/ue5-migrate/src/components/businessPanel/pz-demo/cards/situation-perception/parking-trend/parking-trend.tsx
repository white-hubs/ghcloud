import { defineComponent, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

// 模拟获取剩余车位数据的函数
const fetchParkingData = async (): Promise<{
  totalSpaces: number;
  availableSpaces: number;
}> => {
  // 这里可以替换为实际的 API 请求
  return {
    totalSpaces: 200,
    availableSpaces: 50
  };
}

export const ParkingTrend = defineComponent({
  setup () {
    const totalSpaces = ref(0)
    const availableSpaces = ref(0)

    onMounted(async () => {
      const data = await fetchParkingData()
      totalSpaces.value = data.totalSpaces
      availableSpaces.value = data.availableSpaces
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.15rem', marginBottom: '0.1em' }}>剩余车位</div>
            <div style={{ fontSize: '0.15rem', fontWeight: 'bold' }}>{availableSpaces.value} / {totalSpaces.value}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.15rem', marginBottom: '0.1em' }}>占比</div>
            <div style={{ fontSize: '0.15rem', fontWeight: 'bold' }}>{((availableSpaces.value / totalSpaces.value) * 100).toFixed(2)}%</div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})