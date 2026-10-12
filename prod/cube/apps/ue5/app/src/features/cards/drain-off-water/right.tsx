import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsDeviceTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import changeBar from "@/shared-ui/panel/changeBar";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import pieList from "@/shared-ui/panel/pieList";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    interface RoundPie {
      label: string;
      value: number;
      color: string;
    }
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
        label: "",
        unit: "%",
      },
    ]);
    const faultRate = ref<number>(0);
    const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
    const { globalState } = useStateStore();
    const eventNum = ref<number>(0);
    const handleTime = ref<ModelValueItf>();
    const roundPieData = ref<RoundPie[]>([]);
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const { getEquipmentNumber } = useCommon();
    const timer = ref<any>(null);
    onMounted(() => {
      init();
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    const init = () => {
      equipmentStatistic();
      areaAlarmStatistic();
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
      eventNum.value = res.deviceNum;
      roundPieData.value.length = 0;
      res.deviceGenreNums.forEach((item, index) => {
        let obj = {
          label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colors[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
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
      const res = await statisticsDeviceTop(params);
      areaAlarmRank.value = res;
    };
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        init();
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
      },
    );

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备类型分布">
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData.value} eventNum={eventNum.value}>
                <div class="content">
                  <span> {eventNum.value}</span>
                  <br />
                  设备总数
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率" class="alarm-event">
            <div class="equipmentInfo">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警Top5" class="alarm-event">
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
            <div class="body" style="min-height: 250px">
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
            <div class="body" style="min-height: 250px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
