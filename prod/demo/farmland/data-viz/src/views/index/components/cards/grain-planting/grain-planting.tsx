import { defineComponent, inject, onMounted, ref } from 'vue'
import { Card } from '@/components/card/card'
import styles from './grain-planting.module.less'
import CountTo from '@/components/count-to/count-to'
import { Skeleton } from 'ant-design-vue'

interface PlantingItem {
  icon: string;
  title: string;
  value: number;
  unit: string;
}

export const GrainPlanting = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const data = ref(
      dataType === 'sz' ? [
      {
        icon: 'icon-1',
        title: '面积任务',
        value: 22000,
        unit: '亩',
      },
      {
        icon: 'icon-2',
        title: '已完成面积',
        value: 26138,
        unit: '亩'
      },
      {
        icon: 'icon-3',
        title: '产量任务',
        value: 7100,
        unit: '吨'
      },
      {
        icon: 'icon-4',
        title: '已完成产量',
        value: 8770,
        unit: '吨'
      }
    ]
    : [
      {
        icon: 'icon-1',
        title: '面积任务',
        value: 21000,
        unit: '亩',
      },
      {
        icon: 'icon-2',
        title: '已完成面积',
        value: 20000,
        unit: '亩'
      },
      {
        icon: 'icon-3',
        title: '产量任务',
        value: 6800,
        unit: '吨'
      },
      {
        icon: 'icon-4',
        title: '已完成产量',
        value: 7000,
        unit: '吨'
      }
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
      <Card title="粮食种植">
        <div class={styles['container']}>
          <Skeleton active loading={loading.value} paragraph={{ rows: 4 }}>
            <div class={styles['data-wrap']}>
              {data.value.map((item: PlantingItem) => {
                return (
                  <div class={styles['data-item']}>
                    <div class={styles['data-icon']}>
                      <img src={`/apps/@ghcloud/farmland-data-viz/images/${item.icon}.png`} alt={item.title} />
                    </div>
                    <div class={styles['data-content']}>
                      <div class={styles['data-title']}>{item.title}</div>
                      <div class={styles['data-value']}>
                        <CountTo startVal={0} endVal={item.value} duration={2000} separator='' />
                        <span class={styles['data-unit']}>{item.unit}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Skeleton>
        </div>
      </Card>
    )
  }
})