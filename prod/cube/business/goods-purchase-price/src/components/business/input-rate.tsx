import { Select, TimePicker } from '@ghcloud/cube-ui'
import { computed, defineComponent, type PropType, reactive, ref, watch } from 'vue'
import '@/styles/common.less'
import { mouthOptions, weekOptions } from '@/hook/common'

export interface RateState {
  publishType: string;
  publishPeriod?: string;
  publishTime?: string;
}
interface Props {
  rateData: RateState;
  isDetail: boolean;
}
export const InputRate = defineComponent({
  props: {
    rateData: {
      type: Object as PropType<RateState>,
      default: () => ({})
    },
    isDetail: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const rateData = reactive<RateState>(props.rateData ?? {
      publishType: '',
      publishPeriod: '',
      publishTime: '',
    })
    const publishTypeOptions = ref([
      { label: '每天', value: 'EVERY_DAY' },
      { label: '每周', value: 'EVERY_WEEK' },
      { label: '每月', value: 'EVERY_MONTH' },
    ])

    watch(() => rateData, () => {
      emit('update:value', rateData)
    }, { deep: true })
    watch(() => props.rateData, () => {
     Object.assign(rateData, props.rateData)
    }, { deep: true })
    // const typeTxt = computed(() => publishTypeOptions.value.find(e => e.value === rateData?.publishType)?.label ?? '--')
    // const periodTxt = computed(() => {
    //   if (rateData.publishType === 'EVERY_WEEK') return weekOptions.value.find(e => e.value === rateData.publishPeriod)?.label ?? '--'
    //   if (rateData.publishType === 'EVERY_MONTH') return mouthOptions.value.find(e => e.value === rateData.publishPeriod)?.label ?? '--'
    //   return ''
    // })
    return (): JSX.Element => {
      if (props.isDetail) {
        let periodTxt = ''
        const typeTxt = publishTypeOptions.value.find(e => e.value === rateData.publishType)?.label ?? '--'
        if (rateData.publishType === 'EVERY_WEEK') periodTxt = weekOptions.value.find(e => e.value === rateData.publishPeriod)?.label ?? '--'
        if (rateData.publishType === 'EVERY_MONTH') periodTxt = mouthOptions.value.find(e => e.value === rateData.publishPeriod)?.label ?? '--'
        return <span>{typeTxt} {periodTxt} {rateData.publishTime}</span>
      }

      return (
        <div class='rate-item'>
          <Select class='mr-10' v-model:value={rateData.publishType} options={publishTypeOptions.value} />
          {
            rateData.publishType === 'EVERY_WEEK' && <Select class='mr-10' v-model:value={rateData.publishPeriod} options={weekOptions.value} />
          }
          {
            rateData.publishType === 'EVERY_MONTH' && <Select class='mr-10' v-model:value={rateData.publishPeriod} options={mouthOptions.value} />
          }
          <TimePicker class='mr-10' v-model:value={rateData.publishTime} format='HH:mm' />
        </div>
      )
    }
  }
})
