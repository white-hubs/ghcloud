import { defineComponent, onMounted, ref, inject } from 'vue'
import { Card } from '@/components/card/card'
import styles from './facility-farmland.module.less'
import CountTo from '@/components/count-to/count-to'
import { Skeleton } from 'ant-design-vue'

interface FacilityItem {
  icon: string;
  title: string;
  value: number | string;
  unit: string;
}

export const FacilityFarmland = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const data = ref(
      dataType === 'sz' ? [
      {
        icon: 'icon-1',
        title: '设施农业用地面积',
        value: 505,
        unit: '亩',
      },
      {
        icon: 'icon-5',
        title: '抽查检查棚次',
        value: 1403,
        unit: '次'
      },
      {
        icon: 'icon-6',
        title: '大棚房问题数',
        value: 0,
        unit: '个'
      },
      {
        icon: 'icon-7',
        title: '抽查检查人次',
        value: '4521',
        unit: '次'
      }
    ]
    : [
      {
        icon: 'icon-1',
        title: '设施农业用地面积',
        value: 238.7,
        unit: '亩',
      },
      {
        icon: 'icon-5',
        title: '抽查检查棚次',
        value: 300,
        unit: '次'
      },
      {
        icon: 'icon-6',
        title: '大棚房问题数',
        value: 0,
        unit: '个'
      },
      {
        icon: 'icon-7',
        title: '抽查检查人次',
        value: '500',
        unit: '次'
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
      <Card title="设施农业用地">
        <div class={[styles['container'], dataType === 'sz' ? styles['sz'] : styles['sub-area']]}>
          <Skeleton active loading={loading.value} paragraph={{ rows: 4 }}>
            <div class={styles['data-wrap']}>
              {data.value.map((item: FacilityItem) => {
                return (
                  <div class={styles['data-item']}>
                    <div class={styles['data-icon']}>
                      <img src={`/apps/@ghcloud/farmland-data-viz/images/${item.icon}.png`} alt={item.title} />
                    </div>
                    <div class={styles['data-content']}>
                      <div class={styles['data-title']}>{item.title}</div>
                      <div class={styles['data-value']}>
                        {typeof item.value === 'number' ? (
                          <CountTo startVal={0} endVal={item.value} duration={2000} separator='' />
                        ) : (
                          item.value
                        )}
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