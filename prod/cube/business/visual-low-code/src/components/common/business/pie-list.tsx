import { computed, defineComponent, type PropType } from 'vue'
import './style/pie-list.less'
interface PieData {
  label: string;
  color: string;
  value: number | string;
}
export default defineComponent({
  name: 'PlanList',
  props: {
    class: {
      type: String,
      default: ''
    },
    roundPieData: {
      type: Array as PropType<PieData[]>,
      default: []
    },
    unit: {
      type: String,
      default: ''
    }
  },
  setup: (props) => {
    const character = computed(() => (value: string) => {
      if (value.includes('(')) {
        return '('
      } else {
        return ''
      }
    })
    return () => {
      return (
        <>
          <div class={['policeList', props.class]}>
            {
              props.roundPieData.map(item =>
                <div
                  class='thePolice'
                  key={item.color}
                >
                  <div title={item.label}>
                    <span style={{ background: item.color }} class='thePoliceColor' />
                    <span class='thePoliceLeft'>{item.label.split('(')[0]}</span>
                    <span style='line-height: 20px'>
                      {character.value(item.label)}
                      {item.label.split('(')[1]}
                    </span>
                  </div>
                  <span>
                    <span>{item.value}</span>
                    <span style='font-size: 12px;display: inline-block;margin-left: 5px;'>{props.unit}</span>
                  </span>
                </div>
              )
            }
          </div>
        </>
      )
    }
  }

})
