

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
import { merchantDataProvider, initChartStat, type initPieData } from '../../merchant-data-provider'
import type { AgeList } from '@ghcloud/cube-bi-data-management'
import { useApiTimer } from '@/hook/use-utils'
type SexKeyType = keyof ReturnType<typeof merchantDataProvider.geWholesalerGenderStat>

export const Wholesaler = defineComponent({
  setup: () => {
    const state = reactive<{
      sexList: {
        name: string;
        key: SexKeyType;
        icon: string;
        value: string;
      }[];
      ageStat: AgeList[];
      naiveStat: typeof initChartStat;
      sourceData: typeof initChartStat;
      businessScale: typeof initPieData;
    }>({
      sexList: [
        {
          name: '男',
          key: 'male',
          icon: '/apps/@ghcloud/higreen-data-viz/images/merchant/male.png',
          value: '0'
        },
        {
          name: '女',
          key: 'female',
          icon: '/apps/@ghcloud/higreen-data-viz/images/merchant/female.png',
          value: '0'
        }
      ],
      ageStat: [],
      naiveStat: initChartStat,
      sourceData: initChartStat,
      businessScale: [
        {
          name: '0-3吨',
          value: 15
        },
        {
          name: '5吨以上',
          value: 70
        },
        {
          name: '3-5吨',
          value: 15
        }
      ]
    })
    onMounted(async () => {
      await merchantDataProvider.getMerchantData()
      useApiTimer(async () => {
        getSexList()
        getAgeList()
        getNativePlaceList()
        getSourceData()
        getBusinessScale()
      })
    })

    const getSexList = (): void => {
      const sexStat = merchantDataProvider.geWholesalerGenderStat()
      state.sexList = state.sexList.map(item => {
        return {
          ...item,
          value: sexStat[item.key]
        }
      })
    }
    const getAgeList = (): void => {
      const ageStat = merchantDataProvider.geWholesalerAgeStat()
      state.ageStat = ageStat
    }
    const getNativePlaceList = (): void => {
      const nativePlaceStat = merchantDataProvider.geWholesalerNativePlaceStat()
      state.naiveStat = nativePlaceStat
    }
    const getSourceData = (): void => {
      const sourceStat = merchantDataProvider.getWholesalerSourceStat()
      state.sourceData = sourceStat
    }
    const getBusinessScale = (): void => {
      const businessScaleStat = merchantDataProvider.getWholesalerBusinessScaleStat()
      state.businessScale = businessScaleStat
    }
    return (): JSX.Element => (
      <div class={styles.container}>
        <SubTitle title='批发商' />
        <div class={styles.content}>
          <div class={styles['sex-age-stat']}>
            <SexStat dataList={state.sexList} />
            <AgeStat dataList={state.ageStat} />
          </div>
          <div class={styles['stat-chart']}>
            <div class={styles['bar-chart']}>
              <TriangleBarCard title='籍贯' xData={state.naiveStat.xData} dataList={state.naiveStat.data} />
              <StripBarCard title='上游来源' xData={state.sourceData.xData} dataList={state.sourceData.data} />
            </div>
            <div class={styles['circular-chart']}>
              <SubInTitle title='经营规模' />
              <div class={styles.chart}>
                <CircularChart dataList={state.businessScale} />
                <div class={styles['chart-center']}>
                  <span>日出货量</span>
                </div>
              </div>
              <PieStatList dataList={state.businessScale} />
            </div>

          </div>
        </div>
      </div>
    )
  }
})
