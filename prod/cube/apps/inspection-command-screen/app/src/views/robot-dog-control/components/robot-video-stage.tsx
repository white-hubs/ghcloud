import { BorderOutlined, CopyOutlined, ExpandOutlined, PauseOutlined, PictureOutlined, PlayCircleOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, shallowRef, type PropType } from "vue";

import { Button } from "@ghcloud/cube-ui";

import type { RobotDogPhotoInfo } from "@/api/robot-dog-service";

export const RobotVideoStage = defineComponent({
  name: "RobotVideoStage",
  props: {
    imageUrl: {
      type: String,
      required: true,
    },
    streamUrl: {
      type: String,
      required: true,
    },
    paused: {
      type: Boolean,
      required: true,
    },
    fpsText: {
      type: String,
      required: true,
    },
    onAction: {
      type: Function as PropType<(action: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const stageRef = shallowRef<HTMLElement | null>(null);
    const streamFailed = shallowRef(false);

    const videoSource = computed(() => {
      return props.paused || streamFailed.value ? props.imageUrl : props.streamUrl;
    });

    const toggleFullscreen = (): void => {
      const target = stageRef.value;
      if (!target) {
        return;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => props.onAction("退出全屏失败"));
        return;
      }
      target.requestFullscreen().catch(() => props.onAction("画面全屏失败"));
    };

    return () => (
      <section
        class="robot-video-stage"
        ref={(el) => {
          stageRef.value = el as HTMLElement | null;
        }}
      >
        <div class="robot-live-indicator">
          <i />
          <span>{props.paused ? "PAUSED" : "LIVE"}</span>
          <strong>{props.fpsText}</strong>
        </div>
        <Button class="robot-expand-btn" onClick={toggleFullscreen}>
          <ExpandOutlined />
        </Button>
        <div class="robot-video-frame">
          <img
            src={videoSource.value}
            alt="机器狗实时画面"
            onError={() => {
              streamFailed.value = true;
            }}
          />
          {props.paused ? <div class="robot-video-paused">视频已暂停</div> : null}
          {streamFailed.value && !props.paused ? <div class="robot-video-paused">实时流不可用，已显示占位画面</div> : null}
        </div>
      </section>
    );
  },
});

export const RobotVideoFooter = defineComponent({
  name: "RobotVideoFooter",
  props: {
    streamUrl: {
      type: String,
      required: true,
    },
    paused: {
      type: Boolean,
      required: true,
    },
    latencyText: {
      type: String,
      required: true,
    },
    fpsText: {
      type: String,
      required: true,
    },
    lastCommand: {
      type: String,
      required: true,
    },
    uptimeText: {
      type: String,
      required: true,
    },
    driverMode: {
      type: String,
      required: true,
    },
    photos: {
      type: Array as PropType<RobotDogPhotoInfo[]>,
      required: true,
    },
    photoTotal: {
      type: Number,
      required: true,
    },
    getPhotoUrl: {
      type: Function as PropType<(photoId: number) => string>,
      required: true,
    },
    onAction: {
      type: Function as PropType<(action: string) => void>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="robot-video-footer">
        <div class="robot-stream-actions">
          <Button onClick={() => props.onAction("暂停视频")}>
            {props.paused ? <PlayCircleOutlined /> : <PauseOutlined />}
            {props.paused ? "播放视频" : "暂停视频"}
          </Button>
          <Button onClick={() => props.onAction("拍照并保存")}>
            <PictureOutlined />
            拍照并保存
          </Button>
          <div class="robot-stream-url">{props.streamUrl}</div>
          <Button onClick={() => props.onAction("复制地址")}>
            <CopyOutlined />
            复制地址
          </Button>
          <span class="robot-vlc-tip">VLC: 媒体 -&gt; 打开网络串流 -&gt; 粘贴</span>
        </div>
        <div class="robot-snapshot-row">
          <span>最近（{props.photoTotal}）</span>
          {props.photos.slice(0, 4).map((item) => (
            <button
              class="robot-snapshot"
              key={item.id}
              type="button"
              title={item.filename}
              onClick={() => props.onAction(`打开照片:${item.id}`)}
            >
              <img src={props.getPhotoUrl(item.id)} alt={item.filename} />
            </button>
          ))}
          {props.photos.length === 0 ? (
            <div class="robot-snapshot robot-snapshot-empty">
              <BorderOutlined />
            </div>
          ) : null}
          <Button size="small" onClick={() => props.onAction("查看全部截图")}>
            查看全部 →
          </Button>
        </div>
        <div class="robot-bottom-status">
          <span>
            WS延迟:<strong>{props.latencyText}</strong>
          </span>
          <span>
            FPS:<b>{props.fpsText}</b>
          </span>
          <span>最后指令: {props.lastCommand}</span>
          <span>运行时间: {props.uptimeText}</span>
          <span>驱动: {props.driverMode}</span>
        </div>
      </div>
    );
  },
});
