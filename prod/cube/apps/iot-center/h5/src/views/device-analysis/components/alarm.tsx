import { defineComponent } from 'vue'
import styles from './alarm.module.less'
import { Cell, Empty } from 'vant'
import { Line } from '../../../components/echart/line'
import { Bar } from '../../../components/echart/bar'
export const Alarm = defineComponent({
  props: {
    alarmData: {
      type: Object,
      default: () => {
        return {
          eventAnalysis: {},
          trendAnalysis: {},
          areaAnalysis: {},
        }
      }
    }
  },
  setup (props) {
    return (): JSX.Element =>
      <div>
        <Cell style={{ paddingBottom: '4px' }}>
          <div class={styles['cell-title']}>报警分析</div>
        </Cell>
        <Cell border={false}>
          <div class={styles.content}>
            <div class={styles.head}>
              <span class={styles.blue}>{props.alarmData.trendAnalysis?.topTimeSlot}</span>时间段是事件高发期需要加强管理
            </div>
            <div class={styles.echart}>
              {
                props.alarmData.trendAnalysis.alarmTrendStatisticsVOS?.length > 0
                  ? <Line 
                    data={props.alarmData.trendAnalysis.alarmTrendStatisticsVOS?.map((x: { alarmNum: number; }) => x.alarmNum)}
                    xAxis={props.alarmData.trendAnalysis.alarmTrendStatisticsVOS?.map((x: { period: string; }) => x.period)}
                  />
                  : <Empty />
              }
            </div>
            <div />
          </div>
          <div class={styles.content}>
            <div class={styles.head}>
              <span class={styles.black}>{props.alarmData.eventAnalysis.alarmTopThreeEventNames}</span>事件高发,已发生
              <span class={styles.red}>{props.alarmData.eventAnalysis.alarmTopNum}</span>次
            </div>
            <div class={styles.echart}>
              {
                props.alarmData.eventAnalysis.alarmCurrencyStatisticsVOS?.length > 0
                  ? <Bar 
                    rotate={50}
                    grid={{
                      top: '20px',
                      left: '30px',
                      right: '20px',
                      bottom: '60px'
                    }}
                    data={props.alarmData.eventAnalysis.alarmCurrencyStatisticsVOS?.map((x: { totalNum: number; }) => x.totalNum)}
                    xAxis={props.alarmData.eventAnalysis.alarmCurrencyStatisticsVOS?.map((x: { name: string; }) => x.name)}
                  />
                  : <Empty />
              }
            </div>
            <div />
          </div>
          <div class={styles.content}>
            <div class={styles.head}>
              <span class={styles.black}>{props.alarmData.areaAnalysis.alarmTopThreeAreaNames}</span>报警事件高发,报警事件已发生
              <span class={styles.red}>{props.alarmData.areaAnalysis.alarmTopNum}</span>次
            </div>
            <div class={styles.echart}>
              {
                props.alarmData.areaAnalysis.alarmCurrencyStatisticsVOS?.length > 0
                  ? <Bar 
                    rotate={50}
                    grid={{
                      top: '20px',
                      left: '30px',
                      right: '20px',
                      bottom: '60px'
                    }}
                    data={props.alarmData.areaAnalysis.alarmCurrencyStatisticsVOS?.map((x: { totalNum: number; }) => x.totalNum)}
                    xAxis={props.alarmData.areaAnalysis.alarmCurrencyStatisticsVOS?.map((x: { name: string; }) => x.name)}
                  />
                  : <Empty />
              }
            </div>
            <div />
          </div>
        </Cell>
      </div>
  }
})
