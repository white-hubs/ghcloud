import { defineComponent, inject, onMounted, ref } from 'vue'
import { Card } from '@/components/card/card'
import styles from './high-standard-farmland-card.module.less'
import { Select, Skeleton } from 'ant-design-vue'
import CountTo from '@/components/count-to/count-to'
import { CaretDownOutlined } from '@ghcloud/cube-ui'

interface AreaData {
  name: string;
  value: number;
  unit: string;
}

interface ProgressStep {
  name: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

export const HighStandardFarmlandCard = defineComponent({
  setup () {
    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const loading = ref(false)
    const totalArea = ref(dataType === 'sz' ? 31861 : 5597)
    const taskArea = ref(dataType === 'sz' ? 3000 : 7)
    
    const activeFilter = ref('区域')
    const areaOptions = ref([
      { value: '区域', label: '区域'  },
      { value: '坪山区', label: '坪山区'  },
      { value: '光明区', label: '光明区'  },
      { value: '龙岗区', label: '龙岗区'  },
      { value: '大鹏新区', label: '大鹏新区'  },
    ])
    const areaList = ref<AreaData[]>(
      dataType === 'sz' 
      ? [
        {
          name: '坪山区',
          value: 1154.67,
          unit: '亩'
        },
        {
          name: '光明区',
          value: 1185.63,
          unit: '亩'
        },
        {
          name: '龙岗区',
          value: 177.38,
          unit: '亩'
        },
        {
          name: '大鹏新区',
          value: 953.11,
          unit: '亩'
        }
      ]
      : [
        {
          name: '2022年',
          value: 0,
          unit: '亩'
        },
        {
          name: '2023年',
          value: 4211.67,
          unit: '亩'
        },
        {
          name: '2024年',
          value: 1385.9,
          unit: '亩'
        },
        {
          name: '2025年',
          value: 0,
          unit: '亩'
        },
    ])
    
    const progressSteps = ref<ProgressStep[]>([
      { name: '立项', status: 'completed', icon: 'icon-11' },
      { name: '初步设计', status: 'completed', icon: 'icon-12' },
      { name: '工程施工', status: 'completed', icon: 'icon-13' },
      { name: '初步验收', status: 'current', icon: 'icon-14' },
      { name: '市级验收', status: 'completed', icon: 'icon-15' },
      { name: '整改', status: 'completed', icon: 'icon-16' },
      { name: '批复', status: 'pending', icon: 'icon-17' }
    ])
    
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
        }, 500)
      }
    }

    // 处理筛选器切换
    const handleFilterChange = (filter: string): void => {
      activeFilter.value = filter
      // 这里可以根据筛选条件重新获取数据
    }

    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (
      <Card title="高标农田">
        <div class={styles.container}>
          <Skeleton active loading={loading.value} paragraph={{ rows: 6 }}>
            <div class={styles.summaryContainer}>
              <div class={styles.summaryItem}>
                <div class={styles.summaryContent}>
                  <img src="/apps/@ghcloud/farmland-data-viz/images/icon-a.png" class={styles.summaryIcon} />
                  <div class={styles.summaryLabel}>总面积</div>
                </div>
                <div class={styles.summaryValue}>
                  <CountTo startVal={0} endVal={totalArea.value} duration={2000} separator='' />
                  <span class={styles.unit}>亩</span>
                </div>
              </div>
              {
                dataType === 'sz' ? 
                <div class={styles.summaryItem}>
                  <div class={styles.summaryContent}>
                    <img src="/apps/@ghcloud/farmland-data-viz/images/icon-9.png" class={styles.summaryIcon} />
                    <div class={styles.summaryLabel}>2025任务面积</div>
                  </div>
                    <div class={styles.summaryValue}>
                      <CountTo startVal={0} endVal={taskArea.value} duration={2000} separator='' />
                      <span class={styles.unit}>亩</span>
                    </div>
                </div>
                :
                <div class={styles.summaryItem}>
                  <div class={styles.summaryContent}>
                    <img src="/apps/@ghcloud/farmland-data-viz/images/icon-9.png" class={styles.summaryIcon} />
                    <div class={styles.summaryLabel}>高标准农田项目数</div>
                  </div>
                    <div class={styles.summaryValue}>
                      <CountTo startVal={0} endVal={taskArea.value} duration={2000} separator='' />
                      <span class={styles.unit}>个</span>
                    </div>
                </div>
              }
            </div>
            
            <div class={styles.areaContainer}>
              {areaList.value.map((area, index) => (
                <div class={styles.areaItem} key={area.name}>
                  <span class={styles.areaName}>{area.name}</span>
                  <span class={styles.areaValue}>
                    <CountTo startVal={0} endVal={area.value} duration={2000} separator='' />
                    <span class={styles.unit}>{area.unit}</span>
                  </span>
                </div>
              ))}
            </div>
            
            <div class={styles.progressContainer}>
              <div class={styles.progressHeader}>
                <div class={styles.progressTitle}>高标建设任务进度</div>
                {
                  dataType === 'sz' && 
                  <div class={styles.filterContainer}>
                    <Select
                      v-model:value={activeFilter.value}
                      options={areaOptions.value}
                      class={[styles.filterItem, activeFilter.value === '区域' ? styles.activeFilter : '']}
                      getPopupContainer={(triggerNode: { parentNode: any }) => triggerNode.parentNode} 
                      v-slots={{
                        suffixIcon: () => {
                          return <CaretDownOutlined />  
                        }
                      }} 
                    />
                  </div>
                }
              </div>
              
              <div class={styles.progressSteps}>
                {progressSteps.value.map((step, index) => (
                  <div class={[styles.progressStep, styles[`status-${step.status}`]]} key={step.name}>
                    {/* <div class={styles.stepIcon}> */}
                    <div class={styles.icon}>
                      <img src={`/apps/@ghcloud/farmland-data-viz/images/${step.icon}.png`} />
                    </div>
                    <div class={styles.stepName}>{step.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </Skeleton>
        </div>
      </Card>
    )
  }
})