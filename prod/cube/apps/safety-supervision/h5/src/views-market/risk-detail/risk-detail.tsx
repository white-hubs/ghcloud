import { defineComponent, onMounted, ref } from 'vue'
import styles from './risk-detail.module.less'
import { AlarmLevel, FilingPropertyCategory, type RiskIndexDetailVO } from '@ghcloud/cube-safety-supervision-service/src/types'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { PullRefresh, Skeleton } from 'vant'
import dayjs from 'dayjs'

/** 风险指数 明细得分 */
export const RiskDetail = defineComponent({
  setup () {
    document.title = '风险指数'
    const initData = {
      riskIndex: 0,
      alarmSituationRiskIndex: {
        alarmLevelIndexDetails: [
          {
            alarmLevel: AlarmLevel.ONE_LEVEL,
            riskIndex: 0,
            totalNum: 0
          },
          {
            alarmLevel: AlarmLevel.TWO_LEVEL,
            riskIndex: 0,
            totalNum: 0
          },
          {
            alarmLevel: AlarmLevel.THREE_LEVEL_AND_FOUR_LEVEL,
            riskIndex: 0,
            totalNum: 0
          },
        ],
        riskIndex: 0
      },
      alarmUnConfirmedRiskIndex: {
        alarmLevelIndexDetails: [
          {
            alarmLevel: AlarmLevel.ONE_LEVEL,
            riskIndex: 0,
            totalNum: 0
          },
          {
            alarmLevel: AlarmLevel.TWO_LEVEL,
            riskIndex: 0,
            totalNum: 0
          },
          {
            alarmLevel: AlarmLevel.THREE_LEVEL_AND_FOUR_LEVEL,
            riskIndex: 0,
            totalNum: 0
          },
        ],
        riskIndex: 0
      },
      hiddenDangerRiskIndex: {
        riskIndex: 0,
        totalNum: 0
      },
      hiddenDangerUnConfirmedRiskIndex: {
        riskIndex: 0,
        totalNum: 0
      },
      propertyFilingRiskIndex: {
        propertyCategoryDetails: [
          {
            propertyCategory: FilingPropertyCategory.FIRE_FIGHTING_EQUIPMENT,
            riskIndex: 0
          },
          {
            propertyCategory: FilingPropertyCategory.FLAMMABLE_EQUIPMENT,
            riskIndex: 0
          },
          {
            propertyCategory: FilingPropertyCategory.ELECTRIC_VEHICLE,
            riskIndex: 0
          },
        ],
        riskIndex: 0
      }
    }
    const dataInfo = ref<RiskIndexDetailVO>({ ...initData })
    const riskScore = ref(0)
    const riskState = ref<string[]>(['高风险', 'high'])
    const loading = ref(false)

    const getRiskIndexDetail = async (): Promise<void> => {
      try {
        // 获取上一周的时间范围
        const lastWeekStartDate = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD HH:mm:ss')
        const lastWeekEndDate = dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD HH:mm:ss')
        const params = {
          period: [lastWeekStartDate, lastWeekEndDate].join(','),
        }
        loading.value = true
        const data = await cubeAlarmSafetyAnalysisService.getRiskIndexDetail(params)
        dataInfo.value = Object.assign(dataInfo.value, data)
        if (!dataInfo.value.propertyFilingRiskIndex) {
          dataInfo.value.propertyFilingRiskIndex = initData.propertyFilingRiskIndex
        }
        riskScore.value = dataInfo.value?.riskIndex !== null ? 100 - Number(dataInfo.value?.riskIndex) : 0
        convertScore()
      } catch {
      } finally {
        loading.value = false
      }
    }
    const convertScore = (): void => {
      const score: number = riskScore.value
      if (score >= 0 && score <= 60) {
        riskState.value = ['高风险', 'high']
      } else if (score > 60 && score <= 80) {
        riskState.value = ['中等风险', 'middle']
      } else if (score > 80 && score <= 100) {
        riskState.value = ['运行良好', 'low']
      } else {
        riskState.value = ['未知', 'unknown']
      }
    }
    onMounted(() => {
      getRiskIndexDetail()
    })
    const onRefresh = (): void => {
      getRiskIndexDetail()
    }

    return (): JSX.Element =>
      <div class={styles.container} style={{ background: loading.value ? '#fff' : '#F3F7FA' }}>
        <Skeleton title row={20} loading={loading.value} title-width='50%' row-width='70%' />
        <PullRefresh v-model={loading.value} onRefresh={onRefresh} success-text='刷新成功'>
          {
            !loading.value &&
              <div class={styles.wrap}>
                <div class={styles.content}>
                  <div class={styles.title} style={{ marginBottom: '10px' }}>【风险指数说明】</div>
                  <div class={[styles.score, styles[riskState.value[1]]]}>
                    <span class={styles.label}>{riskState.value[0]}</span>
                    <div class={styles.value}>
                      {riskScore.value}
                      <span class={styles.unit}>分</span>
                    </div>
                  </div>
                  <div class={styles.item}>
                    <div class={styles.row}>
                      该项在所选时段内总计得分
                      <span class={styles.value}>{dataInfo.value?.alarmSituationRiskIndex?.riskIndex || 0}</span>
                    </div>
                    {
                      dataInfo.value?.alarmSituationRiskIndex?.alarmLevelIndexDetails.map((item) => {
                        return (
                          <div class={styles.row} key={item.riskIndex}>
                            {item.alarmLevel === AlarmLevel.ONE_LEVEL ? '一级报警' : item.alarmLevel === AlarmLevel.TWO_LEVEL ? '二级报警' : '三级四级报警'}：本周报警数为
                            <span class={styles.value}>{item.totalNum}</span>
                          </div>
                        )
                      })
                    }
                  </div>

                  <div class={styles.title}>【报警响应数据】</div>
                  <div class={styles.item}>
                    <div class={styles.row}>
                      该项在所选时段内总计得分
                      <span class={styles.value}>{dataInfo.value?.alarmUnConfirmedRiskIndex?.riskIndex || 0}</span>
                    </div>
                    {
                      dataInfo.value?.alarmUnConfirmedRiskIndex?.alarmLevelIndexDetails.map((item) => {
                        return (
                          <div class={styles.row} key={item.riskIndex}>
                            {item.alarmLevel === AlarmLevel.ONE_LEVEL ? '一级报警' : item.alarmLevel === AlarmLevel.TWO_LEVEL ? '二级报警' : '三级四级报警'}：本周未响应报警数为
                            <span class={styles.value}>{item.totalNum}</span>
                          </div>
                        )
                      })
                    }
                  </div>

                  <div class={styles.title}>【风险隐患数据】</div>
                  <div class={styles.item}>
                    <div class={styles.row}>
                      本周隐患数为
                      <span class={styles.value}>{dataInfo.value?.hiddenDangerRiskIndex?.totalNum || 0}</span>
                    </div>
                    <div class={styles.row}>
                      该项在所选时段内总计得分
                      <span class={styles.value}>{dataInfo.value?.hiddenDangerRiskIndex?.riskIndex || 0}</span>
                    </div>
                  </div>

                  <div class={styles.title}>【隐患响应数据】</div>
                  <div class={styles.item}>
                    <div class={styles.row}>
                      本周未响应隐患数为
                      <span class={styles.value}>{dataInfo.value?.hiddenDangerUnConfirmedRiskIndex?.totalNum || 0}</span>
                    </div>
                    <div class={styles.row}>
                      该项总计得分
                      <span class={styles.value}>{dataInfo.value?.hiddenDangerUnConfirmedRiskIndex?.riskIndex || 0}</span>
                    </div>
                  </div>

                  <div class={styles.title}>【风险源建档数据】</div>
                  <div class={styles.item}>
                    {
                      dataInfo.value?.propertyFilingRiskIndex?.propertyCategoryDetails.map((item) => {
                        return (
                          <div class={styles.row} key={item.riskIndex}>
                            {item.propertyCategory === FilingPropertyCategory.FIRE_FIGHTING_EQUIPMENT
                              ? '消防设备'
                              : item.propertyCategory === FilingPropertyCategory.FLAMMABLE_EQUIPMENT ? '易燃设备' : '电动车设备'}
                            未建档，该项总计得分
                            <span class={styles.value}>{item.riskIndex}</span>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
          }
        </PullRefresh>
      </div>
  }
})
