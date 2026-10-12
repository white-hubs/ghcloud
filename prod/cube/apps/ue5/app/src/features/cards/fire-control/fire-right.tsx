import { defineComponent } from "vue";
import { computed, ref, onMounted, reactive, watch, onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { expiredPage, expiredChain } from "@/infrastructure/api/device";
import RoseChart from "@/shared-ui/panel/charts/roseChart/roseChart";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-right.module.less";

export const FireRight = defineComponent({
  name: "FireRight",
  setup(_props, ctx) {
    const ueClient = UeClient.getInstance();

    const { globalState } = useStateStore();

    let timer: any = reactive(null);
    const timeFrame = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const pieData = ref([]);
    const devicestatistic = ref([]);
    const statisticValueStyle = computed(() => (index) => {
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: pieData[index]?.itemStyle.color,
      };
    });
    const statisticStyle = computed(() => {
      return {
        fontSize: "16px",
        color: "#FFFFFF",
        paddingLeft: "16px",
      };
    });
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const stateList = {
      SPLIT: "待拆解",
      ACCEPT: "待接收",
      EXECUTING: "进行中",
      OVER: "已完成",
      EXPIRE: "已过期",
    };
    const alarmColumn = [
      {
        title: "设备名称",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "设备类型",
        dataIndex: "genreName",
      },
      {
        title: "使用年限",
        dataIndex: "usefulLifeYear",
      },
      {
        title: "操作",
        dataIndex: "deviceStatus",
        slots: {
          customRender: "deviceStatus",
        },
        width: 80,
      },
    ];
    const listData = ref([]);
    const alarmCon = ref({
      totalNumber: 0,
      chainRatio: 0,
    });
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
    const { getEquipmentNumber } = useCommon();
    let equipmentData = reactive({
      deviceNum: 0,
      devices: [],
      deviceGenreNums: {},
    });
    const clickRow = (value) => {
      ueClient.send("focusActor", { id: value.code });
    };
    // 设备统计
    const changeTopTimeFrame = async () => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      const { records } = await expiredPage(param);
      listData.value = records.map((item) => {
        return {
          ...item,
          expireStatus: stateList[item.expireStatus],
        };
      });
      alarmCon.value = await expiredChain(param);
    };
    // 动环设备
    const getEquipmentInfo = async () => {
      pieData.value.length = 0;
      devicestatistic.value.length = 0;
      let res: any = await getEquipmentNumber();
      // let res: any = mockEquipmentNumber()
      equipmentData.deviceNum = res.deviceNum;
      equipmentData.devices = res.devices;
      equipmentData.deviceGenreNums = res.deviceGenreNums;
      res.deviceStatusNums.forEach((item, index) => {
        devicestatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
          alarmNum: item.num,
          color: colorList[index],
        });
      });
      res.deviceGenreNums.forEach((item, index) => {
        pieData.value.push({
          name: item.genreName,
          value: item.num,
          color: colorList[index],
        });
      });
    };
    function init() {
      getEquipmentInfo();
    }
    onMounted(() => {
      // init()
      // timer = setInterval(() => {
      init();
      changeTopTimeFrame();
      // }, (window as any).config.pageLoopRequestTime)
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="消防设备">
            <div class="body">
              <OperateDays title="设备数" value={equipmentData.value.deviceNum} class="body-num"></OperateDays>
              <GridContainer data={devicestatistic.value}></GridContainer>
              <div class="chart">
                {pieData.length && <RoseChart pieData={pieData.value} title></RoseChart>}
                <RoundPie data={[]} eventNum={0}>
                  <div class="content">
                    <span> 0</span>
                    <br />
                    消防设备
                  </div>
                </RoundPie>
              </div>
              <div class="statistic-lenged">
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
                        <span> {item.chainRatio}</span>
                      </template>
                    </a-statistic>
                  </div>
                ))}
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="消防到期设备统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={changeTopTimeFrame}
              ></DateInlineForm>
            </template>
            <OperateDays title="设备数" value={alarmCon.value.totalNumber} class="body-bum">
              <div class="extra flex-start">
                <div class="mode"> 环比</div>
                <div class={["downtriangle", alarmCon.chainRatio > 0 && "uptriangle"]}></div>
                <div class={[alarmCon.chainRatio < 0 ? "down" : "up"]}>{alarmCon.chainRatio}%</div>
              </div>
            </OperateDays>
            <RollTable column={alarmColumn} data={listData.value} limitScrollNum={4}>
              {" "}
              <template>
                {" "}
                <span class="details" onClick={clickRow(record)}>
                  {" "}
                  定位
                </span>
              </template>
            </RollTable>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default FireRight;
