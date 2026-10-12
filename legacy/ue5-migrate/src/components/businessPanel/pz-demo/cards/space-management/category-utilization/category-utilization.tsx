import { defineComponent, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import styles from './category-utilization.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";

export const CategoryUtilization = defineComponent({
  setup () {
    const timeRange = ref({
      timeType: 'THIS_MONTH',
    })
    const visitingData = ref([
      { title: "整体利用率统计", value: 3200, ratio: 8.5 },
      { title: "租赁利用率统计", value: 1800, ratio: 35.0 },
      { title: "销售利用率", value: 600, ratio: -3.0 },
      { title: "区域利用率统计", value: 400, ratio: 5.2 },
    ]);
    watch(()=>timeRange.value.timeType, () => {
      // 模拟数据
      if (timeRange.value.timeType === 'THIS_MONTH') {
        visitingData.value = [
          { title: "整体利用率统计", value: 3200, ratio: 8.5 },
          { title: "租赁利用率统计", value: 1800, ratio: 35.0 },
          { title: "销售利用率", value: 600, ratio: -3.0 },
          { title: "区域利用率统计", value: 400, ratio: 5.2 },
        ]
      } else if (timeRange.value.timeType === 'THIS_QUARTER') {
        // 季度数据通常会比月度数据更高，因为包含了多个月的数据
        visitingData.value = [
          { title: "整体利用率统计", value: 9800, ratio: 15.3 },
          { title: "租赁利用率统计", value: 5800, ratio: 55.0 },
          { title: "销售利用率", value: 2200, ratio: -2.0 },
          { title: "区域利用率统计", value: 1200, ratio: 10.7 },
        ]
      } else {
        // 年度数据通常会比季度数据更高，因为包含了全年的数据
        visitingData.value = [
          { title: "整体利用率统计", value: 38000, ratio: 22.3 },
          { title: "租赁利用率统计", value: 22000, ratio: 65.0 },
          { title: "销售利用率", value: 8000, ratio: 1.0 },
          { title: "区域利用率统计", value: 4500, ratio: 15.7 },
        ]
      }
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本月", value: "THIS_MONTH" },
            { label: "本季度", value: "THIS_QUARTER" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class={`card-container-4 ${styles['visiting-data']}`}>
          {
            visitingData.value.map((item) => (
              <div class={styles.item} key={item.title}>
                <a-statistic title={item.title}>
                  {{
                    formatter: () => (
                      <>
                        <CountTo startVal={0} endVal={item.value} duration={2000} separator=""></CountTo>
                        <div class={styles.ringRatio}>
                          <span style="white-space: nowrap;">环比</span>
                          <div class={`${styles.downtriangle} ${item.ratio ? styles.uptriangle : ''}`}></div>
                          <div class={`${item.ratio ? styles.up : styles.down}`}>{ item.ratio + "%" }</div>
                        </div>
                      </>
                    )
                  }}
                </a-statistic>
              </div>
            ))
          }
        </div>
      </SubPanelTemplate>
    )
  }
})