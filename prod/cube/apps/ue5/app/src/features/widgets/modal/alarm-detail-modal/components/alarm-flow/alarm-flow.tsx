import moment from "moment";
import { defineComponent, reactive, onMounted } from "vue";

import { getOperatorLogs } from "@/infrastructure/api/alarm";

import styles from "./alarm-flow.module.less";

export const AlarmFlow = defineComponent({
  props: {
    alarmData: {
      type: Object,
      default: {},
    },
  },
  setup(props) {
    const state = reactive({
      flowList: [],
    });

    const getData = (): void => {
      getOperatorLogs({ id: props.alarmData.id }).then((res) => {
        state.flowList = res.map((item: { operatorTime: moment.MomentInput }) => ({
          ...item,
          operatorTime: moment(item.operatorTime).format("YYYY-MM-DD HH:mm:ss"),
        }));
      });
    };

    onMounted(() => {
      getData();
    });

    return () => (
      <div class={styles.flowBox}>
        <div class={styles.alarmDetailFlow}>
          {state.flowList.length > 0 ? (
            state.flowList.map((item) => (
              <div class={styles.alarmDetailFlowItem} key={item.id}>
                <div class={styles.flowTime}>
                  <div class={styles.flowIcon} />
                  <div>{item.operatorTime}</div>
                </div>
                <div class={styles.flowContent}>
                  <div>操作人：{item?.operatorByName ?? "--"}</div>
                </div>
                <div class={styles.flowContent}>
                  <div>处理内容：{item?.operatorContent ?? "--"}</div>
                </div>
              </div>
            ))
          ) : (
            <div>暂无流程</div>
          )}
        </div>
      </div>
    );
  },
});
