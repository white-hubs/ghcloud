import { defineComponent, onMounted, ref, computed, inject } from 'vue'
import { Card } from '@/components/card/card'
import styles from './cultivated-land.module.less'
import { Skeleton } from 'ant-design-vue'
import { ElevatorAnalysisPie } from '@/components/elevator-analysis-pie/elevator-analysis-pie'
import { CaretDownOutlined, CaretUpOutlined } from '@ghcloud/cube-ui'
import CountTo from '@/components/count-to/count-to'
import { ElevatorAnalysisList } from './components/elevator-analysis-list/elevator-analysis-list'

interface LandItem {
  name: string;
  value: number;
  color: string;
  code?: string;
}

export const CultivatedLand = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(2)
    
    const totalArea = computed(() => {
      const sum = landData.value.reduce((sum, item) => sum + item.value, 0)
      return Math.floor(sum)
    })
    
    const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
    const landData = ref<LandItem[]>(
      dataType === 'sz' ? [
      {
        name: '粮食作物(20162.3亩)',
        value: 20162.3,
        color: colors[0],
        code: 'GRAIN'
      },
      {
        name: '非粮食作(31899亩)',
        value: 31899,
        color: colors[1],
        code: 'NON_GRAIN'
      },
      {
        name: '间作轮作(5779.9亩)',
        value: 5779.9,
        color: colors[2],
        code: 'ABANDONED'
      },
      {
        name: '未耕种(17831.8亩)',
        value: 17831.8,
        color: colors[3],
        code: 'OTHER'
      }
    ]
    : [
      {
        name: '粮食作物(14147.7亩)',
        value: 14147.7,
        color: colors[0],
        code: 'GRAIN'
      },
      {
        name: '非粮食作(5440.6亩)',
        value: 5440.6,
        color: colors[1],
        code: 'NON_GRAIN'
      },
      {
        name: '间作轮作(4359.8亩)',
        value: 4359.8,
        color: colors[2],
        code: 'ABANDONED'
      },
      {
        name: '未耕种(6258.6亩)',
        value: 6258.6,
        color: colors[3],
        code: 'OTHER'
      }
    ]
  )

    // 模拟获取数据
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        // 这里可以调用实际的API
        // 模拟异步加载
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 500)
      }
    }

    // 处理列表项点击
    const handleItemClick = (item: LandItem): void => {
      // 这里可以添加点击后的逻辑，如打开详情弹窗等
    }

    // 处理分页切换
    const handlePageChange = (): void => {
      currentPage.value = currentPage.value === 1 ? 2 : 1
    }

    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (
      <Card title="耕地种植情况">
        <div class={styles['cultivated-land-container']}>
          <Skeleton active loading={loading.value} paragraph={{ rows: 4 }}>
            <div class={styles['content-wrap']} style={{ opacity: loading.value ? '0' : '1' }}>
              <ElevatorAnalysisPie 
                class={styles['chart-container']} 
                pieClass={styles['chart-inner']} 
                pieData={landData.value}
              >
                <div class={styles['chart-center-content']}>
                  <div class={styles['total-value']}>
                    <CountTo startVal={0} endVal={totalArea.value} duration={2000} separator='' />
                  </div>
                  <div class={styles['total-label']}>总面积(亩)</div>
                </div>
              </ElevatorAnalysisPie>
              
              <ElevatorAnalysisList 
                contentList={landData.value} 
                showRatio={true} 
                warperClassName={styles['legend-container']}
                onHandlecurrent={handleItemClick}
              />
            </div>
          </Skeleton>
          
          <div style={{ display: 'none' }} class={styles['pagination']} onClick={handlePageChange}>
            <CaretUpOutlined class={styles['page-icon']} />
            <span>{currentPage.value}/{totalPages.value}</span>
            <CaretDownOutlined class={styles['page-icon']} />
          </div>
        </div>
      </Card>
    )
  }
})