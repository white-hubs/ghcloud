import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import styles from './elevator-analysis-list.module.less'

interface ListItem {
  name: string;
  value: number | string;
  color: string;
  ratio?: string;
  code?: string;
}

export const ElevatorAnalysisList = defineComponent({
  name: 'ElevatorAnalysisList',
  props: {
    contentList: {
      type: Array as PropType<ListItem[]>,
      required: true,
      default: () => []
    },
    showRatio: {
      type: Boolean,
      default: true
    },
    warperClassName: {
      type: String,
      default: ''
    }
  },
  emits: ['handlecurrent', 'clickName', 'clickValue'],
  setup(props, { emit }) {
    const localContentList = ref<ListItem[]>([])
    
    watch(() => props.contentList, () => {
      localContentList.value = props.contentList
    }, { deep: true, immediate: true })
    
    const countNum = (value: number | string): string | number => {
      let num = 0
      localContentList.value.forEach(item => {
        num += Number(item.value)
      })
      
      if (props.showRatio) {
        return value ? (Math.round(Number(value) / num * 10000) / 100).toFixed(1) + '%' : value + '%'
      } else {
        return value
      }
    }
    
    const handleCurrent = (item: ListItem): void => {
      emit('handlecurrent', item)
    }
    
    const handleName = (item: ListItem, e: Event): void => {
      e.stopPropagation()
      emit('clickName', item)
    }
    
    const handleValue = (item: ListItem, e: Event): void => {
      e.stopPropagation()
      emit('clickValue', item)
    }
    
    return () => (
      <div class={`${styles['alarm-analysis']} ${props.warperClassName}`}>
        {localContentList.value.map((item, index) => (
          <div 
            class={styles['alarm-analysisBox']} 
            key={index} 
            onClick={() => handleCurrent(item)}
          >
            <div class={styles['alarm-analysis-left']}>
              <div 
                class={styles['alarm-analysis-color']} 
                style={{ background: item.color }}
              ></div>
              <div 
                class={styles['alarm-analysis-name']} 
                title={item.name} 
                onClick={(e) => handleName(item, e)}
              >
                {item.name}
              </div>
            </div>
            <div class={styles['alarm-analysis-value']} onClick={(e) => handleValue(item, e)}>
              {countNum(item.value)}
            </div>
          </div>
        ))}
      </div>
    )
  }
})