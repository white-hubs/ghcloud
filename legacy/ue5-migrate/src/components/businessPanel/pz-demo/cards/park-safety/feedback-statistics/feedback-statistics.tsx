import { computed, defineComponent, onMounted, reactive } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './feedback-statistics.module.less'
import { PZService } from '../../../card-service/service'

export const FeedbackStatistics = defineComponent({
  name: 'FeedbackStatistics',
  setup () {
    // 模拟数据
    const feedbackData = reactive({
      withFeedback: 156,
      withoutFeedback: 78
    })
    // todo: 此处数据响应感觉有问题
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getSecurityEventProcessingFeedbackStatistics()
      feedbackData.withFeedback = result.feedbackCount
      feedbackData.withoutFeedback = result.feedbackCount
    }
    const total = computed(()=>{
      return feedbackData.withFeedback + feedbackData.withoutFeedback
    })
    const withFeedbackPercentage = computed(()=>{
      return ((feedbackData.withFeedback / total.value) * 100).toFixed(1)
    })
    const withoutFeedbackPercentage = computed(()=>{
      return ((feedbackData.withoutFeedback / total.value) * 100).toFixed(1)
    })
    onMounted(()=>{
      getData()
    })

    // const total = feedbackData.withFeedback + feedbackData.withoutFeedback
    // const withFeedbackPercentage = ((feedbackData.withFeedback / total) * 100).toFixed(1)
    // const withoutFeedbackPercentage = ((feedbackData.withoutFeedback / total) * 100).toFixed(1)

    return (): JSX.Element => (
      <SubPanelTemplate title='反馈统计'>
        <div class={['card-container-3', styles.feedbackContainer]}>
          <div class={styles.totalCount}>
            <div class={styles.number}>{total.value}</div>
            <span>总计</span>
          </div>

          <div class={styles.feedbackTypes}>
            <div class={styles.feedbackType}>
              <div class={styles.typeHeader}>
                <div class={[styles.dot, styles.withFeedback]}></div>
                <div class={styles.typeName}>有反馈</div>
              </div>
              <div class={styles.typeContent}>
                <div class={styles.typeCount}>{feedbackData.withFeedback}</div>
                <div class={styles.typePercentage}>{withFeedbackPercentage.value}%</div>
              </div>
              <div class={styles.progressBar}>
                <div
                  class={styles.progressInner}
                  style={{ width: `${withFeedbackPercentage.value}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
                ></div>
              </div>
            </div>

            <div class={styles.feedbackType}>
              <div class={styles.typeHeader}>
                <div class={[styles.dot, styles.withoutFeedback]}></div>
                <div class={styles.typeName}>无反馈</div>
              </div>
              <div class={styles.typeContent}>
                <div class={styles.typeCount}>{feedbackData.withoutFeedback}</div>
                <div class={styles.typePercentage}>{withoutFeedbackPercentage.value}%</div>
              </div>
              <div class={styles.progressBar}>
                <div
                  class={styles.progressInner}
                  style={{ width: `${withoutFeedbackPercentage.value}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})