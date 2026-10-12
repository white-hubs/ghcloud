import { defineComponent, onMounted, reactive, watch } from 'vue'
import { type RadioChangeEvent, RadioGroup, Select, TimePicker, Form, FormItem } from 'ant-design-vue'
import styles from './index.module.less'
import { cycleOptions, executeCycleOptions, monthCycleOptions, weekCycleOptions } from './constant'
export const TaskCreateCycle = defineComponent({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    cronId: {
      type: String,
      default: null
    },
    cycleType: {
      type: String,
      default: null
    },
    selection: {
      type: String,
      default: null
    },
    hour: {
      type: String,
      default: null
    },
    cycleOptionsApi: {
      type: Function,
      required: true
    },
  },
  emits: ['update:value', 'update:cronId', 'update:cycleType', 'update:hour', 'update:selection'],
  setup: (props, { emit }) => {
    const state = reactive<{
      cycleOptions: { id: string; name: string; }[];
      cycleType: string | null;
      cronId: string | null;
      cycle: boolean;
    }>({
      cycleOptions: [],
      cycleType: null,
      cronId: null,
      cycle: false
    })
    onMounted(async () => {
      const result = await props.cycleOptionsApi()
      state.cycleOptions = [{ id: 'custom', name: '自定义' }, ...result]
    })
    watch(()=>props, ()=>{

    }, {
      deep: true
    })
    return (): JSX.Element => (
      <Form class={styles.container}>
        <FormItem style={{ marginRight: 0 }}>
          <RadioGroup
            buttonStyle='solid'
            optionType='button'
            onChange={(e: RadioChangeEvent) => {

              emit('update:value', e.target.value)
            }}
            value={props.value} options={cycleOptions}
          />
        </FormItem>

        {props.value &&
          <div class={styles.cycleContainer}>
            <FormItem>
              <Select
                v-model:value={props.cronId} onUpdate:value={(v) => {
                  emit('update:cronId', v)
                }} style={{ minWidth: '150px' }} options={state.cycleOptions} fieldNames={{ label: 'name', value: 'id' }}
                placeholder='请选择执行周期'
                allowClear
              />
            </FormItem>
            {props.cronId === 'custom' &&
              <>
                {/* 执行周期 日/周/月 */}
                <FormItem>
                  <Select
                    v-model:value={props.cycleType} placeholder='执行周期' onUpdate:value={(v) => {
                      emit('update:cycleType', v)
                      emit('update:selection', [])
                    }} style={{ minWidth: '100px' }} options={executeCycleOptions}
                  />
                </FormItem>
                {props.cycleType === 'EVERY_WEEK' &&
                  <FormItem>
                    <Select
                      mode='multiple'
                      v-model:value={props.selection} onUpdate:value={(v) => {
                        emit('update:selection', v)
                      }} options={weekCycleOptions} style={{ maxWidth: '140px', minWidth: '80px' }}
                    />
                  </FormItem>}
                {props.cycleType === 'EVERY_MONTH' &&
                  <FormItem>
                    <Select
                      mode='multiple'
                      v-model:value={props.selection} onUpdate:value={(v) => {
                        emit('update:selection', v)
                      }} options={monthCycleOptions} style={{ maxWidth: '140px', minWidth: '80px' }}
                    />
                  </FormItem>}
                <FormItem>
                  <TimePicker
                    valueFormat='HH:mm' format='HH:mm'
                    style={{ minWidth: '100px' }}
                    v-model:value={props.hour} onUpdate:value={(v) => {
                      emit('update:hour', v)
                    }}
                    defaultValue='12:00'
                  />
                </FormItem>
              </>}
          </div>}

      </Form>
    )
  }
})
