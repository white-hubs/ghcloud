import { defineComponent } from 'vue'
import styles from './index.module.less'
import { Image } from '@ghcloud/cube-ui'

interface Props {
  description: string;
}

export const NoData = defineComponent({
  props: {
    description: {
      type: String,
      required: true
    },
  },
  setup (props: Props) {
    const img = '/resource/v1/slide-rail/no-data.png'

    return (): JSX.Element =>
      <div class={styles.box}>
        <div class={styles.content}>
          <Image src={img} width='100%' />
          <div class={styles.text}>{props.description || '暂无数据'}</div>
        </div>
      </div>
  },
})
