import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import FailedEquipmentModal from "@/features/cards/surgical-demonstration/components/failed-equipment-modal";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import RingChart from "@/shared-ui/panel/charts/ring/ring";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./build-left.module.less";

export const BuildLeft = defineComponent({
  name: "BuildLeft",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const deviceModal = ref<boolean>(false);
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const alarmCon = ref(0);
    const levelStatistic = ref([]);
    const alarmType = reactive({
      xData: ["流量报警", "温度报警", "液位报警", "超压报警"],
      yData: [380, 80, 30, 540],
    });
    const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
    const pieData = ref([
      {
        name: "流量计",
        value: 10,
        color: "#29C2FF",
      },
      {
        name: "压力计",
        value: 20,
        color: "#74AEE7",
      },
      {
        name: "报警箱",
        value: 10,
        color: "#FFC700",
      },
    ]);
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

    /**
     * 区域报警Top5
     */
    const getTemplateData = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trendTime.value.dateRange.join(","),
        type: trendTime.value.timeType,
      };
      // areaAlarmRank.value = res;
    };

    // 异常设备清单
    const abnormalEquipment = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        // period:[moment().startOf("month").format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(','),
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
    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res: any = await equipmentTotal(params);
      if (!res.deviceNum) {
        return;
      }
      levelStatistic.value.length = 0;
      pieData.value.length = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmCon.value += item.num;
        levelStatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
          color: colorList[index],
          alarmNum: item.num,
        });
      });
      res.deviceGenreNums.forEach((item, index) => {
        pieData.value.push({
          name: item.genreName,
          color: colorList[index],
          value: item.num,
        });
      });
    };
    onMounted(() => {
      deviceDataInfo();
      abnormalEquipment();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备状态总览">
            <OperateDays title="设备数" value={alarmCon.value} style="margin-bottom: 10px;" />
            <GridContainer data={levelStatistic.value}></GridContainer>
          </SubPanelTemplate>
          <SubPanelTemplate title="异常设备清单">
            <template>
              {" "}
              <div
                class="details"
                onClick={() => {
                  deviceModal.value = true;
                }}
              >
                {" "}
                全部
              </div>
            </template>
            <RollTable column={alarmColumn} data={listData.value} limitScrollNum={4}></RollTable>
          </SubPanelTemplate>
          <SubPanelTemplate title="告警设备top5统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trendTime.value}
                onUpdate:modelValue={(v) => {
                  trendTime.value = v;
                }}
                onSearch={getTemplateData}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <barChart x-data={alarmType.xData} data={[{ color: "#1890FF", name: "", data: alarmType.yData }]} class="columnBox" />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="医用气体设备分类">
            <OperateDays title="设备总数" value={alarmCon.value} />
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
                    <template>
                      {" "}
                      <span> {item.ratio}</span>
                    </template>
                  </a-statistic>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
        </div>
        {deviceModal && (
          <FailedEquipmentModal
            title="异常设备清单"
            modelValue={deviceModal.value}
            onUpdate:modelValue={(v) => {
              deviceModal.value = v;
            }}
            onClose={() => {
              deviceModal.value = false;
            }}
            footer={null}
          />
        )}
      </>
    );
  },
});

export default BuildLeft;
