import { defineComponent, type PropType } from 'vue'
import { Grid, GridItem } from 'vant'
import styles from './index.module.less'
import { getAssetsFile } from '@/utils'
interface DataSourceItem {
  title: string;
  imgSrc: string;
  value: number;
  unit: string;
  hideQaQ?: boolean;
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
    dataSource: {
      type: Array as PropType<DataSourceItem[]>,
      default: () => [...gridItemsConfig]
    },
    isQOQ: {
      type: Boolean,
      default: true
    },
  },
  emits: ['clickItem'],
  setup (props, { emit }) {
    const handleClickItem = (item: DataSourceItem): void => {
      emit('clickItem', item)
    }
    return (): JSX.Element =>
      <div class={styles.container}>
        <div class={styles.container_title}>{props.title}</div>
        <Grid column-num={2}>
          {props.dataSource.map((item) => {
            return (
              <GridItem key={item.imgSrc} onClick={() => {
                handleClickItem(item)
              }}>
                <div class={styles.item}>
                  <img src={getAssetsFile(`${item.imgSrc}.png`)} alt='' srcset='' />
                  <div class={styles.title}>{item.title}</div>
                  <div class={styles.value}>
                    <div class={styles.value_num_unit}>
                      <span class={styles.value_num}>{item.unit === '%' ? item.value : item.value}</span>
                      <span class={styles.value_unit}>{item.unit}</span>
                    </div>
                    <div class={styles.label} v-show={props.isQOQ && !item.hideQaQ}>环比</div>
                    {item.hideQaQ}
                    <div class={[styles.qoq, item.qoq > 0 && styles.up]} v-show={props.isQOQ && !item.hideQaQ}>{item.qoq > 0 ? `+${item.qoq.toFixed(0)}` : item.qoq.toFixed(0)}%</div>
                    {!item.hideQaQ && item.qoq > 0 && <img src={getAssetsFile('ratio-up.png')} alt='' srcset='' />}
                    {!item.hideQaQ && item.qoq < 0 && <img class={styles.down} src={getAssetsFile('ratio-down.png')} alt='' srcset='' />}
                  </div>
                </div>
              </GridItem>
            )
          })}
        </Grid>
      </div>
  }
})
