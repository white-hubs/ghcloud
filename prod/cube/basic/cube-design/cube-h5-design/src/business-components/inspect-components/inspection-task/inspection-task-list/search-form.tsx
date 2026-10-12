import { Button, DatePicker, Field, Form, Popup, showNotify } from 'vant'
import { defineComponent, reactive, ref, watch } from 'vue'
import styles from './inspection-task.module.less'
export const SearchForm = defineComponent({
  emits: ['onUpdate:visible', 'search'],
  props: {
    search: {
      type: Object,
      default: () => {
        return {
          startTime: '',
          endTime: '',
        }
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup: (props, { emit }) => {
    watch(() => props.visible, (val) => {
      showPopUp.value = val
    })
    const showPopUp = ref(false)
    const showStartPicker = ref(false)
    const showEndPicker = ref(false)
    const search = reactive({
      startTime: '',
      endTime: '',
      period: ''
    })
    // 开始时间
    const handleStartPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showStartPicker.value = false
      const startTime = selectedOptions.map((item) => item.text).join('/')
      if (new Date(startTime).getTime() > new Date(search.endTime).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      search.startTime = startTime
    }
    // 结束时间
    const handleEndPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showEndPicker.value = false
      const endTime = selectedOptions.map((item) => item.text).join('/')
      if (new Date(endTime).getTime() < new Date(search.startTime).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      search.endTime = endTime
    }
    // 查询
    const handleSearch = (): void => {
      if (search.startTime !== '' && search.endTime !== '') {
        search.period = (search.startTime + ' 00:00:00') + ',' + (search.endTime + ' 23:59:59')
      } else {
        search.startTime = ''
        search.endTime = ''
        search.period = ''
      }
      showPopUp.value = false
      emit('onUpdate:visible', false)
      emit('search', search)
    }
    return (): JSX.Element =>
      <Popup
        v-model:show={showPopUp.value}
        position='right'
        style={{ width: '90vw', height: '100vh' }}
        onClose={() => {
          showPopUp.value = false
          emit('onUpdate:visible', false)
        }}
      >
        <div class={styles.filter}>
          <Form>
            <p>时间范围</p>
            <div class={styles.screen}>
              <Field
                v-model={search.startTime}
                is-link
                readonly
                name='startTime'
                placeholder='开始时间'
                onClick={() => {
                  showStartPicker.value = true
                }}
              />
              <Field
                v-model={search.endTime}
                is-link
                readonly
                name='startTime'
                placeholder='结束时间'
                onClick={() => {
                  showEndPicker.value = true
                }}
              />
            </div>
          </Form>
        </div>
        <div class={styles.button}>
          <div class={styles.reset} onClick={() => {
            search.startTime = ''; search.endTime = ''; search.period = ''
          }}>
            重置
          </div>
          <Button block type='primary' onClick={handleSearch}>
            提交
          </Button>
        </div>
        <Popup v-model:show={showStartPicker.value} position='bottom'>
          <DatePicker onConfirm={handleStartPicker} onCancel={() => {
            showStartPicker.value = false
          }} />
        </Popup>
        <Popup v-model:show={showEndPicker.value} position='bottom'>
          <DatePicker onConfirm={handleEndPicker} onCancel={() => {
            showEndPicker.value = false
          }} />
        </Popup>
      </Popup>
  }
})
