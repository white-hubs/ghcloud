import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import enumeratie from "@/infrastructure/utils/enumeratie";
import { alarmTrend, equipmentAlarmRateData } from "@/infrastructure/utils/requestData/alarm";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import changeBar from "@/shared-ui/panel/changeBar";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf, pieType } from "@/shared-ui/panel/types";
import { AlarmRateList } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { alarmStatusOptions } = enumeratie();
    const { getEquipmentNumber, getAlarmsNumber } = useCommon();
    const { globalState } = useStateStore();

    let timer: any = ref(null);
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    let trend = reactive<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    let alarm = reactive<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const deviceAllModalShow = ref<boolean>(false);
    const deviceAllParameter = reactive({
      areaId: globalState.business.currentAreaId,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      filterAreaIds: [],
      deviceState: undefined,
      dateRange: [],
    });
    let alarmData = ref<number>(0);
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const roundPieData = reactive<pieType[]>([]);
    const eventNum = ref<number>();
    const alarmStatusData = reactive([]);
    const alarmInfo = reactive({
      total: 0,
      chainRatio: 0,
    });
    const xData = reactive({ arr: [] });
    const series = reactive([
      {
        data: [],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "设备总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "报警总数",
        value: 0,
        ringRatio: true,
        label: "",
        unit: "%",
      },
    ]);
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    // 设备实时数据
    const getEquipmentData = async () => {
      let res: any = await getEquipmentNumber();
      roundPieData.length = 0;
      res.deviceStatusNums &&
        res.deviceStatusNums.forEach((item, index) => {
          roundPieData.push({
            label: `${deviceStatusType[item.name]}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
            value: item.num,
            color: colorList[index],
          });
        });
      eventNum.value = res.deviceNum;
    };
    // 设备报警趋势
    const getAlarmTrend = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.dateRange.join(","),
        type: trend.timeType,
      };
      let res: any = await getAlarmsNumber(param);
      let data: any = await alarmTrend(param);
      xData.arr = data.xdata;
      series[0].data = data.ydata;
      alarmStatusData.length = 0;
      res.alarmStatusStatistics.forEach((item) => {
        let obj = {
          alarmStatusName: item.alarmStatusName,
          alarmNum: item.alarmNum,
          color: "",
        };
        alarmStatusOptions.value.forEach((element) => {
          if (item.alarmStatus === element.value) {
            obj.color = element.color;
          }
        });
        alarmStatusData.push(obj);
      });
      alarmInfo.total = res.count;
      alarmInfo.chainRatio = res.ratio;
    };
    // 设备报警率
    const equipmentAlarm = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarm.dateRange.join(","),
        type: alarm.timeType,
      };
      let res = await equipmentAlarmRateData(param);
      alarmData.value = Math.round(Number(res.proportion) * 10000) / 100.0;
      dataList[0].value = res.deviceTotal;
      dataList[1].value = res.alarmNum;
      dataList[1].label = res.chainRatio;
    };

    const init = () => {
      getEquipmentData();
      equipmentAlarm();
      getAlarmTrend();
    };
    onMounted(() => {
      init();
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备实时数据">
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData} eventNum={eventNum.value}>
                <div class="content">
                  <span> {eventNum.value}</span>
                  <br />
                  设备总数
                </div>
              </RoundPie>
              <pieList
                onHandelClickItemize={() => {
                  deviceAllModalShow.value = true;
                }}
                roundPieData={roundPieData}
              ></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警趋势" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trend}
                onUpdate:modelValue={(v) => {
                  Object.assign(trend, v);
                }}
                onSearch={getAlarmTrend}
              ></DateInlineForm>
            </template>
            <OperateDays value={alarmInfo.value.total} title="报警总数">
              <div class="ringRatio">
                <span> 环比</span>
                <div class={["downtriangle", alarmInfo.chainRatio > 0 && "uptriangle"]}></div>
                <div class={[alarmInfo.chainRatio > 0 ? "up" : "down"]}> {alarmInfo.chainRatio + "%"}</div>
              </div>
            </OperateDays>
            <GridContainer style="margin-top: 12px" data={alarmStatusData}></GridContainer>
            <LineChart x-data={xData.arr} series={series}></LineChart>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警率" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarm}
                onUpdate:modelValue={(v) => {
                  Object.assign(alarm, v);
                }}
                onSearch={equipmentAlarm}
              ></DateInlineForm>
            </template>
            <div class="equipmentInfo">
              <waterPolo title value={alarmData.value} unit="%" bgColor="#2989FF" color="#2989FF"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
          <modal-equipmentAll-table
            show-modal={deviceAllModalShow.value}
            onClose={() => {
              deviceAllModalShow.value = false;
            }}
            parameter={deviceAllParameter}
          ></modal-equipmentAll-table>
        </div>
      </>
    );
  },
});

export default Left;
