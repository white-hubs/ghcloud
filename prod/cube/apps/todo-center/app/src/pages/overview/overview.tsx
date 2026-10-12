import { Layout } from '@/components/layout/layout'
import { Slot } from '@/components/slot/slot'
import { Card, Col, Empty, Flex, Row } from 'antd'
import { useEffect, useState } from 'react'
import style from './overview.module.less'
import { cubeTodoTaskStatService } from '@/api/server'
import type { TodoTaskTag, TodoTaskTrend } from '@ghcloud/cube-todo-center-service'
const todoIcon = '/resource/v1/todo-center/todo-icon.svg'
import * as echarts from 'echarts'
import { usePageName } from '@ghcloud/cube-utils'
/** 待办总览 */
export const Overview = (): JSX.Element => {
  const { pageTitle } = usePageName()
  const [loading, setLoading] = useState(true)
  const [todoTask, setTodoTask] = useState<TodoTaskTag[]>([])
  const [toDoNum, setToDoNum] = useState(0)
  let chart: echarts.ECharts | null = null
  const echartsResize = (): void => {
    if (chart) {
      chart.resize()
    }
  }
  const initEchart = (trendData: TodoTaskTrend[]): void => {
    if (!chart) {
      chart = echarts.init(document.getElementById('todo-task-trend') as unknown as HTMLElement)
    }
    const dataObj = {
      series: {
        name: '任务数量',
        type: 'line',
        stack: 'Total',
        data: trendData.map(item => {
          if (item.total === 0 || item.total || item.total === null) {
            return item.total ? item.total.toString() : '0'
          }
          return item
        }),
        smooth: true
      },
      xAxisData: trendData.map(item => item.period),
    }
    const options = {
      title: [],
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [],
      },
      grid: {
        left: '20px',
        right: '40px',
        bottom: '10px',
        top: '40px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dataObj?.xAxisData ? dataObj.xAxisData : [],
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: dataObj?.series
        ? dataObj?.series
        : [],
    }
    chart.setOption(options)
    window.addEventListener('resize', echartsResize)
  }
  const getOverviewData = async (): Promise<void> => {
    setLoading(true)
    cubeTodoTaskStatService.getTodoTaskCount().then(res => {
      setToDoNum(res)
    })
    cubeTodoTaskStatService.getTodoTaskTags().then(res => {
      setTodoTask(res)
    })
    cubeTodoTaskStatService.getTodoTaskTagsTrend().then(res => {
      initEchart(res)
    })
    setTimeout(() => {
      setLoading(false)
    }, 800)
  }
  let timer: string | number | NodeJS.Timeout | null | undefined = null
  useEffect(() => {
    // 在组件渲染完成后执行的副作用操作
    getOverviewData()
    timer = setInterval(() => {
      getOverviewData()
    }, 30000)

    return (): void => {
      window.removeEventListener('resize', echartsResize)
      timer && clearInterval(timer)
    }
  }, [])

  return (
    <Layout title={pageTitle ?? '待办总览'} loading={loading}>
      <Slot slotName='content'>
        <Row>
          <Col span={8}>
            <Card title='待办统计' style={{ marginTop: '10px', height: 'calc(100% - 10px)' }} styles={{ body: { height: '150px' } }}>
              <Flex vertical={false} justify='space-around' style={{ width: '100%' }}>
                <div className={style['todo-task-count-left']}>
                  <img src={todoIcon} style={{ width: '4em' }} />
                  <span>待办任务</span>
                </div>
                <div className={style['todo-task-count-right']}>
                  <span style={{ fontSize: '2em', fontWeight: 'bold' }}>{toDoNum}</span>
                  <span style={{ marginTop: '0.5em', marginLeft: '0.5em' }}>个</span>
                </div>
              </Flex>
            </Card>
          </Col>
          <Col span={16}>
            <Card title='待办任务' style={{ marginTop: '10px', marginLeft: '10px', width: 'calc(100% - 10px)', display: 'inline-block' }} styles={{ body: { minHeight: '150px', display: 'flex', alignItems: 'center' } }}>
              <Flex vertical={false} justify='space-around' style={{ width: '100%', flexWrap: 'wrap', justifyContent: todoTask.length > 5 ? 'flex-start' : 'space-around' }}>
                {todoTask.map(item => {
                  return (
                    <div className={style['todo-task-item']} key={item.businessType}>
                      <span style={{ fontWeight: 'bold' }}>{item.total}</span>
                      <span>{item.businessTypeName}</span>
                    </div>
                  )
                })}
                {todoTask.length === 0 && <Empty description='暂无待办任务' />}
              </Flex>
            </Card>
          </Col>
        </Row>
        <Card title='任务趋势' style={{ marginTop: '10px' }} styles={{ body: { height: '330px', paddingTop: 0, maxHeight: 'calc(100vh - 410px)' } }}>
          <div id='todo-task-trend' style={{ width: '100%', height: '100%' }} />
        </Card>
      </Slot>
    </Layout>
  )
}
