import { defineComponent, onMounted } from "vue";

import { trafficStore } from "@/features/cards/people-flow/store/traffic";
import MonitorVideoGrid from "@/features/panel-shell/media/monitor-video-grid/monitor-video-grid";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import { cubeTrafficStatisticsService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { useMonitorCameraList } from "@/visualization-core/hooks/use-monitor-camera-list";

import "./people-flow-monitor.module.less";

const passengerFlowMonitoringIcon = getThemeImage("passenger-flow-monitoring.png");

export const PeopleFlowMonitor = defineComponent({
  name: "PeopleFlowMonitor",
  props: {
    title: { type: String, default: "人流监控" },
  },
  setup(props) {
    const store = trafficStore();
    const { cameraList, loadLayoutFromDictionary, setCameras, markPlaybackFailed, getPlayerKey } = useMonitorCameraList<VideoType>();

    const resolveCardKey = (item: VideoType): string => getPlayerKey(item);
    const resolveZoomKey = (item: VideoType): string => getPlayerKey(item, "zoom-");

    const getVideo = async (): Promise<void> => {
      await loadLayoutFromDictionary();
      let list: VideoType[] = [];
      if (store.currentTraffic) {
        const res = await cubeTrafficStatisticsService.getTrafficDevicesById(store.currentTraffic?.id, {
          pageNumber: 1,
          pageSize: 999,
          deviceState: true,
        });
        list = (res.records?.filter((e) => e.status?.onlineState) ?? []) as unknown as VideoType[];
      } else {
        const res = await cubeTrafficStatisticsService.getTrafficMonitorDevices();
        res?.forEach((item) => {
          item.devices?.forEach((e) => {
            if (e.status?.onlineState) {
              list.push(e as unknown as VideoType);
            }
          });
        });
      }
      setCameras(list);
    };

    const clickCamera = (item: VideoType): void => {
      bus.emit("switchCamera", item);
    };

    onMounted(() => {
      void getVideo();
    });

    return () => (
      <div class="people-flow-monitor-v2-root v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel people-flow-monitor-v2-panel monitor v2-panel-card"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={passengerFlowMonitoringIcon} alt="" class="title-card-icon" />,
            "zoom-content": () => (
              <div class="people-flow-monitor-v2 people-flow-monitor-v2-panel is-zoom">
                <MonitorVideoGrid
                  isZoom
                  idPrefix="zoom"
                  externalRecovery={false}
                  cameraList={cameraList.value}
                  resolveKey={resolveZoomKey}
                  onSelect={clickCamera}
                />
              </div>
            ),
          }}
        >
          <div class="people-flow-monitor-v2 people-flow-monitor-v2-panel v2-panel-body">
            <MonitorVideoGrid
              cameraList={cameraList.value}
              resolveKey={resolveCardKey}
              onSelect={clickCamera}
              onError={markPlaybackFailed}
            />
          </div>
        </SubPanelTemplate>
      </div>
    );
  },
});
