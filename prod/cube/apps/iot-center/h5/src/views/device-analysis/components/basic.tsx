import { defineComponent } from 'vue'
import styles from './basic.module.less'
import { Cell } from 'vant'
import { getAssetsFile } from '@/utils'
import { Pie } from '../../../components/echart/pie'
import type { AlarmAnalysisLevel } from '@ghcloud/cube-alarm-center-service/src/type'
export const Basic = defineComponent({
  props: {
    basicData: {
      type: Object,
      default: () => {
        return {
          ringRatioAnalysis: {},
          statusList: {},
          levelList: []
        }
      }
    }
  },
  setup (props) {
    const colorsArr = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
    return (): JSX.Element =>
      <div>
        <Cell style={{ paddingBottom: '4px' }}>
          <div class={styles['cell-title']}>基本情况</div>
        </Cell>
        <Cell border={false}>
          <div class={styles.basic}>
            <div class={styles.card}>
              <div><img width='22' src={getAssetsFile('ic_alarm.svg')} alt='' />设备总数</div>
              <div class={styles.num}>{props.basicData.statusList.total ?? 0}<span style='font-size: 14px;margin-left:2px'>个</span></div>
            </div>
            <div class={styles.card}>
              <div><img width='22' src={getAssetsFile('ic_alarm.svg')} alt='' />设备报警</div>
              <div class={styles.num}>{props.basicData.ringRatioAnalysis.alarmNum ?? 0}<span style='font-size: 14px;margin-left:2px'>个</span></div>
              <div class={styles.status}>
                <span>环比</span>
                <img 
                  width='18' 
                  style={{ background: 'rgba(0,0,0,0)' }} 
                  src={props.basicData.ringRatioAnalysis.ringRatio?.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
                />
                <span style={{ fontSize: '12px', color: `${props.basicData.ringRatioAnalysis.ringRatio?.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{props.basicData.ringRatioAnalysis.ringRatio}%</span>
              </div>
            </div>`
            <div />
          </div>
        </Cell>
        <Cell>
          <div class={styles.echart}>
            <div class={styles.pie}>
              <Pie name={props.basicData.ringRatioAnalysis.alarmNum ?? 0} color={colorsArr} data={props.basicData.levelList.map((x: { alarmNum: number; }) => x.alarmNum)} />
            </div>
            <div class={styles.legend}>
              {
                props.basicData.levelList.map((x: AlarmAnalysisLevel, i: number) =>
                  <div class={styles.item} key={x.id}>
                    <div><div style={{ background: `${colorsArr[i]}` }} />{x.name}</div>
                    <div>{x.alarmNum}</div>
                  </div>)
              }
                
            </div>
          </div>

        </Cell>
      </div>
  }
})
