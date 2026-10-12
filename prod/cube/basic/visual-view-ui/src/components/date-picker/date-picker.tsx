import { PropType, defineComponent, ref, watch } from 'vue'
import { NDatePicker } from 'naive-ui'
// import dayjs from 'dayjs'
type DatePicker='date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'monthrange' | 'year' | 'quarter'
type ValueType=[number,number| undefined] |number
export default defineComponent({
  emits:['update:value'],
  props: {
    clearable : {
      type: Boolean,
      default: true
    },
    value: {
      type: Number as PropType<ValueType>,
      default: [ Date.now()],
    },
    valueFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    defaultTime:{
      type:String ,
      default:"['16:00:00', undefined]" 
    },
    type:{
      type:String as PropType<DatePicker>,
      default:'date'
    },
    closeOnSelect: {
      type: Boolean,
      default: false
    },
  },
  setup (props, { emit }) {
    const value = ref<ValueType>([Date.now(),undefined])
    
    watch(() => props.value, () => {
      value.value = props.value
    })
    const handleValue=(value: number | null, formattedValue: string | null)=>{
      emit('update:value',{value,formattedValue})
    }
    return () => {
      return <NDatePicker 
      class='cube-picker' 
      default-time={props.defaultTime} 
      type={props.type}  
      clearable={props.clearable}
      on-update:value={handleValue}
      close-on-select={props.closeOnSelect}
      />
    }
  }
})
