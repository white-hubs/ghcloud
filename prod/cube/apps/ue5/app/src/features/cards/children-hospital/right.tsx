import { defineComponent } from "vue";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { CountTo } from "vue3-count-to";

import trafficRecords from "./components/trafficRecords";
import videoModel from "./components/videoModel";
import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { recordTrend } from "@/infrastructure/api/door";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import bus from "@/infrastructure/utils/bus";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { alarmEvent } from "@/infrastructure/utils/requestData/accessControl";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import H5Video from "@/shared-ui/panel/H5Video";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import usrCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { videoList } = usrCommon();
    const generalFalg = ref(false);
    const eventResult = ref("");
    const alarmSituationStatistic = ref<
      {
        label: string;
        value: number;
        img: string;
        color: string;
        key: string;
        alarmHandleResult: string;
      }[]
    >([
      {
        label: "通行总次数",
        value: 0,
        img: "overView57.png",
        color: "#D0DEEE",
        key: "alarmNum",
        alarmHandleResult: "",
      },
      {
        label: "正常通行",
        value: 0,
        img: "overView56.png",
        color: "#F14545",
        key: "alarmActualNum",
        alarmHandleResult: "DO_PASS",
      },
      {
        label: "异常通行",
        value: 0,
        img: "overView2.png",
        color: "#FFC700",
        key: "alarmImpracticalNum",
        alarmHandleResult: "DO_REFUSE",
      },
    ]);
    const lineData = reactive({
      title: "次",
      xData: ["4", "8", "12", "16", "20", "24"],
      yData: [
        {
          data: [1, 2, 4, 5, 6, 8, 7],
          name: "正常通行",
          colors: [
            {
              offset: 0,
              color: "rgba(41, 137, 255, 1)",
            },
            {
              offset: 1,
              color: "rgba(41, 137, 255, 0.20)",
            },
          ],
        },
        {
          data: [10, 12, 14, 5, 86, 8, 7],
          name: "异常通行",
          colors: [
            {
              offset: 0,
              color: "rgba(255, 110, 35, 1)",
            },
            {
              offset: 1,
              color: "rgba(255, 110, 35, 0.02)",
            },
          ],
        },
      ],
    });
    let timer: any = reactive(null);
    const receiveOverviewTime = ref<ModelValueItf>();
    const generalTime = ref<ModelValueItf>();
    const alarmRank = ref([]);
    const num = ref(0);

    const { globalState } = useStateStore();
    let cameraList = ref<VideoType[]>([]);
    const cameraListTotal = ref([]);
    const changeHandleReceiveOverviewTime = async () => {
      alarmRank.value = await alarmEvent(receiveOverviewTime.value.timeType);
    };
    // 人员通行趋势
    const changeHandlegeneralTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        eventResult: "DO_PASS",
        dimension: generalTime.value.timeType,
      };
      let res: any = await recordTrend(param);
      let time = "";
      if (generalTime.value.timeType === "TODAY") {
        time = "时";
      } else if (generalTime.value.timeType === "THIS_YEAR") {
        time = "月";
      } else {
        time = "号";
      }
      lineData.xData = res.eventPass.xdata.map((item) => {
        item += time;
        return item;
      });
      lineData.yData[0].data = res.eventPass.series[0].value;
      lineData.yData[1].data = res.eventRefuse.series[0].value;
      alarmSituationStatistic.value[0].value = res.total;
      alarmSituationStatistic.value[1].value = res.eventPass.total;
      alarmSituationStatistic.value[2].value = res.eventRefuse.total;
    };
    // 获取视频列表
    async function getVideo() {
      cameraListTotal.value = await videoList();
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = cameraListTotal.value[num.value];
      }
    }
    // 切换视频
    const changeVideo = () => {
      if (num.value === cameraListTotal.value.length - 1) {
        num.value = 0;
      } else {
        num.value++;
      }
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = cameraListTotal.value[num.value];
      }
    };
    const clickCamera = (item) => {
      bus.emit("switchCamera", item);
    };
    const init = () => {
      getVideo();
    };
    const openEvent = (item) => {
      generalFalg.value = true;
      eventResult.value = item.alarmHandleResult;
    };
    onMounted(() => {
      init();
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
          <SubPanelTemplate title="人员通行趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={generalTime.value}
                onUpdate:modelValue={(v) => {
                  generalTime.value = v;
                }}
                onSearch={changeHandlegeneralTime}
              ></DateInlineForm>
            </template>
            <div class="flex-between">
              {alarmSituationStatistic.map((item) => (
                <div class="statistic-item flex-center" onClick={openEvent(item)}>
                  <div class="left">
                    {" "}
                    <img src={getAssetsImage(item.img)} />
                  </div>
                  <div class="right">
                    <count-to
                      startVal={0}
                      endVal={item.value}
                      duration={4000}
                      class="scroll-number"
                      style={{ color: item.color }}
                    ></count-to>
                    <div style="white-space: nowrap;"> {item.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div class="chart">
              {" "}
              <stackedLine
                title={lineData.title}
                yData={lineData.yData}
                xData={lineData.xData}
                color={["#2989FF", "#FF6E23"]}
              ></stackedLine>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="异常事件Top5">
            <template>
              {" "}
              <DateInlineForm
                modelValue={receiveOverviewTime.value}
                onUpdate:modelValue={(v) => {
                  receiveOverviewTime.value = v;
                }}
                onSearch={changeHandleReceiveOverviewTime}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px">
              {alarmRank.map((item, index) => (
                <EventAlarmItem
                  key={item.id}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.ringRatio}
                  count={item.value}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="视频监控" class="monitor">
            <template>
              <div class="right-bar" onClick={changeVideo} class={[cameraListTotal.length - 1 === 0 ? "forbidden" : ""]}>
                <div> 切换</div>
                <img src={getAssetsImage("changingOver.png")} alt />
              </div>
            </template>
            <div class="body">
              <div class="title"> 监控组</div>
              <div class="group">
                {cameraList.map((item, index) => (
                  <div class="camera" key={index} onClick={clickCamera(item)}>
                    {" "}
                    <H5Video cameraItem={item} idStr={item.token + index}></H5Video>
                  </div>
                ))}
              </div>
              <div class="group">
                {" "}
                <noData></noData>
              </div>
            </div>
          </SubPanelTemplate>
          {generalFalg && (
            <trafficRecords
              date={generalTime.dateRange}
              showModal={generalFalg.value}
              onClose={() => {
                generalFalg.value = false;
              }}
              eventResult={eventResult.value}
            ></trafficRecords>
          )}
          <videoModel
            showModal={false}
            onClose={() => {
              generalFalg.value = false;
            }}
          ></videoModel>
        </div>
      </>
    );
  },
});

export default Right;
