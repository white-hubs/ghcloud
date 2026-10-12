import moment from "moment";
import { defineComponent, onMounted, reactive, type PropType } from "vue";

import { getOperatorLogs } from "@/infrastructure/api/alarm";

import "./flow.module.less";

export const AlarmFlow = defineComponent({
  name: "AlarmFlow",
  props: {
    id: { type: [String, Number] as PropType<string | number | null>, default: null },
  },
  setup(props) {
    const state = reactive<{ flowList: any[] }>({
      flowList: [],
    });

    const getData = (): void => {
      if (!props.id) return;
      void getOperatorLogs({ id: props.id }).then((res: any[]) => {
        state.flowList = (res || []).map((item) => ({
          ...item,
          operatorTime: moment(item.operatorTime).format("YYYY-MM-DD HH:mm:ss"),
        }));
      });
    };

    onMounted(() => {
      getData();
    });

    return (): JSX.Element => (
      <div class="flow-box">
        <div class="alarmDetail-flow">
          {state.flowList.map((item) => (
            <div class="alarmDetail-flow-item" key={item.id}>
              <div class="flow-time">
                <div class="flow-icon"></div>
                <div>{item.operatorTime}</div>
              </div>
              <div class="flow-content">
                <div>操作人：{item?.operatorByName ?? "--"}</div>
              </div>
              <div class="flow-content">
                <div>处理内容：{item?.operatorContent ?? "--"}</div>
              </div>
            </div>
          ))}
          {state.flowList.length === 0 && <div>暂无流程</div>}
        </div>
      </div>
    );
  },
});

export default AlarmFlow;
