import { defineComponent, onMounted } from "vue";

import MonitorVideoGrid from "@/features/panel-shell/media/monitor-video-grid/monitor-video-grid";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import { videoListDevices } from "@/infrastructure/api/vmonitor";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { useMonitorCameraList } from "@/visualization-core/hooks/use-monitor-camera-list";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./security-monitor.module.less";

const videoMonitorIcon = getThemeImage("video-monitor.png");

export const SecurityMonitor = defineComponent({
  name: "SecurityMonitor",
  props: {
    title: { type: String, default: "视频监控" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const { cameraList, loadLayoutFromDictionary, setCameras, markPlaybackFailed, getPlayerKey } = useMonitorCameraList<VideoType>();

    const resolveCardKey = (item: VideoType): string => getPlayerKey(item);
    const resolveZoomKey = (item: VideoType): string => getPlayerKey(item, "zoom-");

    const getVideo = async (): Promise<void> => {
      await loadLayoutFromDictionary();
      const list = (await videoListDevices({
        areaId: globalState.business.currentAreaId,
      })) as VideoType[];
      setCameras(list ?? []);
    };

    const clickCamera = (item: VideoType): void => {
      bus.emit("switchCamera", item);
    };

    onMounted(() => {
      void getVideo();
    });

    const renderMonitorBody = (isZoom: boolean): JSX.Element => (
      <div class={["security-monitor-v2", "security-monitor-v2-panel", isZoom ? "is-zoom" : ""]}>
        <MonitorVideoGrid
          isZoom={isZoom}
          idPrefix={isZoom ? "zoom" : ""}
          externalRecovery={!isZoom}
          cameraList={cameraList.value}
          resolveKey={isZoom ? resolveZoomKey : resolveCardKey}
          onSelect={clickCamera}
          onError={isZoom ? undefined : markPlaybackFailed}
        />
      </div>
    );

    return () => (
      <div class="v2-panel-root security-monitor-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card security-monitor-v2-panel monitor"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={videoMonitorIcon} alt="" class="title-card-icon" />,
            default: () => renderMonitorBody(false),
            "zoom-content": () => renderMonitorBody(true),
          }}
        />
      </div>
    );
  },
});

export default SecurityMonitor;
