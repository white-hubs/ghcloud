import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import { Grid, GridItem } from 'vant'
import { getAssetsFile } from '@/utils'
interface DataSourceItem {
  title: string; // 标题
  value: number; // 报警数
  ratio: number;// 环比
  hideRatio?: boolean; // 是否显示环比
}
export const UseGasSafetyStat = defineComponent({
  props: {
    dataSoruce: {
      type: Array as PropType<DataSourceItem[]>,
      default: () => [
        { title: '电气报警数', value: 0, ratio: 0 },
        { title: '未处理报警数', value: 0, ratio: 0 },
        { title: '已处理报警数', value: 0, ratio: 0 },
        { title: '易燃设备报警数', value: 0, ratio: 0 },
      ]
    }
  },
  emits: ['clickItem'],
  setup: (props, { emit }) => {
    const handleClickItem = (item: DataSourceItem): void => {
      emit('clickItem', item)
    }
    return (): JSX.Element => (
      <div class={styles.container}>
        <Grid column-num={2}>
          {props.dataSoruce.map((item, index) => {
            return (
              <GridItem key={index} onClick={() => {
                handleClickItem(item)
              }}>
                <div class={styles.item}>
                  <div class={styles.title}>{item.title}</div>
                  <div class={styles.count}>{item.value}</div>
                  <div class={styles.ratio} style={{ visibility: item.hideRatio ? 'hidden' : 'visible' }}>
                    环比 <span class={[styles.ratio_num, item.ratio > 0 && styles.ratio_up]}>{item.ratio > 0 ? `+${item.ratio.toFixed(2)}` : item.ratio}%</span>
                    {
                      item.ratio > 0 && <img src={getAssetsFile('ratio-up.png')} alt='' />
                    }
                    {
                      item.ratio < 0 && <img src={getAssetsFile('ratio-down.png')} class={styles.img_down} alt='' />
                    }
                  </div>
                </div>
              </GridItem>

            )
          })}
        </Grid>
      </div>
    )
  }
})
