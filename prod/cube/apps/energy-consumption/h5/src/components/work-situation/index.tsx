import { defineComponent, type PropType } from 'vue'
import { Grid, GridItem } from 'vant'
import styles from './index.module.less'
interface DataSourceItem {
  title: string;
  imgSrc: string;
  value: number;
  unit: string;
  qoq: number;
}
const gridItemsConfig = [
  {
    title: '报警任务响应率',
    imgSrc: 'alarm-task-res-ratio-icon',
    value: 34,
    unit: '次',
    qoq: -12
  },
  {
    title: '隐患处理率',
    imgSrc: 'hidden-danger-hander-icon',
    value: 34,
    unit: '%',
    qoq: 12
  },
  {
    title: '风险源建档率',
    imgSrc: 'risk-icon',
    value: 34,
    unit: '%',
    qoq: 12
  },
  {
    title: '小散工程异常率',
    imgSrc: 'small-abnormal-ratio',
    value: 34,
    unit: '%',
    qoq: 12
  },
  {
    title: '安全巡更频率',
    imgSrc: 'safe-patrol-ratio',
    value: 34,
    unit: '%',
    qoq: 12
  },
  {
    title: '安全巡检频率',
    imgSrc: 'safe-patrol-ratio',
    value: 34,
    unit: '%',
    qoq: 12
  },
  {
    title: '安全预案制度',
    imgSrc: 'safe-plan-icon',
    value: 34,
    unit: '%',
    qoq: 12
  },
  {
    title: '安全教育频率',
    imgSrc: 'safe-edu-ratio',
    value: 34,
    unit: '%',
    qoq: 12
  },
]
/** 安全分析 入口页面 */
export const WorkSituation = defineComponent({
  props: {
    title: {
      type: String,
      default: () => '安全工作情况'
    },
    data: {
      type: Array as PropType<DataSourceItem[]>,
      default: () => [...gridItemsConfig]
    }
  },
  setup (props) {
    return () =>
      <div class={styles.container}>
        <div class={styles.container_title}>{props.title}</div>
        <Grid column-num={2}>
          {props.data.map((item) => {
            return (
              <GridItem key={item.imgSrc}>
                <div class={styles.item}>
                  <img src={`../../assets/images/${item.imgSrc}.png`} alt='' srcset='' />
                  <div class={styles.title}>{item.title}</div>
                  <div class={styles.value}>
                    <div class={styles.value_num_unit}>
                      <span class={styles.value_num}>{item.value}</span>
                      <span class={styles.value_unit}>{item.unit}</span>
                    </div>
                    <div class={styles.label}>环比</div>
                    <div class={[styles.qoq, item.qoq > 0 && styles.up]}>{item.qoq > 0 ? `+${item.qoq}` : item.qoq}%</div>
                    {item.qoq > 0 ? <img src='../../assets/images/ratio-up.png' alt='' srcset='' /> : <img class={styles.down} src='../../assets/images/ratio-down.png' alt='' srcset='' />}

                  </div>
                </div>
              </GridItem>
            )
          })}
        </Grid>
      </div>
  }
})
