import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import styles from "./changeBar.module.less";

export const ChangeBar = defineComponent({
  name: "ChangeBar",
  emits: ["changeDate"],
  setup(_props, ctx) {
    interface data {
      label: string;
      value: string;
    }
    interface Props {
      dateList: data[];
      flag: boolean;
    }
    const dateFormat = "YYYY-MM-DD HH:mm:ss";
    const dateList = [
      {
        label: "今日",
        value: "TODAY",
      },
      {
        label: "本周",
        value: "THIS_WEEK",
      },
      {
        label: "本月",
        value: "THIS_MONTH",
      },
      {
        label: "今年",
        value: "THIS_YEAR",
      },
    ];

    const emit = ctx.emit;
    const value1 = ref("today");
    const changeEvent = (params: any) => {
      let model_value = {
        timeType: "TODAY",
        dateRange: [],
      };
      model_value.timeType = params.target.value;
      if (params.target.value === "TODAY") {
        model_value.dateRange = [moment().format("YYYY-MM-DD 00:00:00"), moment().format(dateFormat)];
      } else if (params.target.value === "THIS_WEEK") {
        model_value.dateRange = [moment().startOf("week").format("YYYY-MM-DD 00:00:00"), moment().endOf("week").format(dateFormat)];
      } else if (params.target.value === "THIS_MONTH") {
        model_value.dateRange = [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)];
      } else if (params.target.value === "THIS_YEAR") {
        model_value.dateRange = [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(dateFormat)];
      }
      emit("changeDate", model_value);
    };
    onMounted(() => {
      value1.value = dateList[0].value;
      let obj = {
        target: {
          value: "TODAY",
        },
      };
      changeEvent(obj);
    });

    return (): JSX.Element => (
      <>
        <div class="radioBar">
          <a-radio-group
            onChange={changeEvent}
            value={value1.value}
            onUpdate:value={(v) => {
              value1.value = v;
            }}
          >
            {dateList.map((item) => (
              <a-radio-button value={item.value}> {item.label}</a-radio-button>
            ))}
          </a-radio-group>
        </div>
      </>
    );
  },
});

export default ChangeBar;
