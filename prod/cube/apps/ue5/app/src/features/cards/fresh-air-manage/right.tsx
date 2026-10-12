import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import { equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import PieList from "@/shared-ui/panel/pieList";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { getEquipmentNumber, getEventTop } = useCommon();
    const { globalState } = useStateStore();

    const faultRate = ref<number>(0);
    const hiddenDangerTime = ref<ModelValueItf>();
    const alarmTotal = ref(0);
    const monitorSituationPieData = ref([]);
    const deviceStatistic = ref([
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "处理中",
        color: "#FFC700",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "挂起",
        color: "#74AEE7",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "已处理",
        color: "#00F27B",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "待确认",
        color: "#29C2FF",
      },
    ]);
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "设备总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "离线总数",
        value: 0,
        ringRatio: true,
        label: 0,
        unit: "%",
      },
    ]);
    const handleTime = ref<ModelValueItf>();
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    // 设备报警趋势
    const changeHandleHiddenDangerTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: hiddenDangerTime.value.dateRange.join(","),
        type: hiddenDangerTime.value.timeType,
      };
      let data: any = await equipmentNumber(param);
      deviceStatistic.value = data.alarmStatusStatistics;
      alarmCon.value.count = data.alarmNum;
      alarmCon.value.ratio = data.chainRatio;
      alarmTotal.value = data.alarmNum;
      monitorSituationPieData.value = data.alarmStatusStatistics.map((item) => {
        return {
          label: item.alarmStatusName,
          value: item.alarmNum,
          color: item.color,
        };
      });
    };
    /**
     * 区域报警Top5
     */
    const areaAlarmStatistic = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      areaAlarmRank.value = await getEventTop(params);
    };
    /**
     * 设备类型分布
     */
    const equipmentStatistic = async () => {
      const res = await getEquipmentNumber();
      if (JSON.stringify(res) === "{}") {
        return;
      }
      res.deviceStatusNums.forEach((item) => {
        if (item.name === "OFFLINE" && res.deviceNum !== 0) {
          faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
          dataList[0].value = res.deviceNum;
          dataList[1].value = item.num;
          dataList[1].label = faultRate.value;
        }
      });
    };
    onMounted(() => {
      equipmentStatistic();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="事件报警top5" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={areaAlarmStatistic}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 190px">
              {areaAlarmRank.map((item, index) => (
                <EventAlarmItem
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率" class="alarm-event">
            <div class="equipmentInfo">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警处理情况" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={hiddenDangerTime.value}
                onUpdate:modelValue={(v) => {
                  hiddenDangerTime.value = v;
                }}
                onSearch={changeHandleHiddenDangerTime}
              ></DateInlineForm>
            </template>
            <OperateDays title="报警数" value={alarmCon.value.count}>
              <div class="extra flex-start">
                <div class="mode"> 环比</div>
                <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
              </div>
            </OperateDays>
            <GridContainer parameter={hiddenDangerTime.value} data={deviceStatistic.value} class="body-bum"></GridContainer>
            <div class="flex-between mg-10">
              <PlanPie pieData={monitorSituationPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 报警总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={monitorSituationPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
