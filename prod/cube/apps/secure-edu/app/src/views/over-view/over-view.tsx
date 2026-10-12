

import { Chunk } from '@/components/layout/chunk'
import { Button, DateRangePicker, Empty } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { Pie } from '@/components/echart/pie'
import { cultivatestat, examattendance, examstat, examtheme, examtyperatio, targetstat, taskthemestat, trainUserstat, trendexam, trendstat, userSignstat } from '@/api/statistics'
import dayjs from 'dayjs'
import { Bar } from '@/components/echart/bar'
import styles from './over-view.module.less'
import { VerticalLine } from '@/components/vertical-line/vertical-line'

export const OverView = defineComponent({
  setup: () => {
    const buttons: { title: string;value: string; }[] = [{
      title: '今日',
      value: '1'
    },
    {
      title: '本周',
      value: '2'
    },
    {
      title: '本月',
      value: '3'
    },
    {
      title: '今年',
      value: '4'
    }]
    const taskData = ref([
      {
        title: '培训任务数',
        num: 0,
        compare: 0
      },
      {
        title: '考试任务数',
        num: 0,
        compare: 0
      },
      {
        title: '培训缺勤人次',
        num: 0,
        compare: null
      },
      {
        title: '考试不及格人次',
        num: 0,
        compare: null
      },
      {
        title: '缺考人次',
        num: 0,
        compare: null
      }
    ])
    const examRef = ref()
    const targetRef = ref()
    const datePickerValue = ref([dayjs().subtract(1, 'day').format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')])
    const chunkSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class='flex w-100%'>
            <div class='h-400px w-50% flex' style='align-items:center;justify-content:center'>
              {
                examPie.value.length
                  ? <Pie
                    ref={examRef}
                    legend={{
                      type: 'scroll',
                      orient: 'vertical',
                      right: '10%',
                      top: '30%'
                    }}
                    center={['40%', '50%']}
                    data={examPie.value}
                  />
                  : <Empty description='暂无考试任务数据' />
              }
            </div>
            <div class='h-400px w-50% flex' style='align-items:center;justify-content:center'>
              {
                targetPie.value.length
                  ? <Pie
                    ref={targetRef}
                    legend={{
                      type: 'scroll',
                      orient: 'vertical',
                      right: '10%',
                      top: '30%'
                    }}
                    center={['40%', '50%']}
                    data={targetPie.value}
                  />
                  : <Empty description='暂无培训任务数据' />
              }
            </div>
          </div>

        )
      }
    }
    const themeRef = ref()
    const themeData = ref([])
    const currentTheme = ref<string>('exam')
    const themeChunkSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button onClick={() => {
                examthemehandle()
              }} class='mr-10px' type={currentTheme.value === 'exam' ? 'primary' : 'default'}>考试</Button>
              <Button onClick={() => {
                traintheme()
              }} type={currentTheme.value === 'training' ? 'primary' : 'default'}>培训</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class='h-400px w-100% flex' style='align-items:center;justify-content:center'>
            {
              themeData.value.length
                ? <Pie
                  ref={themeRef}
                  legend={{
                    type: 'scroll',
                    orient: 'vertical',
                    right: '10%',
                    top: '30%'
                  }}
                  center={['40%', '50%']}
                  data={themeData.value}
                />
                : <Empty description='暂无数据' />
            }

          </div>
        )
      }
    }
    const currentduty = ref<string>('exam')
    const dutyBar = ref()
    const dutyYData = ref<echarts.SeriesOption[]>([])
    const dutyXData = ref([])
    const dutyData = ref<string[]>([])
    const dutyChunkSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button onClick={() => {
                examDuty()
              }} class='mr-10px' type={currentduty.value === 'exam' ? 'primary' : 'default'}>考试</Button>
              <Button onClick={() => {
                trainDuty()
              }} type={currentduty.value === 'training' ? 'primary' : 'default'}>培训</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class='h-400px flex' style='align-items:center;justify-content:center'>
            {
              dutyXData.value.length
                ? <Bar
                  ref={dutyBar}
                  legend={{
                    data: dutyData.value
                  }}
                  xAxis={{
                    type: 'category',
                    axisTick: {
                      alignWithLabel: true
                    },
                    data: dutyXData.value
                  }}
                  ydata={dutyYData.value}
                />
                : <Empty description='暂无数据' />
            }
          </div>
        )
      }
    }
    const specialBar = ref()
    const specialData = ref<string[]>(['培训专题数', '考试专题数'])
    const specialXData = ref([])
    const specialYData = ref<echarts.SeriesOption[]>([])
    const specialChunkSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class='h-400px flex' style='align-items:center;justify-content:center'>
            {
              specialXData.value.length
                ? <Bar
                  ref={specialBar}
                  legend={{
                    data: specialData.value
                  }}
                  xAxis={{
                    type: 'category',
                    axisTick: {
                      alignWithLabel: true
                    },
                    data: specialXData.value
                  }}
                  ydata={specialYData.value}
                />
                : <Empty description='暂无数据' />
            }
          </div>
        )
      }
    }
    const changepick = (data: string): void => {
      period.value = `${data[0]},${data[1]}`
      getData()
    }

    const currentButton = ref<string>('1')
    const currentDate = (value: string): void => {
      currentButton.value = value
      switch (value) {
        case '1':
          period.value = `${dayjs().format('YYYY-MM-DD 00:00:00') ?? ''},${dayjs().format('YYYY-MM-DD 23:59:59') ?? ''}`
          datePickerValue.value = [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')]
          getData()
          break
        case '2' :
          period.value = `${dayjs().startOf('week').format('YYYY-MM-DD HH:mm:ss')},${dayjs().endOf('week').format('YYYY-MM-DD HH:mm:ss')}`
          datePickerValue.value = [dayjs().startOf('week').format('YYYY-MM-DD HH:mm:ss'), dayjs().endOf('week').format('YYYY-MM-DD HH:mm:ss')]

          getData()
          break
        case '3' :
          period.value = `${dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss')},${dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss')}`
          datePickerValue.value = [dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss'), dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss')]

          getData()
          break
        case '4' :
          period.value = `${dayjs().startOf('years').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD 23:59:59')}`
          datePickerValue.value = [dayjs().startOf('years').format('YYYY-MM-DD HH:mm:ss'), dayjs().format('YYYY-MM-DD 23:59:59')]
          getData()
          break
      }
    }

    const period = ref<string>(`${dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)
    const examPie = ref([])
    const targetPie = ref([])
    const getData = (): void => {
      cultivatestat({
        period: period.value
      }).then(res => {
        const { data } = res
        taskData.value[0].num = data.cultivateNum
        taskData.value[0].compare = data.qoq
      })
      trainUserstat({
        period: period.value
      }).then(res => {
        const { data } = res
        taskData.value[2].num = data.unsignedNum
      })
      examstat({
        period: period.value
      }).then(res => {
        const { data } = res
        taskData.value[1].num = data.totalNum
        taskData.value[1].compare = data.chainRatio
        taskData.value[3].num = data.noPassedUserNumber
        taskData.value[4].num = data.missExamUserNumber
      })

      examtyperatio({
        period: period.value
      }).then(res => {
        const { data } = res

        examPie.value = data?.map((res: {
          totalNum: number;
          name: string;
        }) => {
          return {
            value: res.totalNum,
            name: res.name
          }
        }) as never[]
        examRef.value.render()
      })
      targetstat({
        period: period.value
      }).then(res => {
        const { data } = res
        targetPie.value = data?.map((res: {
          name: string;
          num: number;
        }) => {
          return {
            value: res.num,
            name: res.name
          }
        }) as never[]
        targetRef.value.render()
      })
      if (currentduty.value === 'exam') {
        examDuty()
      } else {
        trainDuty()
      }
      if (currentTheme.value === 'exam') {
        examthemehandle()
      } else {
        traintheme()
      }
      getTrend()
    }
    const year = `${dayjs().startOf('years').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
    const getTrend = async (): Promise<void> => {
      const { data: stat } = await trendstat({
        period: year
      })
      const { data: exam } = await trendexam({
        period: year
      })
      specialXData.value = stat.map((res: { name: string; }) => res.name) as never[]
      specialYData.value = []
      const statData: echarts.SeriesOption = {
        name: '培训专题数',
        type: 'line',
        data: stat.map((res: { num: number; }) => res.num)
      }
      const examData: echarts.SeriesOption = {
        name: '考试专题数',
        type: 'line',
        data: exam.map((res: { num: number; }) => res.num)
      }
      specialYData.value.push(statData)
      specialYData.value.push(examData)
      specialBar.value.render()
    }
    const traintheme = (): void => {
      currentTheme.value = 'training'
      taskthemestat({
        period: period.value
      }).then((res) => {
        const { data } = res
        themeData.value = data?.map((res: {
          name: string;
          num: number;
        }) => {
          return {
            value: res.num,
            name: res.name
          }
        }) as never[]
        themeRef.value.render()
      })
    }
    const examthemehandle = (): void => {
      currentTheme.value = 'exam'
      examtheme({
        period: period.value
      }).then(res => {
        const { data } = res
        themeData.value = data?.map((res: { totalNum: number;
          name: string; }) => {
          return {
            value: res.totalNum,
            name: res.name
          }
        }) as never[]
        themeRef.value.render()
      })
    }

    const examDuty = (): void => {
      currentduty.value = 'exam'
      examattendance({
        period: period.value
      }).then(res => {
        const { data } = res
        dutyData.value = ['参加考试人数', '不及格人数', '缺考人数']
        dutyXData.value = data?.map((res: {
          name: string;
        }) => {
          return res.name
        }) as never[]
        dutyYData.value = []
        const examnum: echarts.SeriesOption = {
          name: '参加考试人数',
          barWidth: '20%',
          data: data.map((res: { examUserNumber: number; }) => {
            return res.examUserNumber
          }),
          type: 'bar'
        }
        const noPassedUserNumber: echarts.SeriesOption = {
          name: '不及格人数',
          barWidth: '20%',
          data: data.map((res: { noPassedUserNumber: number; }) => {
            return res.noPassedUserNumber
          }),
          type: 'bar'
        }
        const missExamUserNumber: echarts.SeriesOption = {
          name: '缺考人数',
          barWidth: '20%',
          data: data.map((res: { missExamUserNumber: number; }) => {
            return res.missExamUserNumber
          }),
          type: 'bar'
        }
        dutyYData.value.push(examnum)
        dutyYData.value.push(noPassedUserNumber)
        dutyYData.value.push(missExamUserNumber)
        dutyBar.value.render()
      })
    }
    const trainDuty = (): void => {
      currentduty.value = 'training'
      userSignstat({
        period: period.value
      }).then(res => {
        const { data } = res
        dutyData.value = ['参加培训人数', '缺勤人数', '迟到人数']
        dutyXData.value = data?.map((res: { name: string; }) => {
          return res.name
        }) as never[]
        dutyYData.value = []
        const trainNum: echarts.SeriesOption = {
          name: '参加培训人数',
          barWidth: '20%',
          data: data.map((res: { trainNum: number; }) => {
            return res.trainNum
          }),
          type: 'bar'
        }
        const unsignedNum: echarts.SeriesOption = {
          name: '缺勤人数',
          barWidth: '20%',
          data: data.map((res: { unsignedNum: number; }) => {
            return res.unsignedNum
          }),
          type: 'bar'
        }
        const belatedNum: echarts.SeriesOption = {
          name: '迟到人数',
          barWidth: '20%',
          data: data.map((res: { belatedNum: number; }) => {
            return res.belatedNum
          }),
          type: 'bar'
        }
        dutyYData.value.push(trainNum)
        dutyYData.value.push(unsignedNum)
        dutyYData.value.push(belatedNum)
        dutyBar.value.render()
      })
    }
    onMounted(() => {
      currentDate('1')
      getData()
    })
    return (): JSX.Element =>
      <>
        <div class={styles['layout-container']}>
          <div class={styles['layout-header']}>
            <VerticalLine title='数据总览' />
            <div class='w-40% flex'>
              {buttons.map((res, index) => {
                return (
                  <div key={index}>
                    <Button type={currentButton.value === res.value ? 'primary' : 'default'} class='mr-10px' onClick={() => {
                      currentDate(res.value)
                    }}>{res.title}</Button>
                  </div>
                )
              })}

              <DateRangePicker showTime v-model:value={datePickerValue.value} valueFormat='YYYY-MM-DD HH:mm:ss' onChangePicker={changepick} />
            </div>
          </div>
          <div class={styles['layout-content']}>
            <div class='bg-#f3f3f3'>
              <div class='flex justify-between ml--10px mt-10px'>
                {taskData.value.map((res, index) => {
                  return (
                    <div key={index} class='w-20% bg-#fff ml-10px p-10px '>
                      <div class='color-#aaa'>{res.title}</div>
                      <div class='font-900  text-25px'>{res.num}</div>
                      {res.compare === null ? '' : <div>环比 {res.compare}%</div>}
                    </div>
                  )
                })}
              </div>

              <div class='flex h-460px mt-15px'>
                <div class='w-50%'>
                  <Chunk title='考试/培训类型占比' v-slots={chunkSlots} />
                </div>
                <div class='w-50% ml-10px'>
                  <Chunk title='培训/考试主题占比' v-slots={themeChunkSlots} />
                </div>
              </div>
              <div class='h-460px'>
                <div class='w-100%'>
                  <Chunk title={currentduty.value === 'exam' ? '考试出勤情况统计' : '培训出勤情况统计'} v-slots={dutyChunkSlots} />
                </div>
              </div>
              <div class='h-460px'>
                <div class='w-100%'>
                  <Chunk title='考试/培训专题数趋势' v-slots={specialChunkSlots} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  }
})
