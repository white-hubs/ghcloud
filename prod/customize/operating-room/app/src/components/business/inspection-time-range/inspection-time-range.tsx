import { defineComponent, ref } from 'vue';
import type { Dayjs } from 'dayjs';
import { DatePicker, TimePicker, message, Space, Button } from 'ant-design-vue';

export const InspectionTimeRange = defineComponent({
  props: {
    onChange: {
      type: Function,
      default: () => {}
    }
  },
  setup (props) {
    const selectedDate = ref<Dayjs | null>(null);
    const startTime = ref<Dayjs | null>(null);
    const endTime = ref<Dayjs | null>(null);

    const validateTimeRange = (start: Dayjs, end: Dayjs): boolean => {
      const duration = end.diff(start, 'minute');
      return duration >= 30 && duration <= 60;
    };

    const handleDateChange = (date: Dayjs | null): void => {
      selectedDate.value = date;
      startTime.value = null;
      endTime.value = null;
      updateTimeRange();
    };

    const handleStartTimeChange = (time: Dayjs | null): void => {
      startTime.value = time;
      if (time && !endTime.value) {
        const suggestedEndTime = time.add(30, 'minute');
        if (suggestedEndTime.isSame(time, 'day')) {
          endTime.value = suggestedEndTime;
        }
      }
      updateTimeRange();
    };

    const handleEndTimeChange = (time: Dayjs | null): void => {
      endTime.value = time;
      updateTimeRange();
    };

    const updateTimeRange = (): void => {
      if (!selectedDate.value || !startTime.value || !endTime.value) {
        props.onChange(null);
        return;
      }

      const startDateTime = selectedDate.value
        .hour(startTime.value.hour())
        .minute(startTime.value.minute())
        .second(0);

      const endDateTime = selectedDate.value
        .hour(endTime.value.hour())
        .minute(endTime.value.minute())
        .second(0);

      if (!validateTimeRange(startDateTime, endDateTime)) {
        message.destroy();
        message.warn('时间跨度必须在30分钟到1小时之间');
        props.onChange(null);
        return;
      }

      props.onChange([startDateTime, endDateTime], [
        startDateTime.format('YYYY-MM-DD HH:mm'),
        endDateTime.format('YYYY-MM-DD HH:mm')
      ]);
    };

    const disabledStartHours = (): number[] => {
      return [];
    };

    const disabledStartMinutes = (): number[] => {
      return [];
    };

    const disabledEndHours = (): number[] => {
      if (!startTime.value) return [];

      const startHour = startTime.value.hour();
      const endHour = startHour + 1;

      const hours = Array.from({ length: 24 }, (v, i) => i);

      return hours.filter(h => h !== startHour && h !== endHour);
    };

    const disabledEndMinutes = (selectedHour: number): number[] => {
      if (!startTime.value) return [];

      const startHour = startTime.value.hour();
      const startMinute = startTime.value.minute();

      const minutes = Array.from({ length: 60 }, (v, i) => i);

      if (selectedHour === startHour) {
        return minutes.filter(m => m < startMinute + 30);
      } else if (selectedHour === startHour + 1) {
        return minutes.filter(m => m > startMinute);
      }

      return [];
    };

    const handleClear = (): void => {
      selectedDate.value = null;
      startTime.value = null;
      endTime.value = null;
      props.onChange(null);
    };

    return (): JSX.Element => (
      <Space>
        <DatePicker
          v-model:value={selectedDate.value}
          onChange={handleDateChange}
          placeholder="请选择日期"
          style={{ width: '120px' }}
        />
        <Space style={{ width: '100%' }}>
          <TimePicker
            v-model:value={startTime.value}
            onChange={handleStartTimeChange}
            format="HH:mm"
            placeholder="开始时间"
            hideDisabledOptions={true}
            disabledHours={disabledStartHours}
            disabledMinutes={disabledStartMinutes}
            style={{ width: '120px' }}
            disabled={!selectedDate.value}
          />
          <span>至</span>
          <TimePicker
            v-model:value={endTime.value}
            onChange={handleEndTimeChange}
            format="HH:mm"
            placeholder="结束时间"
            hideDisabledOptions={true}
            disabledHours={disabledEndHours}
            disabledMinutes={disabledEndMinutes}
            style={{ width: '120px' }}
            disabled={!selectedDate.value || !startTime.value}
          />
          <Button type="link" size='small' onClick={handleClear}>清空</Button>
        </Space>
      </Space>
    );
  }
});