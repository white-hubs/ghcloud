import { defineComponent } from "vue";

import { Button, DateRangePicker } from "@ghcloud/cube-ui";

import type { TimeFilter, TimeFilterType } from "@/types/dashboard";

export const TimeFilterBar = defineComponent({
  name: "TimeFilterBar",
  props: {
    value: { type: Object as () => TimeFilter, required: true },
    onChange: { type: Function as unknown as () => (v: TimeFilter) => void, required: true },
  },
  setup(props) {
    const timeOptions: Array<{ key: TimeFilterType; label: string }> = [
      { key: "today", label: "今天" },
      { key: "7d", label: "近7天" },
      { key: "30d", label: "近30天" },
    ];

    const getCustomRange = (): [string, string] => {
      return props.value.type === "custom" ? (props.value.period ?? ["", ""]) : ["", ""];
    };

    const onCustomRangeChange = (range: [string, string]): void => {
      const [start, end] = range;
      if (!start || !end) {
        props.onChange({ type: "custom" });
        return;
      }
      props.onChange({ type: "custom", period: [start, end] });
    };

    return () => (
      <div class="time-row">
        {timeOptions.map((it) => (
          <Button size="small" type={props.value.type === it.key ? "primary" : "default"} onClick={() => props.onChange({ type: it.key })}>
            {it.label}
          </Button>
        ))}
        <DateRangePicker
          size="small"
          class={props.value.type === "custom" ? "time-range-picker time-range-picker-active" : "time-range-picker"}
          value={getCustomRange()}
          valueFormat="YYYY-MM-DD"
          format="YYYY-MM-DD"
          placeholder={["开始", "结束"]}
          onChangePicker={onCustomRangeChange}
        />
      </div>
    );
  },
});
