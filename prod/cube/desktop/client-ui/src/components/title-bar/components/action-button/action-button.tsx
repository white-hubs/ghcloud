import { defineComponent } from 'vue'
const exitIcon = "/resource/v1/desktop-client-ui/exit.png"
const minIcon = "/resource/v1/desktop-client-ui/min.png"
const maxIcon = "/resource/v1/desktop-client-ui/max.png"
import { WindowAction } from '../../../../hook/use-client'
import styles from './action-button.module.less'
import { SettingOutlined } from '@ghcloud/cube-ui'

/* 关闭按钮 */
export const CloseButton = defineComponent({
  emits: ['click'],
  setup (props, { emit }) {
    const handleWindowSet = (action: WindowAction): void => {
      emit('click', action)
    }
    return (): JSX.Element =>
      <div class={styles['item']} onClick={()=>{
        handleWindowSet(WindowAction.CLOSE)
      }} >
        <img src={exitIcon} alt="" />
      </div>
  }
})


/** 最小化按钮 */
export const MinimizeButton = defineComponent({
  emits: ['click'],
  setup (props, { emit }) {
    const handleWindowSet = (action: WindowAction): void => {
      emit('click', action)
    }
    return (): JSX.Element =>
      <div class={styles['item']} onClick={()=>{
        handleWindowSet(WindowAction.MINIMIZE)
      }}>
        <img src={minIcon} alt="" />
      </div>
  }
})

/** 最大化按钮 */
export const MaximizeButton = defineComponent({
  emits: ['click'],
  setup (props, { emit }) {
    const handleWindowSet = (action: WindowAction): void => {
      emit('click', action)
    }
    return (): JSX.Element =>
      <div class={styles['item']} onClick={()=>{
        handleWindowSet(WindowAction.MAXIMIZE)
      }}>
        <img src={maxIcon} alt="" />
      </div>
  }
})

/** 设置按钮 */
export const SettingButton = defineComponent({
  emits: ['click'],
  setup (props, { emit }) {
    const handleWindowSet = (action: WindowAction): void => {
      emit('click', action)
    }
    return (): JSX.Element =>
      <div class={styles['item']} onClick={()=>{
        handleWindowSet(WindowAction.SETTING)
      }}>
        <SettingOutlined />
      </div>
  }
})