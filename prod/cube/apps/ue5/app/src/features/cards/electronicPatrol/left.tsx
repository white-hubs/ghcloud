import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import abnormalPatrolPoint from "./components/abnormalPatrolPoint";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { routeList, getPalnStatus } from "@/infrastructure/api/maintain";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const deviceStatistic = ref([
      {
        alarmStatusName: "执行中",
        code: "ENABLE",
        alarmNum: 0,
        color: "#328BF7",
      },
      {
        alarmStatusName: "已停用",
        code: "STOP",
        alarmNum: 0,
        color: "#FFC700",
      },
      {
        alarmStatusName: "已结束",
        code: "END",
        alarmNum: 0,
        color: "#EF424A",
      },
    ]);
    const total = ref(0);
    const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([
      {
        label: "执行中",
        value: 0,
        color: "#328BF7",
      },
      {
        label: "已停用",
        value: 0,
        color: "#FFC700",
      },
      {
        label: "已结束",
        value: 0,
        color: "#EF424A",
      },
    ]);
    const routeColumn = [
      {
        title: "巡更路线",
        dataIndex: "patrolRouteName",
        width: 120,
      },
      {
        title: "巡更点数量",
        dataIndex: "patrolLocationNumber",
      },
    ];
    const listData = ref([]);

    const getPatrolRoute = async () => {
      listData.value = await routeList();
    };
    const guardTourPlan = async () => {
      const res = await getPalnStatus();
      total.value = 0;
      deviceStatistic.value.forEach((item, index) => {
        total.value += res[index].value;
      });
      deviceStatistic.value.forEach((item, index) => {
        res.forEach((data) => {
          if (item.code === data.name) {
            item.alarmNum = data.value;
            monitorSituationPieData.value[index].value = data.value;
          }
        });
      });
    };

    onMounted(() => {
      getPatrolRoute();
      guardTourPlan();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="巡更路线">
            {" "}
            <div class="footer">
              {" "}
              <RollTable column={routeColumn} data={listData.value} limitScrollNum={4}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡更计划">
            <GridContainer data={deviceStatistic.value}></GridContainer>
            <div class="flex-between mg-10">
              <PlanPie pieData={monitorSituationPieData.value}>
                <div class="content">
                  <div class="total-num"> {total.value}</div>
                  <div> 计划总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={monitorSituationPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
          <abnormalPatrolPoint></abnormalPatrolPoint>
        </div>
      </>
    );
  },
});

export default Left;
