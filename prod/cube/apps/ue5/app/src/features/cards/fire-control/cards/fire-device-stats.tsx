import { defineComponent } from "vue";
import { computed, ref, onMounted, reactive, watch, onBeforeUnmount } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import RoseChart from "@/shared-ui/panel/charts/roseChart/roseChart";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-device-stats.module.less";

export const FireDeviceStats = defineComponent({
  name: "FireDeviceStats",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    let timer: any = reactive(null);
    const pieData = ref([]);
    const devicestatistic = ref([]);
    const statisticValueStyle = computed(() => (index) => {
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: pieData.value[index]?.itemStyle?.color,
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
      init();
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
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
      </>
    );
  },
});

export default FireDeviceStats;
