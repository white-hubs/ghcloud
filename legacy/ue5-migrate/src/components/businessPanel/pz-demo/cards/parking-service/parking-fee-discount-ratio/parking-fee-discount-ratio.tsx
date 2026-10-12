import { defineComponent, ref, onMounted, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue"
import styles from './parking-fee-discount-ratio.module.less'
import { PZService } from '../../../card-service/service'

export const ParkingFeeDiscountRatio = defineComponent({
  name: 'ParkingFeeDiscountRatio',
  setup () {
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    const discountData = ref({
      totalAmount: 0, // 总金额
      discountAmount: 0, // 优惠金额
      discountRatio: 0, // 优惠占比
      yearOnYear: 0, // 同比
      monthOnMonth: 0 // 环比
    })

    // 模拟获取数据，实际项目中替换为真实API调用
    const fetchDiscountData = async (): Promise<void> => {
      // 这里替换为实际API调用
      const mockData = {
        TODAY: {
          totalAmount: 10000,
          discountAmount: 2000,
          yearOnYear: 5.2,
          monthOnMonth: -2.1
        },
        THIS_WEEK: {
          totalAmount: 70000,
          discountAmount: 15000,
          yearOnYear: 4.8,
          monthOnMonth: 1.5
        },
        THIS_MONTH: {
          totalAmount: 300000,
          discountAmount: 65000,
          yearOnYear: 3.5,
          monthOnMonth: 2.2
        }
      }

      let data = mockData[timeRange.value.timeType]
      data = await getData()
      discountData.value = {
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount,
        discountRatio: Number(((data.discountAmount / data.totalAmount) * 100).toFixed(1)),
        yearOnYear: data.yearOnYear,
        monthOnMonth: data.monthOnMonth
      }
    }
    const getData = async (): Promise<{
      totalAmount: number;
      discountAmount: number;
      yearOnYear: number;
      monthOnMonth: number;
    }> =>{
      try {
        const result = await PZService.parking.getDiscountAmountProportionAnalysis({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(','),
        })
        return {
          totalAmount: result.discountAmount,
          discountAmount: result.discountAmount,
          yearOnYear: result.yearOnYear,
          monthOnMonth: result.ringRatio
        }
      } catch {
      }
    }
    onMounted(() => {
      fetchDiscountData()
    })

    // 监听时间范围变化
    watch(() => timeRange.value.timeType, () => {
      fetchDiscountData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='停车费用折扣比例' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} ></DateInlineForm>
        )
      }}>
        <div class={['card-container-2', styles.container]}>
          <div class={styles.discountDisplay}>
            <WaterPolo
              bgColor="rgba(59, 130, 246, 0.8)"
              color="rgba(59, 130, 246, 0.8)"
              value={discountData.value?.discountRatio || 0}
              title=''
              unit='%'
            />
          </div>

          <div class={styles.statsContainer}>
            <div class={styles.statItem}>
              <div class={styles.statLabel}>优惠总金额</div>
              <div class={styles.statValue}>{discountData.value.discountAmount}元</div>
            </div>
            <div class={styles.statItem}>
              <div class={styles.statLabel}>同比</div>
              <div class={styles.statValue} style={{ color: discountData.value.yearOnYear >= 0 ? '#67C23A' : '#F56C6C' }}>
                {discountData.value.yearOnYear >= 0 ? '+' : ''}{discountData.value.yearOnYear}%
              </div>
            </div>
            <div class={styles.statItem}>
              <div class={styles.statLabel}>环比</div>
              <div class={styles.statValue} style={{ color: discountData.value.monthOnMonth >= 0 ? '#67C23A' : '#F56C6C' }}>
                {discountData.value.monthOnMonth >= 0 ? '+' : ''}{discountData.value.monthOnMonth}%
              </div>
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})