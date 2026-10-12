import { defineComponent, inject, onMounted, ref } from 'vue'
import { Card } from '@/components/card/card'
import styles from './achievement-card.module.less'
import { Skeleton } from 'ant-design-vue'
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";

interface AchievementItem {
  title: string;
  description: string;
}

export const AchievementCard = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const isHovering = ref(false)
    
    const achievements = ref<AchievementItem[]>(
      dataType === 'sz' ? [
      {
        title: '耕地保护成效显著',
        description: '我市耕地面积7.56万亩，其中划定永久基本农田5.00万亩已建成高标准农田面积3.18万亩。',
      },
      {
        title: '超额完成粮食种植任务',
        description: '连续4年超额完成国家和省下达的粮油种植、高标准农田建设任务。',
      },
      {
        title: '耕地质量稳步提升',
        description: '根据省农业农村厅耕地质量等级评价成果，深圳市耕地平均质量等级从2021年的3.17等提升到2024年的3.12等。',
      },
    ]
    : [
      {
        title: '耕地保护成效显著',
        description: '我市耕地面积7.56万亩，其中划定永久基本农田5.00万亩已建成高标准农田面积3.18万亩。',
      },
      {
        title: '超额完成粮食种植任务',
        description: '连续4年超额完成国家和省下达的粮油种植、高标准农田建设任务。',
      },
      {
        title: '耕地质量稳步提升',
        description: '根据省农业农村厅耕地质量等级评价成果，深圳市耕地平均质量等级从2021年的3.17等提升到2024年的3.12等。',
      },
    ]
  )

    // 模拟获取数据
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
      } finally {
        // 添加延迟以便更好地展示骨架屏效果
        setTimeout(() => {
          loading.value = false
        }, 500)
      }
    }

    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (
      <Card title="取得成效">
        <div 
          class={styles['achievement-container']}
        >
          <Skeleton active loading={loading.value} paragraph={{ rows: 4 }}>
            <div class={styles['content-wrap']} style={{ opacity: loading.value ? '0' : '1' }}>
              <div class={styles['items-container']}>
              <Vue3SeamlessScroll 
                list={achievements.value} 
                step={0.5} 
                hover 
                direction="up"
              >
                {achievements.value.map((item, index) => (
                  <div class={styles['achievement-item']} key={index} style={{ marginBottom: '8px' }}>
                    <div class={styles['achievement-content']}>
                      <div class={styles['achievement-title']}>{item.title}</div>
                      <div class={styles['achievement-description']}>{item.description}</div>
                    </div>
                  </div>
                ))}
              </Vue3SeamlessScroll>
              </div>
            </div>
          </Skeleton>
        </div>
      </Card>
    )
  }
})