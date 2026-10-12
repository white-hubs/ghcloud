import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolTodayStatistics } from "@/infrastructure/api/door";

import styles from "./patrolStatistics.module.less";

export const PatrolStatistics = defineComponent({
  name: "PatrolStatistics",
  setup(_props, ctx) {
    const transactionList = ref([
      {
        label: "巡更人员",
        value: "0",
        unit: "名",
        flag: "personNum",
      },
      {
        label: "巡更点位",
        value: "0",
        unit: "个",
        flag: "pointNum",
      },
      {
        label: "巡更实时耗时",
        value: "0",
        unit: "小时",
        flag: "elapsedTime",
      },
    ]);
    const getPatrolTodayStatistics = async () => {
      const res = await patrolTodayStatistics({ type: "TODAY" });
      transactionList.value = transactionList.value.map((e) => {
        return {
          ...e,
          value: res[e.flag],
        };
      });
    };
    onMounted(() => {
      getPatrolTodayStatistics();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="今日巡更统计">
          <div class="environment-box">
            {transactionList.map((item) => (
              <div class="environment-item">
                <div class="environment-item-title"> {item.label}</div>
                <div class="environment-item-box">
                  <div class="environment-item-value"> {item.value || 0}</div>
                  <div class="environment-item-unit"> {item.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PatrolStatistics;
