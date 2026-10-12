import { defineComponent, onMounted, reactive, ref } from 'vue';
import { Space, DateRangePicker, RadioGroup } from '@ghcloud/cube-ui'
import dayjs from 'dayjs';
import styles from './time-radio-group.module.less';

interface State {
  dates: string[];
  period: string;
}
interface Props {
  value: string;
}
export const TimeRadioGroup = defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    },
  },
  emits: ['update:value', 'change'],
  setup (props: Props, { emit, expose }) {
    const state = reactive<State>({
      dates: [],
      period: "",
    });
    const DateTypes = {
      TODAY: 'TODAY',
      THIS_WEEK: 'THIS_WEEK',
      THIS_MONTH: 'THIS_MONTH',
      THIS_YEAR: 'THIS_YEAR',
    }
    const DateTypeOptions = [
      { label: '今日', value: DateTypes.TODAY },
      { label: '本周', value: DateTypes.THIS_WEEK },
      { label: '本月', value: DateTypes.THIS_MONTH },
      { label: '本年', value: DateTypes.THIS_YEAR },
    ]
    const type = ref<string>(DateTypes.TODAY)
    onMounted(() => {
      state.period = dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().format('YYYY-MM-DD HH:mm:ss');
      state.dates = [dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss'), dayjs().format('YYYY-MM-DD HH:mm:ss')];
      emit("update:value", state.period);
      emit("change", type.value);
    });
    const formatDateRange = (start: string, end: string): string => `${start},${end}`

    const getDateTime = (value: string): void => {
      type.value = value;
      let startDate, endDate
      switch (value) {
        case DateTypes.TODAY:
          startDate = dayjs().format('YYYY-MM-DD 00:00:00')
          endDate = dayjs().format('YYYY-MM-DD 23:59:59')
          break
        case DateTypes.THIS_WEEK:
          startDate = dayjs().startOf('week').format('YYYY-MM-DD 00:00:00')
          endDate = dayjs().endOf('week').format('YYYY-MM-DD 23:59:59')
          break
        case DateTypes.THIS_MONTH:
          startDate = dayjs().startOf('month').format('YYYY-MM-DD 00:00:00')
          endDate = dayjs().endOf('month').format('YYYY-MM-DD 23:59:59')
          break
        case DateTypes.THIS_YEAR:
          startDate = dayjs().startOf('year').format('YYYY-MM-DD 00:00:00')
          endDate = dayjs().format('YYYY-MM-DD 23:59:59')
          break
        default:
          startDate = dayjs().format('YYYY-MM-DD 00:00:00')
          endDate = dayjs().format('YYYY-MM-DD 23:59:59')
      }

      state.period = formatDateRange(startDate, endDate)
      state.dates = [startDate, endDate]
      emit("update:value", state.period);
      emit("change", type.value);
    };

    const changePicker = (): void => {
      type.value = "";
      state.dates[0] = dayjs(state.dates[0]).format('YYYY-MM-DD 00:00:00');
      state.dates[1] = dayjs(state.dates[1]).format('YYYY-MM-DD 23:59:59');
      state.period = state.dates[0] + ',' + state.dates[1];
      emit("update:value", state.period);
      emit("change", type.value);
    };

    expose({
      getDateTime
    })

    return (): JSX.Element => (
      <div class={styles['radio-group-container']}>
        <Space>
          <RadioGroup
            v-model:value={type.value}
            buttonStyle='solid'
            options={DateTypeOptions}
            onChange={getDateTime}
          />
          <DateRangePicker
            v-model:value={state.dates}
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            allowClear={false}
            onChangePicker={changePicker}
          />
        </Space>
      </div>
    );
  },
});
