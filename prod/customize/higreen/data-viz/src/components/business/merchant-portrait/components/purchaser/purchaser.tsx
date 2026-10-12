
import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { SubTitle } from '@/components/sub-title/sub-title'
import { SexStat } from '../sex-stat/sex-stat'
import { AgeStat } from '../age-stat/age-stat'
import { TriangleBarCard } from '../triangle-bar-card/triangle-bar-card'
import { StripBarCard } from '../strip-bar-card/strip-bar-card'
import { CircularChart } from '../circular-chart/circular-chart'
import { PieStatList } from '../pie-stat-list/pie-stat-list'
import { SubInTitle } from '../sub-in-title/sub-in-title'
import { initChartStat, type initPieData, merchantDataProvider } from '../../merchant-data-provider'
import type { AgeList } from '@ghcloud/cube-bi-data-management'
import { useApiTimer } from '@/hook/use-utils'
type SexKeyType = keyof ReturnType<typeof merchantDataProvider.getPurchaserGenderState>

// import
export const Purchaser = defineComponent({
  setup: () => {
    const state = reactive<{
      sexStat: {
        name: string;
        key: SexKeyType;
        icon: string;
        value: string;
      }[];
      ageStat: AgeList[];
      regionStat: typeof initChartStat;
      businessTypeData: typeof initChartStat;
      carTypeData: typeof initPieData;
    }>({
      sexStat: [
        {
          name: '男',
          key: 'male',
          icon: '/apps/@ghcloud/higreen-data-viz/images/merchant/male.png',
          value: '75'
        },
        {
          name: '女',
          key: 'female',
          icon: '/apps/@ghcloud/higreen-data-viz/images/merchant/female.png',
          value: '25'
        }
      ],
      ageStat: [],
      regionStat: initChartStat,
      businessTypeData: initChartStat,
      carTypeData: [
        {
          name: '面包车',
          value: 20
        },
        {
          name: '其他车',
          value: 20
        },
        {
          name: '货车',
          value: 60
        }
      ]
    })
    onMounted(async () => {
      await merchantDataProvider.getMerchantData()
      useApiTimer(async () => {
        getSexList()
        getAgeList()
        getRegionStat()
        getBusinessType()
        getBusinessScale()
      })
    })
    const getSexList = (): void => {
      const sexStat = merchantDataProvider.getPurchaserGenderState()
      state.sexStat = state.sexStat.map(item => {
        return {
          ...item,
          value: sexStat[item.key]
        }
      })
    }
    const getAgeList = (): void => {
      const ageStat = merchantDataProvider.getPurchaserAgeStat()
      state.ageStat = ageStat
    }
    const getRegionStat = (): void => {
      const regionStat = merchantDataProvider.getPurchaserRegionStat()
      state.regionStat = regionStat
    }
    const getBusinessType = (): void => {
      const businessTypeData = merchantDataProvider.getPurchaserBusinessType()
      state.businessTypeData = businessTypeData
    }
    const getBusinessScale = (): void => {
      const carTypeData = merchantDataProvider.getPurchaserCarType()
      state.carTypeData = carTypeData
    }
    return (): JSX.Element => (
      <div class={styles.container}>
        <SubTitle title='采购商' />
        <div class={styles.content}>
          <div class={styles['sex-age-stat']}>
            <SexStat dataList={state.sexStat} />
            <AgeStat dataList={state.ageStat} />
          </div>
          <div class={styles['stat-chart']}>
            <div class={styles['bar-chart']}>
              <TriangleBarCard xData={state.regionStat.xData} dataList={state.regionStat.data} title='区域' />
              <StripBarCard xData={state.businessTypeData.xData} dataList={state.businessTypeData.data} title='经营类型' />
            </div>
            <div class={styles['circular-chart']}>
              <SubInTitle title='采购车类型' />
              <div class={styles.chart}>
                <CircularChart dataList={state.carTypeData} />
                <div class={styles['chart-center']}>
                  <img src='/apps/@ghcloud/higreen-data-viz/images/merchant/car-icon.png' />
                </div>
              </div>
              <PieStatList dataList={state.carTypeData} />
            </div>

          </div>
        </div>
      </div>
    )
  }
})
