import { Card } from '@/components/card/card'
import { defineComponent, onMounted, ref } from 'vue'
import style from './car-statistics.module.less'
import { StatCard } from './stat-card'
import { SubTitle } from '@/components/sub-title/sub-title'
import { StackBar } from './components/stack-bar'
import { MixLineBar } from './components/mix-line-bar'
import { cubeVehicleStatisticsService } from '@/api/service'
import dayjs from 'dayjs'
import type { VehicleStatTrend } from '@ghcloud/cube-bi-data-management/src/vehicle-statistics.service'
import { useApiTimer } from '@/hook/use-utils'

/** 车辆统计业务卡片 */
export const CarStatistics = defineComponent({
  setup () {
    const dataList = ref([
      {
        name: '昨日总车流',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/car2.png',
        value: 1095,
        sign: 'totalNumber',
        unit: '车次'
      },
      {
        name: '昨日来货车',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/car1.png',
        value: 204,
        sign: 'comeNumber',
        unit: '车次'
      },
      {
        name: '昨日采购车',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/car2.png',
        value: 658,
        sign: 'buyNumber',
        unit: '车次'
      },
      {
        name: '昨日其他',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/car3.png',
        value: 233,
        sign: 'otherNumber',
        unit: '车次'
      },
    ])
    const yData = ref<{ name: string; color: string; value: number[]; }[]>([
      {
        name: '采购车',
        color: '#2989FF',
        value: []
      },
      {
        name: '来货车',
        color: '#2AE8BD',
        value: []
      },
      {
        name: '其他',
        color: '#EEC06D',
        value: []
      }
    ])
    const xData = ref<string[]>([])
    const lineBarData = ref<{
      xData: string[];
      yData: {
        color: string;
        name: string;
        value: number[];
      }[];
    }>({
      yData: [
        {
          color: '#2989FF',
          name: '总车流',
          value: []
        },
        {
          color: '#2989FF',
          name: '来货车',
          value: []
        },
        {
          color: '#2AE8BD',
          name: '采购车',
          value: []
        },
        {
          color: '#EEC06D',
          name: '其他',
          value: []
        }
      ],
      xData: []
    })
    const cardSlots = {
      'card-stat': (): JSX.Element => {
        return <StatCard dataList={dataList.value} />
      },
      'card-charts': (): JSX.Element => {
        return (
          <>
            <SubTitle title='近一周来货&采购车辆趋势图' />
            <div class={style['stack-bar-box']}>
              <StackBar yData={yData.value} xData={xData.value} />
            </div>
            <SubTitle title='近一天进场车流分布图' />
            <div class={style['stack-bar-box']}>
              <MixLineBar xData={lineBarData.value.xData} yData={lineBarData.value.yData} />
            </div>
          </>
        )
      },
    }
    // 车辆统计
    const getVehicleStatTotal = async (): Promise<void> => {
      const startOfYesterday = dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const endOfYesterday = dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      try {
        const res = await cubeVehicleStatisticsService.vehicleStatTotal({ period: `${startOfYesterday},${endOfYesterday}` })
        res.totalNumber = res.comeNumber + res.buyNumber + res.otherNumber
        dataList.value.forEach(item => {
          item.value = res[item.sign]
        })
      } catch (error) {
      }
    }
    const getVehicleStatTrend = async (): Promise<void> => {
      const sevenDaysAgo = dayjs().subtract(8, 'day').format('YYYY-MM-DD')
      const today = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      // 来货车
      let comeTheTruck = await cubeVehicleStatisticsService.vehicleStatTrend({ period: `${sevenDaysAgo},${today}`, vehicleNature: 'COM_VEHICLE' })
      // 采购车
      let purchaseCar = await cubeVehicleStatisticsService.vehicleStatTrend({ period: `${sevenDaysAgo},${today}`, vehicleNature: 'BUY_VEHICLE' })
      // 其他车
      let otherCars = await cubeVehicleStatisticsService.vehicleStatTrend({ period: `${sevenDaysAgo},${today}`, vehicleNature: 'OTHER_VEHICLE' })
      comeTheTruck = processingTrendData(comeTheTruck)
      purchaseCar = processingTrendData(purchaseCar)
      otherCars = processingTrendData(otherCars)
      xData.value = comeTheTruck.map(item => item.trendX)
      yData.value[0].value = purchaseCar.map(item => item.trendY)
      yData.value[1].value = comeTheTruck.map(item => item.trendY)
      yData.value[2].value = otherCars.map(item => item.trendY)
    }
    const getVehicleStatDayTrend = async (): Promise<void> => {
      const today = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      let allCars = await cubeVehicleStatisticsService.vehicleStatDayTrend({ vehicleNature: 'ALL_VEHICLE', day: today })
      let comeTheTruck = await cubeVehicleStatisticsService.vehicleStatDayTrend({ vehicleNature: 'COM_VEHICLE', day: today })
      let purchaseCar = await cubeVehicleStatisticsService.vehicleStatDayTrend({ vehicleNature: 'BUY_VEHICLE', day: today })
      let otherCars = await cubeVehicleStatisticsService.vehicleStatDayTrend({ vehicleNature: 'OTHER_VEHICLE', day: today })
      allCars = processingStatDayTrendData(allCars)
      comeTheTruck = processingStatDayTrendData(comeTheTruck)
      purchaseCar = processingStatDayTrendData(purchaseCar)
      otherCars = processingStatDayTrendData(otherCars)

      lineBarData.value.xData = allCars.map(item => String(item.trendX).padStart(2, '0'))
      lineBarData.value.yData[0].value = allCars.map(item => item.trendY)
      lineBarData.value.yData[1].value = comeTheTruck.map(item => item.trendY)
      lineBarData.value.yData[2].value = purchaseCar.map(item => item.trendY)
      lineBarData.value.yData[3].value = otherCars.map(item => item.trendY)
    }
    // 处理一周数据补时间
    const processingTrendData = (data: VehicleStatTrend[]): VehicleStatTrend[] => {
      const sevenDaysAgo = dayjs().subtract(8, 'day').format('MM.DD')
      const initData = [1, 2, 3, 4, 5, 6, 7].map(item => {
        return {
          trendX: dayjs(sevenDaysAgo).add(item, 'day').format('MM.DD'),
          trendY: '0'
        }
      })
      const mergedData = initData.map(bItem => {
        const aItem = data.find(aItem => dayjs(aItem.trendX).format('MM.DD') === bItem.trendX)
        return {
          trendX: bItem.trendX,
          trendY: Number(aItem ? aItem.trendY : bItem.trendY)
        }
      })
      return mergedData
    }
    // 处理近一天进场车流数据
    const processingStatDayTrendData = (data: VehicleStatTrend[]): VehicleStatTrend[] => {
      const initData = ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map(item => {
        return {
          trendX: item,
          trendY: 0
        }
      })
      const mergedData = initData.map(bItem => {
        const aItem = data.find(aItem => aItem.trendX === bItem.trendX)
        return {
          trendX: bItem.trendX,
          trendY: Number(aItem ? aItem.trendY : bItem.trendY)
        }
      })
      return mergedData
    }
    onMounted(() => {
      useApiTimer(async () => {
        getVehicleStatTotal()
        getVehicleStatTrend()
        getVehicleStatDayTrend()
      })
    })
    return (): JSX.Element => (
      <Card title='车辆统计' v-slots={cardSlots} titleIcon='/apps/@ghcloud/higreen-data-viz/icons/card-title/car.webp' class={style['car-statistics']} />
    )
  }
})
