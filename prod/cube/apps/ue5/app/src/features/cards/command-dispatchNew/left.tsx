import { defineComponent } from "vue";
import { reactive, ref } from "vue";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { departmentHandlerTop, deviceTagGroupSearch, recordStatus, statisticsLevel } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const alarmtimeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const eventTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmModalShow = ref<boolean>(false);
    const parameter = reactive({
      alarmLevelCode: "",
      alarmStatus: "",
      dateRange: [],
      departmentId: "",
      deviceTags: [
        "builtin.app::SECURITY_MONITORING",
        "builtin.app::ELECTRICMANAGE",
        "builtin.app::FIRECONTROL",
        "builtin.app::GAS_MANAGEMENT",
        "builtin.app::ROTATINGMANAGE",
      ].toString(),
    });
    const deviceStatisticsData = reactive({
      title: "报警总数",
      total: 48,
      itemize: [
        {
          name: "已处理数",
          label: "未处理数",
          value: 23,
          offline: 15,
          key: "OFFLINE",
        },
      ],
    });
    const detectionData = ref([]);
    const contentList = ref([]);
    const alarmTotal = ref(370);
    const handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const alarmEventTop = async () => {
      let params = {
        deviceTags:
          [
            "builtin.app::SECURITY_MONITORING",
            "builtin.app::ELECTRICMANAGE",
            "builtin.app::FIRECONTROL",
            "builtin.app::GAS_MANAGEMENT",
            "builtin.app::ROTATINGMANAGE",
          ] + "",
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        type: eventTime.value.timeType,
      };
      const res = await statisticsLevel(params);
      const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
      alarmTotal.value = 0;
      detectionData.value = res.map((item, index) => {
        alarmTotal.value += item.alarmNum;
        return {
          name: item.name,
          value: item.alarmNum,
          color: colorList[index],
        };
      });
      const data = await recordStatus(params);
      deviceStatisticsData.total = data.alarmNum;
      deviceStatisticsData.itemize[0].value = data.alarmUnresolvedHandlerNum;
      deviceStatisticsData.itemize[0].offline = data.alarmHandlerNum;
    };
    const areaAlarmStatistic = async () => {
      let params = {
        areaId: globalState.business.currentAreaId,
        type: handleTime.value.timeType,
        deviceTags: [
          "builtin.app::SECURITY_MONITORING",
          "builtin.app::ELECTRICMANAGE",
          "builtin.app::FIRECONTROL",
          "builtin.app::GAS_MANAGEMENT",
          "builtin.app::ROTATINGMANAGE",
        ],
        period: handleTime.value.dateRange.join(","),
      };
      areaAlarmRank.value = await departmentHandlerTop(params);
    };
    const changeDate = async () => {
      let params = {
        areaId: globalState.business.currentAreaId,
        type: alarmtimeType.value.timeType,
        period: alarmtimeType.value.dateRange.join(","),
        deviceTags: [
          "builtin.app::SECURITY_MONITORING",
          "builtin.app::ELECTRICMANAGE",
          "builtin.app::FIRECONTROL",
          "builtin.app::GAS_MANAGEMENT",
          "builtin.app::ROTATINGMANAGE",
        ],
      };
      const res = await deviceTagGroupSearch(params);
      const obj = {
        "builtin.app::SECURITY_MONITORING": "安防监控",
        "builtin.app::ELECTRICMANAGE": "电气安全",
        "builtin.app::FIRECONTROL": "消防安全",
        "builtin.app::GAS_MANAGEMENT": "用气安全",
        "builtin.app::ROTATINGMANAGE": "动环监控",
      };
      contentList.value = res.map((item) => {
        return {
          name: obj[item.code],
          value: item.ratio,
        };
      });
    };
    const openAlarm = (value) => {
      if (value === "未处理数") {
        parameter.alarmStatus = "ALARM_UN_CONFIRMED";
      } else if (value === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      } else {
        parameter.alarmStatus = "";
      }
      parameter.dateRange = eventTime.value.dateRange;
      // alarmStatus
      alarmModalShow.value = true;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const alarmClickBar = (value) => {
      const obj = {
        一级: "one_level",
        二级: "two_level",
        三级: "three_level",
        四级: "four_level",
      };
      parameter.alarmStatus = undefined;
      parameter.departmentId = undefined;
      parameter.dateRange = eventTime.value.dateRange;
      if (value.name) {
        parameter.alarmLevelCode = obj[value.name.substring(0, 2)];
      } else {
        parameter.alarmLevelCode = obj[value.data.name.substring(0, 2)];
      }
      alarmModalShow.value = true;
    };
    const departmentalRanking = (value) => {
      parameter.dateRange = handleTime.value.dateRange;
      parameter.deviceTags = [
        "builtin.app::SECURITY_MONITORING",
        "builtin.app::ELECTRICMANAGE",
        "builtin.app::FIRECONTROL",
        "builtin.app::GAS_MANAGEMENT",
        "builtin.app::ROTATINGMANAGE",
      ].toString();
      parameter.alarmStatus = "ALARM_HANDLER";
      parameter.alarmLevelCode = undefined;
      parameter.departmentId = value.id;
      alarmModalShow.value = true;
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警级别统计" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={eventTime.value}
                onUpdate:modelValue={(v) => {
                  eventTime.value = v;
                }}
                onSearch={alarmEventTop}
              ></DateInlineForm>
            </template>
            <DeviceStatistics
              onHandelClickItemize={openAlarm}
              imgPath="business-icon/triage-queue/10.png"
              statistic={deviceStatisticsData}
            ></DeviceStatistics>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie onClickbar={alarmClickBar} pieData={detectionData.value}>
                  <div style="color: #fff;text-align: center;font-size: 0.072rem;"> {alarmTotal.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 0.062rem;"> 报警总数（个）</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList
                onHandlecurrent={alarmClickBar}
                showRatio={true}
                contentList={detectionData.value}
                class="pie_list"
              ></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警处理排名" class="alarm-event">
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
            <div class="body" style="min-height: 250px;cursor: pointer;">
              {areaAlarmRank.map((item, index) => (
                <EventAlarmItem
                  onClick={departmentalRanking(item)}
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
          <SubPanelTemplate title="报警正确率">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmtimeType.value}
                onUpdate:modelValue={(v) => {
                  alarmtimeType.value = v;
                }}
                onSearch={changeDate}
              ></DateInlineForm>
            </template>
            <displayPanel bg-img={"overView16.png"} content-list={contentList.value} showimg={false}></displayPanel>
          </SubPanelTemplate>
        </div>
        <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></modal-alarm-table>
      </>
    );
  },
});

export default Left;
