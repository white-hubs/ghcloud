import { defineComponent, onMounted } from "vue";

import { parkingStore } from "../../store/parking";
import { MonitorVideoGrid } from "@/features/panel-shell/media/monitor-video-grid/monitor-video-grid";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { useMonitorCameraList } from "@/visualization-core/hooks/use-monitor-camera-list";

import "./parking-car-monitor.module.less";

const videoMonitorIcon = getThemeImage("video-monitor.png");

export const ParkingCarMonitor = defineComponent({
  name: "ParkingCarMonitor",
  props: {
    title: {
      type: String,
      default: "车场监控",
    },
  },
  setup(props) {
    const store = parkingStore();
    const { cameraList, loadLayoutFromDictionary, setCameras, markPlaybackFailed, getPlayerKey } = useMonitorCameraList<VideoType>();

    const resolveCardKey = (item: VideoType) => getPlayerKey(item);
    const resolveZoomKey = (item: VideoType) => getPlayerKey(item, "zoom-");

    const getVideo = async (): Promise<void> => {
      await loadLayoutFromDictionary();
      let list: VideoType[] = [];
      if (store.currentParking) {
        const params = {
          pageNumber: 1,
          pageSize: 999,
          deviceState: true,
        };
        const res = await cubeParkingLotService.getParkingDevicesById(store.currentParking?.id, params);
        list = (res.records?.filter((e) => e.status?.onlineState) ?? []) as unknown as VideoType[];
      } else {
        const res = await cubeParkingLotService.getParkingMonitorDevices();
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
      getVideo();
    });

    return () => (
      <div class="parking-car-monitor-v2-root v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card parking-car-monitor-v2-panel monitor"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={videoMonitorIcon} alt="" class="title-card-icon" />,
            "zoom-content": () => (
              <div class="parking-car-monitor-v2 parking-car-monitor-v2-panel is-zoom">
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
            default: () => (
              <div class="parking-car-monitor-v2 parking-car-monitor-v2-panel">
                <MonitorVideoGrid
                  cameraList={cameraList.value}
                  resolveKey={resolveCardKey}
                  onSelect={clickCamera}
                  onError={markPlaybackFailed}
                />
              </div>
            ),
          }}
        />
      </div>
    );
  },
});

export default ParkingCarMonitor;
