import { computed, defineComponent, type StyleValue } from 'vue'
import styles from './item-two.module.less'
import type { DevicePropsForUI } from '@/hook/use-props'
import { getImageThree } from '@/hook/use-utils'
import { findBestMatch } from '@/assets/template-three/images/icon'

interface CardProps {
  data: DevicePropsForUI[];
  itemStyle: StyleValue;
  roomStatus: {
    name: string;
    value: number | undefined;
    isOpen: boolean;
  };
}

export const ItemTwo = defineComponent({
  props: ['data', 'itemStyle', 'roomStatus'],
  setup (props: CardProps, { slots }) {
    const roomStatusColor = computed(() => {
      return !props.roomStatus.isOpen ? 'CLOSE' : ''
    })
    return (): JSX.Element=>
      <div class={`${styles['item-two-wrapper']}`}>
        {
          props.data.map(x =>
            <div class={styles['item-content']} style={props.itemStyle} key={x.code}>
              <div class={styles['item-title']}>{x.name}</div>
              <div class={styles['item-value']}>
                {
                  findBestMatch(x.name, x.code) &&
                  <img src={getImageThree(`icon/${findBestMatch(x.name, x.code)?.icon}.png`)} class={styles['item-icon']} />
                }
                {
                  x.code === 'airconditioner'
                    ? <div class={styles['item-num-wrap']}>
                      <span class={[styles['item-num'], styles.NORMAL, styles.air]}> {props?.roomStatus?.name || '--'}</span>
                    </div>
                    : <>
                      <div class={styles['item-num-wrap']}>
                        <span class={[styles['item-num'], styles[`${roomStatusColor.value || x.status}`]]}> {x.valueText || '-'}</span>
                        <span class={styles['item-unit']}>{x.unit}</span>
                      </div>
                    </>
                }
              </div>
            </div>)
        }
        {slots.default?.()}
      </div>
  },
})
