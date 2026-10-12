import { Calendar, Icon } from "vant";
import { defineComponent, shallowRef, type PropType } from "vue";

import styles from "./date-range-filter.module.less";

const MIN_SELECTABLE_DATE = new Date(1970, 0, 1);
const MAX_SELECTABLE_DATE = new Date(2099, 11, 31);

const toDate = (value: string): Date | undefined => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const DateRangeFilter = defineComponent({
  name: "DateRangeFilter",
  props: {
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    labels: {
      type: Object as PropType<{ start: string; end: string }>,
      default: () => ({ start: "开始日期", end: "结束日期" }),
    },
  },
  emits: {
    change: (startDate: string, endDate: string) => typeof startDate === "string" && typeof endDate === "string",
  },
  setup: (props, { emit }) => {
    const visible = shallowRef(false);

    const openCalendar = (): void => {
      visible.value = true;
    };

    const confirm = (value: Date | Date[]): void => {
      const dates = Array.isArray(value) ? value : [value, value];
      const [startDate, endDate] = dates;
      visible.value = false;
      if (startDate && endDate) emit("change", formatDate(startDate), formatDate(endDate));
    };

    const defaultDate = (): Date[] | undefined => {
      const startDate = toDate(props.startDate);
      const endDate = toDate(props.endDate);
      return startDate && endDate ? [startDate, endDate] : undefined;
    };

    const dateRangeText = (): string => {
      if (props.startDate && props.endDate) return `${props.startDate} 至 ${props.endDate}`;
      return "选择日期范围";
    };

    const clearDateRange = (): void => {
      emit("change", "", "");
    };

    return (): JSX.Element => (
      <>
        <div class={styles.range} aria-label="日期范围">
          <button class={styles.dateButton} type="button" aria-label="选择日期范围" onClick={openCalendar}>
            <span class={[styles.dateText, !(props.startDate && props.endDate) && styles.placeholder]}>{dateRangeText()}</span>
            <Icon name="calendar-o" />
          </button>
          {props.startDate && props.endDate ? (
            <button class={styles.clearButton} type="button" aria-label="清空日期范围" onClick={clearDateRange}>
              <Icon name="clear" />
            </button>
          ) : null}
        </div>

        <Calendar
          v-model:show={visible.value}
          type="range"
          minDate={MIN_SELECTABLE_DATE}
          maxDate={MAX_SELECTABLE_DATE}
          defaultDate={defaultDate()}
          onConfirm={confirm}
        />
      </>
    );
  },
});
