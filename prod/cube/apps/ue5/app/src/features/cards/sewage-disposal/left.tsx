import moment from "moment";
import { defineComponent } from "vue";
import { ref, onMounted, computed } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import RingChart from "@/shared-ui/panel/charts/ring/ring";
import PieList from "@/shared-ui/panel/pieList";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const { getEquipmentNumber } = useCommon();
    const roundPieData = ref([]);
    const alarmTotal = ref(0);
    const statisticStyle = computed(() => {
      return {
        fontSize: "16px",
        color: "#FFFFFF",
        paddingLeft: "16px",
      };
    });
    const statisticValueStyle = computed(() => (index) => {
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: colors[index % colors.length],
      };
    });
    const alarmCon = ref(0);
    const pieData = ref([]);
    const alarmColumn = [
      {
        title: "设备名称",
        dataIndex: "alarmTargetName",
        width: 120,
      },
      {
        title: "异常情况",
        dataIndex: "alarmTargetTypeName",
      },
      {
        title: "上报时间",
        dataIndex: "alarmTime",
        width: 140,
      },
    ];
    const listData = ref([]);
    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      roundPieData.value.length = 0;
      pieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colors[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
      });
      res.deviceGenreNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          name: item.genreName,
          color: colors[index],
          value: item.num,
        };
        pieData.value.push(obj);
      });
    };
    // 异常设备清单
    const abnormalEquipment = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageSize: 10,
        pageNumber: 1,
      };
      let { records } = await alarmStatisticsList(params);
      listData.value = records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
    };
    onMounted(() => {
      deviceDataInfo();
      abnormalEquipment();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备实时数据">
            <div class="flex-between mg-10">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={roundPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="污水设备分类">
            <div class="chart">
              {" "}
              <RingChart pieData={pieData.value} seriesName="设备类型统计" total={alarmCon.value}></RingChart>
            </div>
            <div class="statistic">
              {pieData.map((item, index) => (
                <div class="statistic-item">
                  <a-statistic value={item.value} valueStyle={statisticStyle.value}>
                    <template>
                      <div class="title flex-start">
                        <div class="box" style={statisticValueStyle(index)}></div>
                        <span> {item.name}</span>
                      </div>
                    </template>
                  </a-statistic>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="异常设备清单">
            {" "}
            <RollTable column={alarmColumn} data={listData.value} limitScrollNum={4}></RollTable>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
