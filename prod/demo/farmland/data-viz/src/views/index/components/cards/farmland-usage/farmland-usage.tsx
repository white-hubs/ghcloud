import { defineComponent, onMounted, ref, computed, inject } from 'vue'
import { Card } from '@/components/card/card'
import styles from './farmland-usage.module.less'
import { Skeleton } from 'ant-design-vue'
import { ElevatorAnalysisPie } from '@/components/elevator-analysis-pie/elevator-analysis-pie'
import { ElevatorAnalysisList } from '@/components/elevator-analysis-list/elevator-analysis-list'
import { CaretDownOutlined, CaretUpOutlined } from '@ghcloud/cube-ui'

interface UsageItem {
  name: string;
  value: number;
  color: string;
  code?: string;
  unit?: string;
}

export const FarmlandUsage = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const totalAcreage = ref(0)
    const currentPage = ref(1)
    const totalPages = ref(2)
    
    const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
    const usageData = ref<UsageItem[]>(
      dataType === 'sz' ? [
        {
          name: '蔬菜种植',
          value: 20058.53,
          color: colors[0],
          code: 'RESEARCH',
          unit: '亩'
        },
        {
          name: '生产示范',
          value: 4995.74,
          color: colors[1],
          code: 'SHOWCASE',
          unit: '亩'
        },
        {
          name: '科研用途',
          value: 2331.74,
          color: colors[2],
          code: 'GRAIN',
          unit: '亩'
        },
      // {
      //   name: '赤石街道(13586.1亩)',
      //   value: 13586.1,
      //   color: colors[0],
      //   code: 'RESEARCH'
      // },
      // {
      //   name: '新湖街道(7347.6亩)',
      //   value: 7347.6,
      //   color: colors[1],
      //   code: 'SHOWCASE'
      // },
      // {
      //   name: '鹅埠街道(5520.1亩)',
      //   value: 5520.1,
      //   color: colors[2],
      //   code: 'GRAIN'
      // },
      // {
      //   name: '龙田街道(2792.3亩)',
      //   value: 2792.3,
      //   color: colors[3],
      //   code: 'VEGETABLE'
      // },
      // {
      //   name: '石岩街道(2350.9亩)',
      //   value: 2350.9,
      //   color: colors[4],
      //   code: 'EDUCATION'
      // },

      // // 第二页
      // {
      //   name: '福海街道',
      //   value: 2.34,
      //   color: colors[0],
      //   code: 'RESEARCH',
      //   unit: '亩'
      // },
      // {
      //   name: '新安街道',
      //   value: 4.46,
      //   color: colors[1],
      //   code: 'SHOWCASE',
      //   unit: '亩'
      // },
      // {
      //   name: '吉华街道',
      //   value: 5.74,
      //   color: colors[2],
      //   code: 'GRAIN',
      //   unit: '亩'
      // },
      // {
      //   name: '坑梓街道',
      //   value: 6.05,
      //   color: colors[3],
      //   code: 'VEGETABLE',
      //   unit: '亩'
      // },
      // {
      //   name: '沙井街道',
      //   value: 9.46,
      //   color: colors[4],
      //   code: 'EDUCATION',
      //   unit: '亩'
      // }
    ]
    : [
      {
        name: '蔬菜种植',
        value: 5648.35,
        color: colors[0],
        code: 'RESEARCH',
        unit: '亩'
      },
      {
        name: '生产示范',
        value: 3206.28,
        color: colors[1],
        code: 'SHOWCASE',
        unit: '亩'
      },
      {
        name: '科研用途',
        value: 1569.45,
        color: colors[2],
        code: 'GRAIN',
        unit: '亩'
      },
      // {
      //   name: '大安村',
      //   value: 4743.71,
      //   color: colors[0],
      //   code: 'RESEARCH',
      //   unit: '亩'
      // },
      // {
      //   name: '明热村',
      //   value: 1690.45,
      //   color: colors[1],
      //   code: 'SHOWCASE',
      //   unit: '亩'
      // },
      // {
      //   name: '西湖村',
      //   value: 1414.93,
      //   color: colors[2],
      //   code: 'GRAIN',
      //   unit: '亩'
      // },
      // {
      //   name: '赤石村',
      //   value: 1198.21,
      //   color: colors[3],
      //   code: 'VEGETABLE',
      //   unit: '亩'
      // },
      // {
      //   name: '冰深村',
      //   value: 1037.30,
      //   color: colors[4],
      //   code: 'EDUCATION',
      //   unit: '亩'
      // },
      
      // // 第二页
      // {
      //   name: '红源村',
      //   value: 60.41,
      //   color: colors[0],
      //   code: 'RESEARCH',
      //   unit: '亩'
      // },
      // {
      //   name: '东旺村',
      //   value: 33.15,
      //   color: colors[1],
      //   code: 'SHOWCASE',
      //   unit: '亩'
      // },
      // {
      //   name: '朝面山村',
      //   value: 11.12,
      //   color: colors[2],
      //   code: 'GRAIN',
      //   unit: '亩'
      // },
      // {
      //   name: '南香村',
      //   value: 7.82,
      //   color: colors[3],
      //   code: 'VEGETABLE',
      //   unit: '亩'
      // },
      // {
      //   name: '田寮村',
      //   value: 2.87,
      //   color: colors[4],
      //   code: 'EDUCATION',
      //   unit: '亩'
      // },
    ]
  )

    // 计算总面积
    totalAcreage.value = usageData.value.reduce((sum, item) => sum + item.value, 0)

    // 模拟获取数据
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 500)
      }
    }

    // 处理列表项点击
    const handleItemClick = (item: UsageItem): void => {
      // 这里可以添加点击后的逻辑，如打开详情弹窗等
    }

    const paginatedUsageData = computed(() => {
      const itemsPerPage = 5
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return usageData.value.slice(start, end)
    })

    // 处理分页切换
    const handlePageChange = (): void => {
      currentPage.value = (currentPage.value % totalPages.value) + 1
    }

    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (
      <Card title='农田租赁用途'>
        <div class={styles['farmland-usage-container']}>
          <Skeleton active loading={loading.value} paragraph={{ rows: 3 }}>
            <div class={styles['content-wrap']} style={{ opacity: loading.value ? '0' : '1' }}>
              <ElevatorAnalysisPie 
                class={styles['chart-container']} 
                pieClass={styles['chart-inner']} 
                pieData={paginatedUsageData.value}
              >
                <div class={styles['chart-center-content']}>
                  <div class={styles['chart-center-icon']}>
                    <img src={`/apps/@ghcloud/farmland-data-viz/images/icon-10.png`} />
                  </div>
                </div>
              </ElevatorAnalysisPie>
              
              <ElevatorAnalysisList 
                contentList={paginatedUsageData.value} 
                showRatio={false} 
                warperClassName={styles['legend-container']}
                onHandlecurrent={handleItemClick}
              />
            </div>
          </Skeleton>
          
          <div class={styles['pagination']} onClick={handlePageChange} style={{ display: 'none' }}>
            <CaretUpOutlined class={styles['page-icon']} />
            <span>{currentPage.value}/{totalPages.value}</span>
            <CaretDownOutlined class={styles['page-icon']} />
          </div>
        </div>
      </Card>
    )
  }
})