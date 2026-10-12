import { defineComponent, onMounted, reactive, type PropType } from 'vue'
import { Select, TimePicker } from 'ant-design-vue'
import styles from './index.module.less'
import { executeCycleOptions, monthCycleOptions, weekCycleOptions } from './constant'

export const DailyTaskCreateCycle = defineComponent({
  props: {
    cronId: {
      type: String,
      default: null
    },
    specifiedType: {
      type: String,
      default: null
    },
    specifiedDays: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    specifiedTime: {
      type: String,
      default: null
    },
    cycleOptionsApi: {
      type: Function,
      required: true
    },
  },
  emits: ['update:cronId', 'update:specifiedType', 'update:specifiedDays', 'update:specifiedTime'],
  setup: (props, { emit }) => {
    const state = reactive<{
      cycleOptions: { id: string; name: string; }[];
      cycleType: string | null;
      cronId: string | null;
    }>({
      cycleOptions: [],
      cycleType: null,
      cronId: null,
    })

    onMounted(async () => {
      const result = await props.cycleOptionsApi()
      state.cycleOptions = [{ id: 'custom', name: '自定义' }, ...result]
    })

    return (): JSX.Element => (
      <div class={styles.cycleContainer}>
        <Select
          v-model:value={props.cronId}
          onUpdate:value={(v) => {
            emit('update:cronId', v)
          }}
          style={{ maxWidth: '300px', minWidth: '150px' }}
          options={state.cycleOptions}
          fieldNames={{ label: 'name', value: 'id' }}
          placeholder='请选择执行周期'
          size={'middle'}
          allowClear
        />
        {props.cronId === 'custom' && (
          <>
            <Select
              v-model:value={props.specifiedType}
              placeholder='执行周期'
              onUpdate:value={(v) => {
                emit('update:specifiedType', v)
                emit('update:specifiedDays', [])
              }}
              style={{ maxWidth: '200px', minWidth: '100px' }}
              options={executeCycleOptions}
              size={'middle'}
            />
            {props.specifiedType === 'EVERY_WEEK' && (
              <Select
                mode='multiple'
                v-model:value={props.specifiedDays}
                onUpdate:value={(v) => {
                  emit('update:specifiedDays', v)
                }}
                allowClear
                options={weekCycleOptions}
                style={{ flex: '3 1 0', width: '100%', minWidth: '240px' }}
                size={'middle'}
              />
            )}
            {props.specifiedType === 'EVERY_MONTH' && (
              <Select
                mode='multiple'
                v-model:value={props.specifiedDays}
                onUpdate:value={(v) => {
                  emit('update:specifiedDays', v)
                }}
                allowClear
                options={monthCycleOptions}
                style={{ flex: '3 1 0', width: '100%', minWidth: '240px' }}
                size={'middle'}
              />
            )}
            <TimePicker
              valueFormat='HH:mm:ss'
              format='HH:mm:ss'
              style={{ maxWidth: '200px', minWidth: '100px' }}
              v-model:value={props.specifiedTime}
              onUpdate:value={(v) => {
                emit('update:specifiedTime', v)
              }}
              size={'middle'}
              defaultValue='12:00:00'
            />
          </>
        )}
      </div>
    )
  }
})
