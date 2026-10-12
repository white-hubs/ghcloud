import { RangePicker } from "ant-design-vue/es";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { defineComponent, ref, computed } from "vue";

import { Select } from "@ghcloud/cube-ui";

import styles from "./date-select.module.less";

dayjs.extend(quarterOfYear);

/** 挂 body；UE5 用 visual-data-modal-dropdown 跟主题色，保留虚线选区不被裁切 */
export const SECURITY_ANALYSIS_DATE_POPUP_CLASS = "security-analysis-date-popup visual-data-modal-dropdown";

type DateRange = [Dayjs, Dayjs] | [string, string];
type DateStringRange = [string, string];
type PickerType = "date" | "month" | "quarter" | "year";

export const DateSelect = defineComponent({
  props: {
    onChange: {
      type: Function,
      default: undefined,
    },
  },
  emits: ["update:value", "change"],
  setup: (props, { emit }) => {
    // 获取本月的开始和结束日期
    const getMonthRange = (): [Dayjs, Dayjs] => {
      const start = dayjs().startOf("month");
      const end = dayjs().endOf("month");
      return [start, end];
    };

    // 获取当日的开始和结束（均为当日）
    const getDayRange = (): [Dayjs, Dayjs] => {
      const start = dayjs().startOf("month");
      const today = dayjs();
      return [start, today];
    };

    // 获取本季度的开始和结束日期
    const getQuarterRange = (): [Dayjs, Dayjs] => {
      const start = dayjs().startOf("quarter");
      const end = dayjs().endOf("quarter");
      return [start, end];
    };

    // 获取本年的开始和结束日期
    const getYearRange = (): [Dayjs, Dayjs] => {
      const start = dayjs().startOf("year");
      const end = dayjs().endOf("year");
      return [start, end];
    };

    // 日期范围值，默认为当日
    const dateRange = ref<DateRange>(getDayRange());
    // 左侧选择器的值，默认为日
    const selectValue = ref<string | null>("MONTH");
    // 右侧日期选择器的类型
    const currentPicker = ref<PickerType>("month");

    const dateFormat = computed(() => {
      switch (currentPicker.value) {
        case "date":
          return "YYYY-MM-DD";
        case "month":
          return "YYYY-MM";
        case "quarter":
          return "YYYY-Q[季度]";
        case "year":
          return "YYYY";
        default:
          return "YYYY-MM-DD";
      }
    });

    const disabledDate = computed(() => {
      return (current: Dayjs): boolean => {
        const now = dayjs();
        switch (currentPicker.value) {
          case "date":
            return current && current > now.endOf("day");
          case "month":
            return current && current > now.endOf("month");
          case "quarter":
            return current && current > now.endOf("quarter");
          case "year":
            return current && current > now.endOf("year");
          default:
            return false;
        }
      };
    });

    // 根据选择器的值更新日期范围和选择器类型
    const updateDateRangeBySelect = (value: string): void => {
      selectValue.value = value;
      const todayForCap = dayjs(); // Represents today, for capping purposes

      let newRange: [Dayjs, Dayjs];

      switch (value) {
        case "DAY":
          newRange = getDayRange(); // [dayjs(), dayjs()]
          currentPicker.value = "date";
          break;
        case "MONTH":
          newRange = getMonthRange(); // [startOfMonth, endOfMonth]
          if (newRange[1].isAfter(todayForCap, "day")) {
            newRange[1] = todayForCap;
          }
          // Ensure start date is not after capped end date
          if (newRange[0].isAfter(newRange[1], "day")) {
            newRange[0] = newRange[1].clone(); // or .startOf('day') if preferred
          }
          currentPicker.value = "month";
          break;
        case "QUARTER":
          newRange = getQuarterRange();
          if (newRange[1].isAfter(todayForCap, "day")) {
            newRange[1] = todayForCap;
          }
          if (newRange[0].isAfter(newRange[1], "day")) {
            newRange[0] = newRange[1].clone();
          }
          currentPicker.value = "quarter";
          break;
        case "YEAR":
          newRange = getYearRange();
          if (newRange[1].isAfter(todayForCap, "day")) {
            newRange[1] = todayForCap;
          }
          if (newRange[0].isAfter(newRange[1], "day")) {
            newRange[0] = newRange[1].clone();
          }
          currentPicker.value = "year";
          break;
        default:
          newRange = getDayRange();
          currentPicker.value = "date";
      }
      // Normalize to full days for the dateRange value
      dateRange.value = [newRange[0].startOf("day"), newRange[1].endOf("day")];

      // 触发外部事件
      if (dateRange.value) {
        emitChange(dateRange.value as [Dayjs, Dayjs]);
      }
    };

    // 触发变更事件
    const emitChange = (dates: [Dayjs, Dayjs]): void => {
      const formatStr = "YYYY-MM-DD"; // 始终使用 YYYY-MM-DD 格式
      const dateStrings: DateStringRange = [dates[0].format(formatStr), dates[1].format(formatStr)];
      emit("update:value", dates);
      emit("change", dates, dateStrings);
      if (typeof props.onChange === "function") {
        props.onChange(dates, dateStrings);
      }
    };

    // 处理日期选择器变更
    const handleDateChange = (value: DateRange | null): void => {
      if (value) {
        dateRange.value = value;
        emitChange(dateRange.value as [Dayjs, Dayjs]);
      } else {
        // 如果用户清空了日期选择器，可以根据当前维度重置或采取其他逻辑
        // 这里暂时保持不变，或者可以根据 selectValue.value 重新获取默认值
        if (selectValue.value) {
          updateDateRangeBySelect(selectValue.value);
        }
      }
      // 当手动选择日期后，清除左侧快捷选择的状态，或保持联动，根据产品需求决定
      // selectValue.value = null; // 如果希望清除快捷选择状态
    };

    return (): JSX.Element => (
      <>
        <Select
          value={selectValue.value}
          style={{ width: "120px" }}
          placeholder={"选择维度"}
          size={"large"}
          dropdownClassName={SECURITY_ANALYSIS_DATE_POPUP_CLASS}
          onChange={(value: string) => {
            updateDateRangeBySelect(value);
          }}
          options={[
            { value: "MONTH", label: "月" },
            { value: "QUARTER", label: "季" },
            { value: "YEAR", label: "年" },
            { value: "DAY", label: "日" },
          ]}
          allowClear={false} // 通常维度选择不允许清除
          getPopupContainer={() => document.body}
        />
        <div class={styles["security-analysis-title-picker"]}>
          <RangePicker
            value={dateRange.value as [Dayjs, Dayjs]} // 强制类型转换，确保value符合RangePicker预期
            allowClear={true} // 允许用户清除日期选择
            onChange={handleDateChange}
            size={"large"}
            picker={currentPicker.value}
            format={dateFormat.value} // 应用动态的日期格式
            disabledDate={disabledDate.value} // 禁用未来时间
            popupClassName={SECURITY_ANALYSIS_DATE_POPUP_CLASS}
            getPopupContainer={() => document.body}
          />
        </div>
      </>
    );
  },
});
