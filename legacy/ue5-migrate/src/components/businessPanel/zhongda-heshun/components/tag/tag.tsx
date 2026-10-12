import { defineComponent } from 'vue'
import styles from './tag.module.less'

interface Props{
  type: "WAIT" | "DOING" | "COMPLETED" | "WAIT_RECEIVE" | "WAIT_EXECUTE" | "TERMINATED" | "EXPIRED" | "EXECUTING" | "FINISHED" | "PROCESSING" | "WAITING";

}

export const Tag = defineComponent({
  props: ['type'],
  setup (props: Props, { slots }){
    return (): JSX.Element=> <span class={`${styles['status-tag']} ${styles[props.type]}`}>{slots?.default?.() ?? ''}</span>
  }
})