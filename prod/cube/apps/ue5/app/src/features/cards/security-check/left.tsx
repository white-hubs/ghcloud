import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import stackedBarChart from "../Information-release/stacked-bar-chart";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { offlineNum } from "@/infrastructure/api/device";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import traffic from "@/shared-ui/panel/traffic";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const trafficList = reactive([
      {
        color: "#2989FF",
        label: "离线",
        value: 0,
      },
      {
        color: "#F14545",
        label: "离线率",
        value: "0",
      },
    ]);
    const faultList = reactive([
      {
        color: "#2989FF",
        label: "故障",
        value: 0,
      },
      {
        color: "#FFAB10",
        label: "故障率",
        value: "0",
      },
    ]);
    const roundPieData = ref([]);
    const roundPieList = ref([]);
    const equipmentSituation = reactive({
      xData: [],
      yData: [
        {
          color: "#2F8DFF",
          name: "在线",
          data: [],
          value: 0,
        },
        {
          color: "#F14545",
          name: "离线",
          data: [],
          value: 0,
        },
      ],
    });
    const deviceStatistic = ref([]);
    const alarmTotal = ref(0);
    const monitorSituationPieData = ref([]);
    const faultPieData = ref([]);
    const column = [
      {
        title: "正常",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "数量",
        dataIndex: "number",
      },
      {
        title: "占比",
        dataIndex: "value",
        width: 140,
      },
    ];
    const listData = ref([]);
    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res = await equipmentTotal(params);
      if (!res.deviceNum) {
        return;
      }
      monitorSituationPieData.value.length = 0;
      faultPieData.value.length = 0;
      deviceStatistic.value.length = 0;
      listData.value.length = 0;
      roundPieData.value.length = 0;
      roundPieList.value.length = 0;
      alarmTotal.value = 0;
      let total = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        monitorSituationPieData.value.push(obj);
        deviceStatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
          color: colorList[index],
          alarmNum: item.num,
        });
        const deviceList = {
          name: deviceStatusType[item.name],
          value: ((item.num / res.deviceNum) * 100).toFixed(2),
          number: item.num,
        };
        listData.value.push(deviceList);
        if (item.name === "NORMAL") {
          total += item.num;
          let obj = {
            label: deviceStatusType[item.name],
            color: "#FFAB10",
            value: item.num,
          };
          faultPieData.value.push(obj);
        } else if (item.name === "TROUBLE") {
          total += item.num;
          faultList[0].value = item.num;
          faultList[1].value = total ? ((item.num / total) * 100).toFixed(0) + "%" : "0%";
          let obj = {
            label: deviceStatusType[item.name],
            color: "#F14545",
            value: item.num,
          };
          faultPieData.value.push(obj);
        }
      });
      res.deviceGenreNums.forEach((item, index) => {
        let obj = {
          name: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colorList[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
        roundPieList.value.push({
          label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colorList[index],
          value: item.num,
        });
      });
    };
    const offLineDevice = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        applicationCode: "SECURITY_CHECKP",
      };
      const res = await offlineNum(params);
      equipmentSituation.xData.length = 0;
      equipmentSituation.yData[0].data.length = 0;
      equipmentSituation.yData[1].data.length = 0;
      equipmentSituation.yData[0].value = 0;
      equipmentSituation.yData[1].value = 0;
      trafficList[0].value = res.offlineNum;
      trafficList[1].value = res.totalNum ? ((res.offlineNum / res.totalNum) * 100).toFixed(0) + "%" : "0%";
      res.areaOfflineareaOffline.forEach((item) => {
        equipmentSituation.xData.push(item.areaName);
        equipmentSituation.yData[0].data.push(item.onNum);
        equipmentSituation.yData[1].data.push(item.offlineNum);
        equipmentSituation.yData[0].value += item.onNum;
        equipmentSituation.yData[1].value += item.offlineNum;
      });
    };
    onMounted(() => {
      deviceDataInfo();
      offLineDevice();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="安检通道设备监控" class="alarm-event">
            <GridContainer data={deviceStatistic.value}></GridContainer>
            <div class="flex-between mg-10">
              <PlanPie pieData={monitorSituationPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={monitorSituationPieData.value}></PieList>
            </div>
            <div class="footer">
              {" "}
              <RollTable column={column} data={listData.value} limitScrollNum={4}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线" class="alarm-event">
            <div class="flex-between">
              {trafficList.map((item) => (
                <traffic key={item.color} trafficInfo={item}></traffic>
              ))}
            </div>
            <div class="lineChart">
              {" "}
              <stackedBarChart legendY={"top"} x-data={equipmentSituation.xData} y-data={equipmentSituation.yData} />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备故障" class="alarm-event">
            <div class="flex-between">
              {faultList.map((item) => (
                <traffic key={item.color} trafficInfo={item}></traffic>
              ))}
            </div>
            <div class="flex-between mg-10">
              <PlanPie pieData={faultPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={faultPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
