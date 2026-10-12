import { defineComponent, type PropType, type VNode } from 'vue'
import { getAssetsImge } from '@/utils/get-image'
import styles from './style/lighting-round.module.less'
import CountTo from './count-to/count-to.tsx'
import MonitorList from './monitor-list.tsx'
interface Item {
  name: string;
  color: string;
  value: number;
}
interface List {
  statistic: {
    title?: string;
    total?: number | string;
    icon?: string;
  };
  legendList?: Item[];
}
export default defineComponent({
  name: 'Lighting-round',
  props: {
    data: {
      type: Array as PropType<List[]>
    }
  },
  setup: (props, { slots }) => {
    const countDom = (item: List): VNode =>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {
        typeof item.statistic.total === 'number'
          ? <CountTo startVal={0} endVal={item.statistic.total} duration='2000' separator='' />
          : <span>{item.statistic.total}</span>
      }
        <span class={styles.value}>{item.statistic.title}</span>
      </div>
    const infoDom = (): VNode[] | undefined => {
      return props.data?.map((item, index) => {
        return (
          <div key={index}>
            <div class={styles.item}>
              <img class={`${styles.roate} ${styles.r1}`} src={getAssetsImge('chart/charts/round.png')} alt='' />
              <img class={`${styles.roate} ${styles.rotate}`} src={getAssetsImge('chart/charts/round1.png')} alt='' />
              <img class={`${styles.roate} ${styles.r3} ${styles.rotate}`} src={getAssetsImge('chart/charts/round1.png')} alt='' />
              <img class={`${styles.roate} ${styles.r2} ${styles.rotate}`} src={getAssetsImge('chart/charts/round2.png')} alt='' />
              {item.statistic.icon ? <img class={`${styles.icon} ${styles['aniamtion-pulse']}`} src={getAssetsImge(`chart/charts/${item.statistic.icon}`)} alt='' /> : countDom(item)}
              {slots.default?.()}
            </div>
            {item.legendList ? <MonitorList monitorData={item.legendList} /> : null}
          </div>
        )
      })
    }
    return () => <div class={styles['round-wrap']}><div class={styles.info}>{infoDom()}</div></div>
  }
})
