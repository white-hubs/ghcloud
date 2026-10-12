import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { Cell, CellGroup, Skeleton, showNotify } from 'vant'
import { getAssetsFile } from '@/utils'
import { useRouter } from 'vue-router'
import { cubeTodoTaskStatService } from '@/api/server'
import type { TodoTaskTag } from '@ghcloud/cube-todo-center-service'
import { LineChart } from '@/components/line-charts'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'
interface State {
  todoAmount: number;
  todoBusinessList: TodoTaskTag[];
  chartData: {
    xData: string[];
    value: number[];
  };
}

/** 待办中心-入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    const router = useRouter()
    const loading = ref(false)
    const statData = reactive<State>({
      todoAmount: 0,
      todoBusinessList: [],
      chartData: {
        xData: [],
        value: []
      }
    })
    const amountSvg = getAssetsFile('ic_plan.svg')

    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const result = await Promise.all([cubeTodoTaskStatService.getTodoTaskCount(), cubeTodoTaskStatService.getTodoTaskTags(), cubeTodoTaskStatService.getTodoTaskTagsTrend()])
        statData.todoAmount = result[0]
        statData.todoBusinessList = result[1]
        statData.chartData.xData = result[2].map(item => item.period)
        statData.chartData.value = result[2].map(item => item.total)
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 300)
      }
    }
    onMounted(() => {
      getData()
      document.title = '待办中心'
    })
    const handleTodo = (item: TodoTaskTag): void => {
      router.push({
        path: '/todo-center',
        query: {
          taskType: item.businessType
        },
      })
    }

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='工作中心' />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode='AGENCY_CENTER' routes={routes} />
          <CellGroup inset class={styles['app-group']}>
            <Cell
              title='待办汇总'
            />
            <Cell>
              <div class={styles['todo-stat']}>
                <div class={styles['todo-stat-item']} style='background: #FFF9F5;'>
                  <Skeleton row={1} animated style='width:100%' v-show={loading.value} />
                  <div class={styles['todo-stat-item-title']} v-show={!loading.value}>
                    <div class={styles.icon}>
                      <img src={amountSvg} />
                    </div>
                    <span>待办总数</span>
                  </div>
                  <div style='text-align: center;' v-show={!loading.value}>
                    <div class={styles['todo-stat-item-value']}>{statData.todoAmount}</div>
                  </div>
                </div>
                <div class={styles['item-list']} v-show={statData.todoBusinessList.length}>
                  {statData.todoBusinessList.map(item => {
                    return (
                      <div class={styles['stat-item']} onClick={() => {
                        handleTodo(item)
                      }} key={item.businessType}>
                        <div class={styles['item-label']}>
                          {item.businessTypeName}
                        </div>
                        <div class={styles['item-value']}>
                          {item.total}
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
              <Skeleton row={3} animated v-show={loading.value} />
            </Cell>
          </CellGroup>
          <CellGroup inset class={styles['app-group']}>
            <Cell
              title='待办任务趋势'
            />
            <Cell>

              <div class={styles['todo-trend-chart']}>
                <LineChart xAxisData={statData.chartData.xData} value={statData.chartData.value} />
              </div>
            </Cell>
          </CellGroup>
        </div>
      </>
  }
})
