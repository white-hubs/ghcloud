import { defineComponent, reactive, ref } from 'vue'
import {Icon} from 'vant'
import styles from './index.module.less'

export const DisplayCell = defineComponent({
  emits: ['click'],
    props: {
      value: {
        type: String,
        required: true
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    
  setup: (props, { emit,slots}) => {
    const callBack = (): void => {
      if(props.disabled){
        return;
      }
      emit('click')
    }
    return (): JSX.Element => (
      <>
        <div class={styles.cellBody} onClick={callBack}>
          {props.value?
          <>
            <div class={styles.cellBodyValueText}>{props.value} </div>
            <Icon name='arrow'></Icon>
          </>:
          <>
            {slots['icon']?.()}
            
            <div class={styles.cellBodyText}>{props.placeholder} </div>
            <Icon name='arrow'></Icon>
          </>}
        </div>
      </>
    )
  }
})