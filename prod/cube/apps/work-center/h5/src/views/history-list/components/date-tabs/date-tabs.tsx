import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'
import { DatePicker, Icon, Popup, Tab, Tabs } from 'vant'
import styles from './date-tabs.module.less'
import { dayList, timeTabFormat } from '@/utils'
export const DateTabs = defineComponent({
  emits: ['checked'],
  props: {
    defaultDate: {
      type: String,
      default: ''
    }
  },
  setup (props, { emit, slots }) {
    const showDatePicker = ref(false)
    const month = ref('')
    const dates = ref<{ day: string; week: string;value: string; }[]>([])
    const checkDate = ref(props.defaultDate)
    month.value = timeTabFormat(null, 'yyyy-MM') ?? ''
    dates.value = dayList(month.value)
    const handlePicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showDatePicker.value = false
      month.value = selectedOptions.map((item) => item.text).join('-')
      dates.value = dayList(month.value)
      checkDate.value = dates.value[0].value
    }
    const tabTitle = (item: { day: string; week: string; value: string; }): VNode => <div class={styles['tab-title']}><p>{item.week}</p><p>{item.day}</p></div>
    const changeTab = (name: string): void => {
      checkDate.value = name
      emit('checked', checkDate.value)
    }
    onMounted(() => {
      emit('checked', checkDate.value)
    })
    const currentDate = computed(() => {
      return month.value?.split('-')
    });
    return (): JSX.Element =>
      <div class={styles.history}>
        <div class={styles.wrapper}>
          <div class={styles.month} onClick={() => {
            showDatePicker.value = true
          }}>{month.value}<Icon name='arrow-down' style={{ marginLeft: '3px' }} /></div>
          <Tabs v-model:active={checkDate.value} type='card' style={{ border: 'none' }} onChange={changeTab}>
            {
              dates.value.map(item =>
                <Tab key={item.day} name={item.value} v-slots={{ title: () => tabTitle(item) }}>
                  <div style={{ height: '90vh', background: '#f3f7fa', paddingTop: '1px' }}>
                    {slots.default?.()}
                  </div>
                </Tab>)
            }
          </Tabs>
        </div>
        <Popup
          v-model:show={showDatePicker.value} position='bottom'
          style={{ height: '40%' }}
        >
          <DatePicker
            v-model={currentDate.value}
            title='选择年月'
            columns-type={['year', 'month']}
            onConfirm={handlePicker}
            onCancel={() => {
              showDatePicker.value = false
            }}
          />
        </Popup>
      </div>
  }
})
