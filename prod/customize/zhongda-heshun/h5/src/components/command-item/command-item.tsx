import { defineComponent, type PropType, ref, inject } from 'vue'
import styles from './command-item.module.less'
import { useRouter } from 'vue-router'
import type { CommandVO } from '@ghcloud/cube-zhongda-heshun-service'

/**
 * 命令项组件，用于显示自动化指令卡片
 */
export const CommandItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<CommandVO>,
      required: true
    },
    recordIndex: {
      type: Number,
      default: 0
    }
  },
  emits: ['handleInfo', 'handleDelete'],
  setup: (props, { emit }) => {
    const isAdmin: boolean | undefined = inject('isAdmin')
    const router = useRouter()
    const showOperations = ref(false)
    let longPressTimer: number | null = null
    
    /**
     * 处理点击命令项，跳转到详情页
     */
    const handleClick = (): void => {
      if (!showOperations.value) {
        emit('handleInfo', {
          index: props.recordIndex,
          record: props.record
        })
      }
    }
    
    /**
     * 处理长按事件，显示操作按钮
     */
    const handleTouchStart = (): void => {
      if (!isAdmin) return
      longPressTimer = window.setTimeout(() => {
        showOperations.value = true
      }, 500) // 500毫秒长按时间
      window.setTimeout(() => {
        handleCloseOperations()
      }, 3000)
    }
    
    /**
     * 处理触摸结束事件，清除长按定时器
     */
    const handleTouchEnd = (): void => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }
    
    /**
     * 处理删除命令
     */
    const handleDelete = (e: Event): void => {
      if (!isAdmin) return
      e.stopPropagation()
      emit('handleDelete', props.record)
      showOperations.value = false
    }
    
    /**
     * 关闭操作面板
     */
    const handleCloseOperations = (): void => {
      showOperations.value = false
    }
    return (): JSX.Element => (
      <div 
        class={styles.commandItem} 
        onClick={handleClick}
        onTouchstart={handleTouchStart}
        onTouchend={handleTouchEnd}
        onTouchcancel={handleTouchEnd}
      >
        <div class={styles.content}>
          <div class={styles.name}>{props.record.name}</div>
          
          {props.record.display && (
            <div class={styles.time}>
              当：
              {props.record.display.split('&&')[0]}
            </div>
          )}
          
           {props.record.display && (
            <div class={styles.action}>执行：
              {props.record.display.split('&&')[1]}
            </div>
          )}
        </div>
                
        {showOperations.value && (
          <div class={styles.operations}>
          <div class={styles.deleteBtn} onClick={handleDelete}>
            <div class={styles.mine}></div>
          </div>
          </div>
        )}
      </div>
    )
  }
})