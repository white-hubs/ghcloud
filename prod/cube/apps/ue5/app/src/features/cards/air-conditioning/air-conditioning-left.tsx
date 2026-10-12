import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmRate } from "@/infrastructure/api/models/alarm";
import { alarmTrend, equipmentNumber, equipmentAlarmRateData } from "@/infrastructure/utils/requestData/alarm";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import WaterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import DeviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { AlarmRateList } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./_shared/air-conditioning-v2-shared.module.less";

import styles from "./air-conditioning-left.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel air-conditioning-card-theme access-control-card-theme";

export const AirConditioningLeft = defineComponent({
  name: "AirConditioningLeft",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    let timer: any = ref(null);
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    let alarmRateData = reactive<AlarmRate>({
      proportion: 0,
      deviceTotal: "",
      alarmNum: "",
      chainRatio: "",
    });
    const deviceAllModalShow = ref<boolean>(false);
    const deviceAllParameter = reactive({
      areaId: globalState.business.currentAreaId,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      filterAreaIds: [],
      deviceState: undefined,
      dateRange: [],
    });
    const trend = ref<ModelValueItf>();
    let timeFrame = ref<ModelValueItf>();
    const alarmNum = ref<number>(0);
    const chainRatio = ref<number>(0);
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const roundPieData = reactive([
      { label: "报警", color: "#19F8F7", value: 0 },
      { label: "故障", color: "#FFC700", value: 0 },
      { label: "离线", color: "#EF424A", value: 0 },
    ]);
    const devicesNum = ref(0);
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    const handelClickItemize = (item: { name: string; label: string; value: number }) => {
      const statusType = item.label || item.name;
      Object.assign(deviceAllParameter, {
        deviceState: statusType === "离线" ? false : statusType === "正常" ? true : undefined,
      });
      deviceAllModalShow.value = true;
    };
    let alarmStatusData = reactive([]);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
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
        title: "报警设备总数",
        value: 0,
        ringRatio: true,
        label: 0,
        unit: "%",
      },
    ]);

    const { getEquipmentNumber } = useCommon();

    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      roundPieData.length = 0;
      devicesNum.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        devicesNum.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        roundPieData.push(obj);
      });
    };
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      let data: any = await equipmentNumber(param);
      alarmStatusData = data.alarmStatusStatistics;
      alarmNum.value = data.alarmNum;
      chainRatio.value = data.chainRatio;
      xData.arr = res.xdata;
      series[0].data = res.ydata;
    };
    // 设备报警率
    const equipmentAlarmRateInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      let res = await equipmentAlarmRateData(param);
      alarmRateData.proportion = Math.round(Number(res.proportion) * 10000) / 100.0;
      dataList[0].value = Number(res.deviceTotal);
      dataList[1].value = Number(res.alarmNum);
      dataList[1].label = Math.round(Number(res.chainRatio) * 10000) / 100.0;
    };
    const init = () => {
      deviceDataInfo();
      equipmentAlarmRateInfo();
      alarmTrendInfo();
    };
    onMounted(() => {
      deviceDataInfo();
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

    const renderDeviceRealtimeBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          styles.pieBody,
          isZoom ? styles.zoomBody : "",
          "air-conditioning-card-body",
          isZoom ? ["air-conditioning-v2-panel", "air-conditioning-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <div class={[styles.pieSurface, "air-conditioning-surface"]}>
          <RoundPie data={roundPieData} eventNum={devicesNum.value}>
            <div class={styles.pieContent}>
              <span>{devicesNum.value}</span>
              <br />
              设备总数
            </div>
          </RoundPie>
          <PieList onHandelClickItemize={handelClickItemize} roundPieData={roundPieData} class={isZoom ? "pie-list-zoom" : undefined} />
        </div>
      </div>
    );

    const renderAlarmTrendBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          styles.trendBody,
          isZoom ? styles.zoomBody : "",
          "air-conditioning-card-body",
          isZoom ? ["air-conditioning-v2-panel", "air-conditioning-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <OperateDays value={alarmNum.value} title="报警总数">
          <div class={styles.ringRatio}>
            <span>环比</span>
            <div class={[styles.downtriangle, chainRatio.value > 0 ? styles.uptriangle : ""]} />
            <div class={chainRatio.value > 0 ? "up" : "down"}>{chainRatio.value}%</div>
          </div>
        </OperateDays>
        <div class={[styles.statusSurface, "air-conditioning-surface"]}>
          <GridContainer data={alarmStatusData} />
        </div>
        <div class={[styles.chartSurface, "air-conditioning-chart-surface", "air-conditioning-surface"]}>
          <LineChart x-data={xData.arr} series={series} title="次" />
        </div>
      </div>
    );

    const renderAlarmRateBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          styles.rateBody,
          isZoom ? styles.zoomBody : "",
          "air-conditioning-card-body",
          isZoom ? ["air-conditioning-v2-panel", "air-conditioning-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <div class={[styles.rateSurface, "air-conditioning-surface"]}>
          <div class={styles.liquidChart}>
            <WaterPolo
              title=""
              value={alarmRateData.proportion}
              unit="%"
              bgColor="rgba(41, 137, 255, 0.16)"
              color="#2989FF"
              percentage
              responsive
            />
          </div>
          <DeviceModule data-list={dataList} />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class={[styles.panelColumn, "air-conditioning-v2-root"]}>
        <SubPanelTemplate
          title="设备实时数据"
          class={PANEL_CLASS}
          zoomable
          zoom-title="设备实时数据详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="air-conditioning-realtime" />,
            "zoom-content": () => renderDeviceRealtimeBody(true),
            default: () => renderDeviceRealtimeBody(false),
          }}
        />
        <SubPanelTemplate
          title="设备报警趋势"
          class={PANEL_CLASS}
          zoomable
          zoom-title="设备报警趋势详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="air-conditioning-trend" />,
            extra: () => (
              <div class="air-conditioning-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={trend.value}
                  onUpdate:modelValue={(v) => {
                    trend.value = v;
                  }}
                  onSearch={alarmTrendInfo}
                />
              </div>
            ),
            "zoom-content": () => renderAlarmTrendBody(true),
            default: () => renderAlarmTrendBody(false),
          }}
        />
        <SubPanelTemplate
          title="设备报警率"
          class={PANEL_CLASS}
          zoomable
          zoom-title="设备报警率详情"
          zoom-width={800}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="air-conditioning-rate" />,
            extra: () => (
              <div class="air-conditioning-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = v;
                  }}
                  onSearch={equipmentAlarmRateInfo}
                />
              </div>
            ),
            "zoom-content": () => renderAlarmRateBody(true),
            default: () => renderAlarmRateBody(false),
          }}
        />
        <ModalEquipmentAllTable
          show-modal={deviceAllModalShow.value}
          onClose={() => {
            deviceAllModalShow.value = false;
          }}
          parameter={deviceAllParameter}
        />
      </div>
    );
  },
});

export default AirConditioningLeft;
