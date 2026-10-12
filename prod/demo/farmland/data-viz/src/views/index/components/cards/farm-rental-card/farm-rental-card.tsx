import { defineComponent, onMounted, ref, onBeforeUnmount, inject, computed } from 'vue'
import { Card } from '@/components/card/card'
import styles from './farm-rental-card.module.less'
import { Skeleton } from 'ant-design-vue'
import { ProgressBar } from '@/components/progress-bar/progress-bar'

interface RentalCompany {
  name: string;
  value: number;
  unit: string;
}

export const FarmRentalCard = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const dataList = ref<RentalCompany[]>(
      dataType === 'sz' ? [
      {
        name: '深圳市光明区辰农农业科技有限..',
        value: 6678,
        unit: '亩'
      },
      {
        name: '深圳市光明集团有限公司',
        value: 3861,
        unit: '亩'
      },
      {
        name: '深圳市寰通农产品有限公司',
        value: 1261,
        unit: '亩'
      },
      {
        name: '创世纪种业有限公司',
        value: 1084,
        unit: '亩'
      },
      {
        name: '广东天地和实业控股集团有限公司',
        value: 1082,
        unit: '亩'
      }
    ]
    : [
      {
        name: '土地公司',
        value: 10000,
        unit: '亩'
      },
    ]
  )
    const isHovering = ref(false)
    const scrollTimer = ref<number | null>(null)
    
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
        // const res = await someService.getRentalCompanies()
        // if (res) {
        //   dataList.value = res.map(...)
        //   total.value = res.reduce((acc, cur) => acc + cur.value, 0)
        // }
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

    // 点击企业项处理
    const handleCompanyClick = (company: RentalCompany): void => {
      // 这里可以添加点击后的业务逻辑，如显示详情弹窗等
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
      <Card title="农田租赁企业">
        <div 
          class={[styles['container'], dataType === 'sz' ? styles['sz'] : styles['sub-area']]}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
        >
          <Skeleton active loading={loading.value} paragraph={{ rows: dataType === 'sz' ? 6 : 0 }}>
            <div class={styles.scroll}>
              {dataList.value.length === 0 ? (
                <div class={styles.noData}>暂无数据</div>
              ) : (
                dataList.value.map((item, index) => (
                  <div class={styles.item} key={item.name} onClick={() => handleCompanyClick(item)}>
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