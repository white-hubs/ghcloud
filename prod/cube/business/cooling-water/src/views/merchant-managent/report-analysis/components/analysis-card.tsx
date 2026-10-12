import { defineComponent } from 'vue'
import { getLocalAssetsFile } from '@/utils/common'
import styles from './analysis-card.module.less'
import { DateRangePicker } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
export const AnalysisCard = defineComponent({
  props: {
    width: {
      type: String,
      default: () => '100%'
    },
    imageSrc: {
      type: String,
      default: () => 'bg-1.png'
    },
    pickerValue: {
      type: Array,
      default: () => [dayjs().format('YYYY-MM-01'), dayjs().format('YYYY-MM-DD')]
    },
    value: {
      type: Number,
      default: () => '0'
    },
    showPicker: {
      type: Boolean,
      default: () => false
    },
    title: {
      type: String,
      default: () => '冷冻水档位总数（个）'
    }
  },
  emits: ['pickerChange', 'update:pickerValue'],
  setup: (props, { emit }) => {
    const iconSrc = getLocalAssetsFile(props.imageSrc)
    const handlePickerChange = (value: string[]): void => {
      emit('update:pickerValue', value)
      emit('pickerChange', value)
    }
    return (): JSX.Element => (
      <div class={styles.card} style={{ width: props.width }}>
        <div class={styles['card-content']}>
          <div class={styles.title}>{props.title}</div>
          <div class={styles.count}>{props.value}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            {props.showPicker && <DateRangePicker v-model:value={props.pickerValue} onChangePicker={handlePickerChange} />}
          </div>
          <img src={iconSrc} alt='' srcset='' style={{ marginRight: '20px' }} />
        </div>
      </div>
    )
  }
})
