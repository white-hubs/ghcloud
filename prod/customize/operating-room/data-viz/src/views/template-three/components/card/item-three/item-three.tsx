import { computed, defineComponent, type StyleValue } from 'vue'
import styles from './item-three.module.less'
import type { DevicePropsForUI } from '@/hook/use-props'

interface CardProps {
  data: DevicePropsForUI[];
  itemStyle: StyleValue;
  roomStatus: {
    name: string;
    value: number | undefined;
    isOpen: boolean;
  };
}

export const ItemThree = defineComponent({
  props: ['data', 'itemStyle', 'roomStatus'],
  setup (props: CardProps) {
    const roomStatusColor = computed(() => {
      return !props.roomStatus.isOpen ? 'CLOSE' : ''
    })
    return (): JSX.Element =>
      <div class={`${styles['item-one-wrapper']}`}>
        {
          props.data.map(x =>
            <div class={styles['item-content']} style={props.itemStyle} key={x.code}>
              <div class={styles['item-title']}>{x.name}</div>
              <div class={styles['item-value']}>

                {
                  x.code === 'airconditioner'
                    ? <span class={[styles['item-num'], styles.NORMAL, styles.air]}> {props?.roomStatus?.name || '--'}</span>
                    : <>
                      <span class={[styles['item-num'], styles[`${roomStatusColor.value || x.status}`]]}> {x.valueText || '-'}</span>
                      <span class={styles['item-unit']}>{x.unit}</span>
                    </>
                }

              </div>
            </div>)
        }
      </div>
  },
})
