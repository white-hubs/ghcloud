import { computed, defineComponent, type PropType } from 'vue'
import styles from './style/elevator-analysis-list.module.less'
interface List {
  name: string;
  value: number | string;
  color: string;
  ratio?: string;
}
export default defineComponent({
  name: 'ElevatorAnalysisList',
  emits: ['handlecurrent'],
  props: {
    contentList: {
      type: Array as PropType<List[]>,
      default: () => []
    },
    showRatio: {
      type: Boolean
    }
  },
  setup (props, { emit }) {
  //   const countNum = computed(()=>(value:number|string)=>{
  //     let num=0
  //     props.contentList.forEach(item=>{
  //         num+=Number(item.value)
  //     })
  //     if(props.showRatio) {
  //         return (Math.round( Number(value)/num * 10000) / 100).toFixed(0) + "%"  ;
  //     }else{
  //         return value;
  //     }
  // })
    const num = computed(() => {
      let num = 0
      props.contentList.forEach(item => {
        num += Number(item.value)
      })
      return num
    })
    const handleCurrent = (item: List): void => {
      emit('handlecurrent', item)
    }
    return () =>
      <div class={styles['alarm-analysis']}>
        {
        props.contentList.map((item, index) =>
          <div key={index} class={styles['alarm-analysisBox']} onClick={() => { handleCurrent(item) }}>
            <div class={styles['alarm-analysis-left']}>
              <div class={styles['alarm-analysis-color']} style={{ background: item.color }} />
              <div class={styles['alarm-analysis-name']} title={item.name}>{item.name}</div>
            </div>
            {/* <div>{ countNum(item.value) }</div> */}
            <div>{props.showRatio ? Math.round((Number(item.value) / num.value * 10000) / 100).toFixed(0) + '%' : item.value}</div>
            {num}
          </div>
        )
      }
      </div>
  }
})
