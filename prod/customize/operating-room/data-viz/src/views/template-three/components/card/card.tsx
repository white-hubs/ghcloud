import { defineComponent } from 'vue'
import styles from './index.module.less'
import { getImageThree } from '@/hook/use-utils'

interface CardProps {
  title: string;
  width: string;
  height: string;
  sub: boolean;
  um: boolean;
}

export const Card = defineComponent({
  props: ['title', 'width', 'height', 'sub', 'um'],
  setup (props: CardProps, { slots }) {
    return (): JSX.Element=>
      <div class={styles['card-container']} style={{ width: props?.width || '100%', height: props?.height }}>
        <div class={styles['card-head']}>
          <div class={[styles['card-head-title'], props?.sub ? styles['card-head-title-sub'] : '', props?.um ? styles['card-head-title-um'] : '']}>
            <img class={styles.square} src={getImageThree('square.png')} />
            <span>{props.title}</span>
            {props?.um && <img class={styles.square} src={getImageThree('square.png')} />}
          </div>
        </div>
        <div class={styles['card-body']}>
          {slots.default?.()}
        </div>
      </div>
  },
})
