import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { analysisRealTime } from "@/infrastructure/api/securitymanagement";
import bus from "@/infrastructure/utils/bus";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import Pie from "@/shared-ui/panel/pie";
import TipsCount from "@/shared-ui/panel/tipsCount";
import { AlarmRateList } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { takeNotes, getAlarmTakeNotes, getAlarmsNumber, getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();

    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    const faultRate = ref<number>(0);
    let pieData = reactive([]);
    let listData = reactive([]);
    let alarmsNumber = ref<number>(0);
    const column = reactive([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);
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
    const titles = ref<string[]>(["CO浓度", "能见度", "亮度", "风速"]);
    const xData = ref<string[]>([]);
    const yData = ref<
      {
        name: string;
        data: number[];
        linearGradientColor?: string[];
        lineColor?: string;
        showSymbol?: boolean;
        smooth?: boolean;
        symbolSize?: number;
      }[]
    >([
      {
        name: "CO浓度",
        data: [],
        linearGradientColor: ["#328BF7", "#328BF7"],
      },
      {
        name: "能见度",
        data: [],
        linearGradientColor: ["#19F8F7", "#19F8F7"],
      },
      {
        name: "亮度",
        data: [],
        linearGradientColor: ["#FFC700", "#FFC700"],
      },
      {
        name: "风速",
        data: [],
        linearGradientColor: ["#EF424A", "#EF424A"],
      },
    ]);

    const trendAnalysis = ref("INLET_SECTION");
    const trendList = ref<{ label: string; value: string }[]>([
      {
        label: "入口段",
        value: "INLET_SECTION",
      },
      {
        label: "基本段",
        value: "BASIC_SEGMENT",
      },
      {
        label: "出口段",
        value: "EXIT_SECTION",
      },
    ]);
    const handleChange = async () => {
      const res = await analysisRealTime(trendAnalysis.value);
      xData.value = res.xtitle.map((item) => {
        return item + "时";
      });
      yData.value[0].data = res.xtitle.map((xItem) => {
        return res.co.find((item) => item.timeFlag === xItem) ? res.co.find((item) => item.timeFlag === xItem).fieldData : 0;
      });
      yData.value[1].data = res.xtitle.map((xItem) => {
        return res.visibility.find((item) => item.timeFlag === xItem)
          ? res.visibility.find((item) => item.timeFlag === xItem).fieldData
          : 0;
      });
      yData.value[2].data = res.xtitle.map((xItem) => {
        return res.brightness.find((item) => item.timeFlag === xItem)
          ? res.brightness.find((item) => item.timeFlag === xItem).fieldData
          : 0;
      });
      yData.value[3].data = res.xtitle.map((xItem) => {
        return res.windSpeed.find((item) => item.timeFlag === xItem) ? res.windSpeed.find((item) => item.timeFlag === xItem).fieldData : 0;
      });
    };
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
    // 报警记录
    async function changeTakeNotes() {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: takeNotes.value.dateRange.join(","),
        type: takeNotes.value.timeType,
        pageSize: 1000,
        pageNumber: 1,
      };
      let data = await getAlarmTakeNotes(param);
      alarmCon.value = await getAlarmsNumber(param);
      listData = data.listData;
      alarmsNumber.value = data.alarmsNumber;
      pieData = data.pieData;
    }
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    onMounted(() => {
      equipmentStatistic();
      handleChange();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="实时隧道环境指标趋势分析">
            <template>
              <a-select
                ref="select"
                value={trendAnalysis.value}
                onUpdate:value={(v) => {
                  trendAnalysis.value = v;
                }}
                style="width: 70px; height: 28px"
                class="time-type"
                onChange={handleChange}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {trendList.map((item, i) => (
                  <a-select-option value={item.value}> {item.label}</a-select-option>
                ))}
              </a-select>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={true}
                showBackground={true}
                titles={titles.value}
                gridTop="15"
                unit={{ x: "", y: "" }}
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警记录">
            <template>
              {" "}
              <DateInlineForm
                modelValue={takeNotes}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={changeTakeNotes}
              ></DateInlineForm>
            </template>
            <div class="body">
              <OperateDays title="报警总数" value={alarmCon.value.count} class="body-num"></OperateDays>
              <div class="pie-chart">
                <Pie data={alarmsNumber.value} x-data={pieData} />
                {pieData.map((item, index) => (
                  <TipsCount status={String(index)} count={item.value} />
                ))}
              </div>
              <div class="footer">
                <RollTable column={column} data={listData} onClickRow={handelClickRow}>
                  <template>
                    {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                    {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                    <span style="color: #00f27b"> 已处理</span>
                  </template>
                </RollTable>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率" class="alarm-event">
            <div class="equipmentInfo">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
