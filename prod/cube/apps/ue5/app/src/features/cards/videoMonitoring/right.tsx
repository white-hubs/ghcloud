import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatistics } from "@/infrastructure/api/alarm";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import bus from "@/infrastructure/utils/bus";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import RatePie from "@/shared-ui/panel/charts/ratePie/ratePie";
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
    const { globalState } = useStateStore();
    const timeFrame = ref<ModelValueItf>();
    const eventInfo = ref<ModelValueItf>();
    const alarmTop = reactive({ arr: [] });
    const alarmProportion = ref({
      handle: 0,
      really: 0,
    });
    const { videoList, getEventTop } = usrCommon();
    let cameraList = ref<VideoType[]>([]);
    const cameraListTotal = ref([]);
    const num = ref(0);
    // 获取处理占比和真实占比
    const getAlarmStatistics = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
      };
      let res: any = await alarmStatistics(params);
      if (res.alarmNum && res.alarmNum !== 0) {
        alarmProportion.value.really = Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
        alarmProportion.value.handle = Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
      } else {
        alarmProportion.value.really = 0;
        alarmProportion.value.handle = 0;
      }
    };

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
    // 获取视频列表
    async function getVideo() {
      cameraListTotal.value = await videoList();
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = cameraListTotal.value[num.value];
      }
    }
    // 报警事件Top5
    const alarmEventTop = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventInfo.value.dateRange.join(","),
        type: eventInfo.value.timeType,
      };
      let res = await getEventTop(param);
      alarmTop.arr = res;
    };
    const clickCamera = (item) => {
      bus.emit("switchCamera", item);
    };
    onMounted(() => {
      getVideo();
    });

    return (): JSX.Element => (
      <div>
        <SubPanelTemplate
          title="报警统计"
          zoomable
          zoom-title="报警统计详情"
          zoom-width={640}
          v-slots={{
            extra: () => (
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={getAlarmStatistics}
                data-no-zoom
              />
            ),
            default: () => (
              <div class="rate-pie-chart" data-no-zoom>
                <RatePie value={alarmProportion.value.handle} title="报警处理占比" color="#5AD0EA" class="rate-pie" />
                <RatePie value={alarmProportion.value.really} title="报警真实占比" class="rate-pie" />
              </div>
            ),
            "zoom-content": () => (
              <div class="rate-pie-chart is-zoom">
                <RatePie value={alarmProportion.value.handle} title="报警处理占比" color="#5AD0EA" class="rate-pie" />
                <RatePie value={alarmProportion.value.really} title="报警真实占比" class="rate-pie" />
              </div>
            ),
          }}
        />
        <SubPanelTemplate
          title="视频监控"
          class="monitor"
          zoomable
          zoom-title="视频监控详情"
          zoom-width={860}
          v-slots={{
            extra: () => (
              <div class={["right-bar", cameraListTotal.value.length - 1 === 0 ? "forbidden" : ""]} onClick={changeVideo} data-no-zoom>
                <div>切换</div>
                <img src={getAssetsImage("changingOver.png")} alt="" />
              </div>
            ),
            default: () => (
              <div class="body" data-no-zoom>
                <div class="title">监控组</div>
                {cameraList.value.length > 0 ? (
                  <div class="group">
                    {cameraList.value.map((item, index) => (
                      <div class="camera" key={index} onClick={() => clickCamera(item)}>
                        <H5Video cameraItem={item} idStr={item.token + index} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div class="group">
                    <noData />
                  </div>
                )}
              </div>
            ),
            "zoom-content": () => (
              <div class="body is-zoom">
                <div class="title">监控组</div>
                {cameraList.value.length > 0 ? (
                  <div class="group is-zoom">
                    {cameraList.value.map((item, index) => (
                      <div class="camera" key={`zoom-${index}`} onClick={() => clickCamera(item)}>
                        <H5Video cameraItem={item} idStr={`zoom-${item.token}${index}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <noData />
                )}
              </div>
            ),
          }}
        />
        <SubPanelTemplate
          title="报警事件top5"
          zoomable
          zoom-title="报警事件top5详情"
          zoom-width={720}
          v-slots={{
            extra: () => (
              <DateInlineForm
                modelValue={eventInfo.value}
                onUpdate:modelValue={(v) => {
                  eventInfo.value = v;
                }}
                onSearch={alarmEventTop}
                data-no-zoom
              />
            ),
            default: () => (
              <>
                <div class="body" style="min-height: 250px" data-no-zoom>
                  {alarmTop.arr.map((item, index) => (
                    <EventAlarmItem key={item.id} sort={index + 1} name={item.name} count={item.alarmNum} ratio={`${item.ratio}%`} />
                  ))}
                </div>
                {!alarmTop.arr.length && (
                  <div class="body" style="min-height: 150px" data-no-zoom>
                    <noData />
                  </div>
                )}
              </>
            ),
            "zoom-content": () => (
              <div class="body is-zoom" style="min-height: 400px">
                {alarmTop.arr.length > 0 ? (
                  alarmTop.arr.map((item, index) => (
                    <EventAlarmItem
                      key={`zoom-${item.id}`}
                      sort={index + 1}
                      name={item.name}
                      count={item.alarmNum}
                      ratio={`${item.ratio}%`}
                    />
                  ))
                ) : (
                  <noData />
                )}
              </div>
            ),
          }}
        />
      </div>
    );
  },
});

export default Right;
