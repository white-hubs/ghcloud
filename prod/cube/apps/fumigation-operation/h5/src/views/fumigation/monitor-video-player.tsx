import { Button } from "vant";
import { defineComponent, onBeforeUnmount, ref } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";

export const MonitorVideoPlayer = defineComponent({
  name: "MonitorVideoPlayer",
  props: {
    deviceId: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const playerError = ref(false);
    const refreshLoading = ref(false);
    const playerKey = ref(0);
    let refreshTimer: number | undefined;

    const handleRefresh = (): void => {
      if (refreshLoading.value || props.deviceId === "") {
        return;
      }
      refreshLoading.value = true;
      playerError.value = false;
      playerKey.value += 1;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshLoading.value = false;
      }, 800);
    };

    onBeforeUnmount(() => {
      window.clearTimeout(refreshTimer);
    });

    return (): JSX.Element => (
      <div class="fz-h5-monitor-player">
        <CubePlayer
          key={`${props.deviceId}-${playerKey.value}`}
          deviceId={props.deviceId}
          h5sControl={true}
          isShowDeviceDetails={false}
          enableAutoRecovery={true}
          maxRecoveryCount={5}
          recoveryDelays={[2000, 5000, 10000, 15000, 30000]}
          onError={() => {
            playerError.value = true;
          }}
        />
        {playerError.value ? (
          <div class="fz-h5-monitor-player__error">
            <span>视频加载失败</span>
            <Button size="small" plain loading={refreshLoading.value} onClick={handleRefresh}>
              刷新
            </Button>
          </div>
        ) : null}
      </div>
    );
  },
});
