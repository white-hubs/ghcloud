import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

export const RentIncomeAnalysis = defineComponent({
  name: 'RentIncomeAnalysis',
  setup () {
    // 模拟销售收益、租赁收益
    const salesIncome = ref(500000)
    const rentalIncome = ref(300000)

    // 计算租售收益总额
    const totalIncome = computed(() => salesIncome.value + rentalIncome.value)

    // 模拟生命周期钩子，参考 lease-utilization.tsx
    onMounted(() => {
      // 可以在这里添加组件挂载后的逻辑
    })

    onUnmounted(() => {
      // 可以在这里添加组件卸载后的逻辑
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-4' style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.1rem', // 调整间距
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: '0.1rem', // 24px
            margin: 0,
            fontWeight: 'bold',
          }}>累计销售收益: <span style={{ color: '#91cc75' }}>{salesIncome.value}</span></p>
          <p style={{
            color: '#ffffff',
            fontSize: '0.1rem',
            margin: 0,
            fontWeight: 'bold',
          }}>累计租赁收益: <span style={{ color: '#5470c6' }}>{rentalIncome.value}</span></p>
          <p style={{
            color: '#ffffff',
            fontSize: '0.14rem',
            margin: 0,
            fontWeight: 'bold',
          }}>租售收益总额: <span style={{ color: '#ee6666' }}>{totalIncome.value}</span></p>
        </div>
      </SubPanelTemplate>
    )
  }
})