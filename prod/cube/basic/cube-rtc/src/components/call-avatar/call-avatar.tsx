import { defineComponent, type PropType } from 'vue'
import styles from './call-avatar.module.less'

export const CallAvatar = defineComponent({
  props: {
    avatar: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium'
    }
  },
  setup (props) {
    return (): JSX.Element => (
      <div class={styles[`call-avatar call-avatar-${props.size}`]}>
        {props.avatar ? (
          <img src={props.avatar} alt={props.name} />
        ) : (
          <div class={styles['call-avatar-placeholder']}>
            {props.name?.substring(0, 1) || '?'}
          </div>
        )}
      </div>
    )
  }
})