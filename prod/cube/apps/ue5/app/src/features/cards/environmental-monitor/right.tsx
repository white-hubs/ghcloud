import { defineComponent } from "vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsAreaTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import RingChart from "@/shared-ui/panel/charts/ring/ring";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    let timer: any = reactive(null);

    let handleTime = ref<ModelValueItf>();
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];

    const { globalState } = useStateStore();

    const devicestatistic = ref([]);

    const pieData = ref([]);
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    let equipmentData = reactive({
      deviceNum: 0,
      devices: [],
      deviceGenreNums: {},
    });
    const statisticValueStyle = computed(() => (index) => {
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: pieData[index]?.color,
      };
    });
    const statisticStyle = computed(() => {
      return {
        fontSize: "16px",
        color: "#FFFFFF",
        paddingLeft: "16px",
      };
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

    // 报警处理排名
    function changeHandleTime() {
      getAlarmHandlTop();
    }
    async function getAlarmHandlTop() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      alarmRank.list = await statisticsAreaTop(params);
    }
    // 动环设备
    const getEquipmentInfo = async () => {
      pieData.value.length = 0;
      devicestatistic.value.length = 0;
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
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
      getAlarmHandlTop();
      getEquipmentInfo();
    }
    onMounted(() => {
      getEquipmentInfo();
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警区域top5">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={changeHandleTime}
              ></DateInlineForm>
            </div>
            <div class="body" style="min-height: 250px;">
              {alarmRank.list.map((item, index) => (
                <EventAlarmItem
                  key={item.id}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body" style="min-height: 150px;">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="动环设备">
            <OperateDays title="设备总数" value={equipmentData.value.deviceNum} class="body-num"></OperateDays>
            <GridContainer data={devicestatistic.value}></GridContainer>
            <div class="chart">
              {" "}
              <RingChart pieData={pieData.value} seriesName="设备类型统计" total={equipmentData.deviceNum}></RingChart>
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
                      <span> {item.ratio}</span>
                    </template>
                  </a-statistic>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
