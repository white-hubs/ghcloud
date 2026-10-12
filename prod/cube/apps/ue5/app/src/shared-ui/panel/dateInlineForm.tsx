import { CaretDownOutlined, CalendarOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { defineComponent, ref, watch } from "vue";

import "./dateInlineForm.module.less";

export interface ModelValueItf {
  timeType: string;
  dateRange: string[];
}

const buildDateRange = (timeType: string): string[] => {
  const dateFormat = "YYYY-MM-DD HH:mm:ss";
  if (timeType === "TODAY") {
    return [moment().format("YYYY-MM-DD 00:00:00"), moment().format(dateFormat)];
  }
  if (timeType === "THIS_WEEK") {
    return [
      moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"),
      moment().endOf("week").add(1, "days").format(dateFormat),
    ];
  }
  if (timeType === "THIS_MONTH") {
    return [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)];
  }
  if (timeType === "THIS_YEAR") {
    return [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(dateFormat)];
  }
  return ["", ""];
};

const isBuiltinTimeType = (timeType: string): boolean => ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"].includes(timeType);

export const DateInlineForm = defineComponent({
  name: "DateInlineForm",
  props: {
    modelValue: {
      type: Object as () => ModelValueItf,
      required: false,
      default: () => ({
        timeType: "THIS_YEAR",
        dateRange: ["", ""],
      }),
    },
    showCustom: { type: Boolean, default: false },
    timeList: {
      type: Array as () => { label: string; value: string }[],
      default: () => [
        { label: "今日", value: "TODAY" },
        { label: "本周", value: "THIS_WEEK" },
        { label: "本月", value: "THIS_MONTH" },
        { label: "今年", value: "THIS_YEAR" },
      ],
    },
  },
  emits: ["update:modelValue", "change", "search"],
  setup(props, { emit }) {
    const formRef = ref();
    const getPopupContainer = () => document.querySelector(".view");
    const dateFormat = "YYYY-MM-DD HH:mm:ss";
    /** 避免 watch 与 select onChange 重复触发 search */
    const syncingRange = ref(false);

    const applyTimeType = (value: string, options?: { emitSearch?: boolean }): void => {
      const nextType = value || props.timeList[0]?.value || "THIS_YEAR";
      // 内置类型刷新 dateRange；自定义（如招商 YYYY-MM）保留原 range，对齐 legacy
      const nextRange = isBuiltinTimeType(nextType)
        ? buildDateRange(nextType)
        : Array.isArray(props.modelValue?.dateRange)
          ? [...props.modelValue.dateRange]
          : ["", ""];
      const next: ModelValueItf = {
        timeType: nextType,
        dateRange: nextRange,
      };
      emit("update:modelValue", next);
      emit("change", next);
      if (options?.emitSearch !== false) {
        emit("search");
      }
    };

    const handleUserChange = (value: string): void => {
      applyTimeType(value, { emitSearch: true });
    };

    // 仅补齐内置类型的 dateRange，不触发 search，避免与父组件 onMounted 重复请求
    watch(
      () => props.modelValue?.timeType,
      (timeType) => {
        if (!timeType || !isBuiltinTimeType(timeType)) return;
        const hasRange = Boolean(props.modelValue?.dateRange?.[0] && props.modelValue?.dateRange?.[1]);
        if (hasRange) return;
        syncingRange.value = true;
        applyTimeType(timeType, { emitSearch: false });
        syncingRange.value = false;
      },
      { immediate: true },
    );

    const changeDate = (_value: string[]): void => {};

    const model = (): ModelValueItf =>
      props.modelValue ?? {
        timeType: "THIS_YEAR",
        dateRange: ["", ""],
      };

    return (): JSX.Element => (
      <a-form layout="inline" model={model()} class="date-inline-form">
        <a-form-item>
          <a-select
            getPopupContainer={getPopupContainer}
            ref={formRef}
            value={model().timeType}
            class="time-type date-inline-select"
            popupClassName="date-inline-dropdown"
            onChange={(v: string) => {
              if (syncingRange.value) return;
              handleUserChange(v);
            }}
            v-slots={{
              suffixIcon: () => <CaretDownOutlined />,
            }}
          >
            {props.timeList.map((item) => (
              <a-select-option key={item.value} value={item.value}>
                {item.label}
              </a-select-option>
            ))}
          </a-select>
        </a-form-item>
        {props.showCustom && (
          <a-form-item>
            <a-range-picker
              value={model().dateRange}
              onUpdate:value={(v: string[]) => {
                emit("update:modelValue", { ...model(), dateRange: v });
              }}
              class="date-range"
              separator="-"
              allowClear={false}
              format={dateFormat}
              valueFormat={dateFormat}
              onChange={changeDate}
              getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
              v-slots={{
                suffixIcon: () => <CalendarOutlined />,
              }}
            />
          </a-form-item>
        )}
        {props.showCustom && (
          <a-form-item class="end-item">
            <a-button type="primary" html-type="submit" size="small">
              查询
            </a-button>
          </a-form-item>
        )}
      </a-form>
    );
  },
});

export default DateInlineForm;
