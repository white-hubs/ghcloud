import { defineComponent, type PropType } from 'vue'
import './style/operate-days.less'
interface Props {
  alarmStatusName: string;
  alarmNum: number | string;
  alarmStatus?: string;
  color?: string;
}
export default defineComponent({
  name: 'GridContainer',
  props: {
    data: {
      type: Array as PropType<Props[]>,
      default: []
    },
    internalStyle: {
      type: String,
      default: ''
    },
  },
  setup: (props, { emit }) => {
    const getItem = (item: Props): void => {
      emit('clickItem', item)
    }
    return () => {
      return (
        <>
          <div class='grid-container'>
            {
              props.data.map(item =>
                <div key={item.alarmStatusName} class='grid-item' onClick={() => { getItem(item) }}>
                  <div class='title flex-start'>
                    <span style={{ backgroundColor: item.color }} class='dian' />
                    <span>{item.alarmStatusName}</span>
                  </div>
                  <div style={{ color: item.color, marginLeft: '10px' }}>
                    {item.alarmNum}
                  </div>
                </div>
              )
            }
          </div>
        </>
      )
    }
  }
})
