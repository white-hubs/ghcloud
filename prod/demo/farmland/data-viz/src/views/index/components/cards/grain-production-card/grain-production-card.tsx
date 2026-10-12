import { defineComponent, onMounted, ref, onBeforeUnmount, inject, computed } from 'vue'
import { Card } from '@/components/card/card'
import styles from './grain-production-card.module.less'
import { Skeleton } from 'ant-design-vue'
import { ProgressBar } from '@/components/progress-bar/progress-bar'

interface GrainProductionItem {
  name: string;
  value: number;
  unit: string;
}

export const GrainProductionCard = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const dataList = ref<GrainProductionItem[]>(
    dataType === 'sz' ? 
    [
      // 排名前五位
      {
        name: '赤石街道',
        value: 13586.1,
        unit: '亩'
      },
      {
        name: '新湖街道',
        value: 7347.6,
        unit: '亩'
      },
      {
        name: '鹅埠街道',
        value: 5520.1,
        unit: '亩'
      },
      {
        name: '龙田街道',
        value: 2792.3,
        unit: '亩'
      },
      {
        name: '石岩街道',
        value: 2350.9,
        unit: '亩'
      },

      // 排名后五位
      {
        name: '福海街道',
        value: 2.34,
        unit: '亩'
      },
      {
        name: '新安街道',
        value: 4.46,
        unit: '亩'
      },
      {
        name: '吉华街道',
        value: 5.74,
        unit: '亩'
      },
      {
        name: '坑梓街道',
        value: 6.05,
        unit: '亩'
      },
      {
        name: '沙井街道',
        value: 9.46,
        unit: '亩'
      }
    ]
    : [
      // 排名前五位
      {
        name: '大安村',
        value: 4743.7,
        unit: '亩'
      },
      {
        name: '明热村',
        value: 1690.45,
        unit: '亩'
      },
      {
        name: '西湖村',
        value: 1414.9,
        unit: '亩'
      },
      {
        name: '赤石村',
        value: 1198.2,
        unit: '亩'
      },
      {
        name: '冰深村',
        value: 1037.30,
        unit: '亩'
      },

      // 排名后五位
      {
        name: '红源村',
        value: 60.41,
        unit: '亩'
      },
      {
        name: '东旺村',
        value: 33.15,
        unit: '亩'
      },
      {
        name: '朝面山村',
        value: 11.12,
        unit: '亩'
      },
      {
        name: '南香村',
        value: 11.12,
        unit: '亩'
      },
      {
        name: '田寮村',
        value: 7.82,
        unit: '亩'
      }
    ]
  )
    const isHovering = ref(false)
    const scrollTimer = ref<number | null>(null)
    const activeTab = ref('前五位')
    
    const total = computed(() => {
      const sum = dataList.value.reduce((sum, item) => sum + item.value, 0)
      return Math.floor(sum)
    })
    // 模拟获取数据
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        await new Promise(resolve => setTimeout(resolve, 500))
        // 实际项目中这里应该调用API获取数据
      } catch (error) {
      } finally {
        // 添加延迟以便更好地展示骨架屏效果
        setTimeout(() => {
          loading.value = false
          startAutoScroll()
        }, 500)
      }
    }

    // 自动滚动功能
    const startAutoScroll = (): void => {
      if (scrollTimer.value) clearInterval(scrollTimer.value)
      
      scrollTimer.value = window.setInterval(() => {
        if (!isHovering.value) {
          const container = document.querySelector(`.${styles.scroll}`) as HTMLElement
          if (container) {
            // 如果已经滚动到底部，则回到顶部
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
              container.scrollTop = 0
            } else {
              // 平滑滚动
              container.scrollBy({ top: 20, behavior: 'smooth' })
            }
          }
        }
      }, 2000) // 每2秒滚动一次
    }

    // 鼠标悬停处理
    const handleMouseEnter = (): void => {
      isHovering.value = true
    }

    const handleMouseLeave = (): void => {
      isHovering.value = false
    }

    // 点击区域项处理
    const handleItemClick = (item: GrainProductionItem): void => {
      // 这里可以添加点击后的业务逻辑，如显示详情弹窗等
    }
    
    const displayData = computed(() => {
      if (activeTab.value === '前五位') {
        return dataList.value.slice(0, 5)
      } else {
        return dataList.value.slice(5, 10)
      }
    })
    
    // 切换标签
    const handleTabChange = (tab: string): void => {
      activeTab.value = tab
      // 这里可以根据标签切换数据
      // 实际项目中可能需要重新请求数据
    }

    onMounted(() => {
      getData()
    })

    onBeforeUnmount(() => {
      if (scrollTimer.value) {
        clearInterval(scrollTimer.value)
      }
    })

    return (): JSX.Element => (
      <Card title="永久基本农田">
        <div 
          class={styles.container}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
        >
          <div class={styles.tabContainer}>
            <div 
              class={[styles.tab, activeTab.value === '前五位' ? styles.activeTab : '']}
              onClick={() => handleTabChange('前五位')}
            >
              排名前五位
            </div>
            <div 
              class={[styles.tab, activeTab.value === '后五位' ? styles.activeTab : '']}
              onClick={() => handleTabChange('后五位')}
            >
              排名后五位
            </div>
          </div>
          <Skeleton active loading={loading.value} paragraph={{ rows: 6 }}>
            <div class={styles.scroll}>
              {displayData.value.length === 0 ? (
                <div class={styles.noData}>暂无数据</div>
              ) : (
                displayData.value.map((item, index) => (
                  <div class={styles.item} key={item.name} onClick={() => handleItemClick(item)}>
                    <ProgressBar index={index + 1} total={total.value} label={item.name} value={item.value} unit={item.unit} />
                  </div>
                ))
              )}
            </div>
          </Skeleton>
        </div>
      </Card>
    )
  }
})