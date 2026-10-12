import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
} from "@ant-design/icons-vue";
import { defineComponent, type PropType } from "vue";

import { Button } from "@ghcloud/cube-ui";

export const RobotDirectionPad = defineComponent({
  name: "RobotDirectionPad",
  props: {
    speed: {
      type: Number,
      required: true,
    },
    onCommand: {
      type: Function as PropType<(command: string) => void>,
      required: true,
    },
  },
  emits: {
    "update:speed": (_value: number) => true,
  },
  setup(props, { emit }) {
    const updateSpeed = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      emit("update:speed", Number(target.value));
    };

    return () => (
      <section class="robot-section robot-direction-section">
        <div class="robot-section-title">
          <span class="robot-section-icon">◎</span>
          <strong>方向移动</strong>
          <span>3秒自动停止 · 连续点击连续</span>
        </div>
        <div class="robot-direction-layout">
          <div class="direction-pad">
            <Button onClick={() => props.onCommand("左前")}>↖</Button>
            <Button onClick={() => props.onCommand("前进")}>
              <ArrowUpOutlined />
            </Button>
            <Button onClick={() => props.onCommand("右前")}>↗</Button>
            <Button onClick={() => props.onCommand("左移")}>
              <ArrowLeftOutlined />
            </Button>
            <Button onClick={() => props.onCommand("停止")}>●</Button>
            <Button onClick={() => props.onCommand("右移")}>
              <ArrowRightOutlined />
            </Button>
            <Button onClick={() => props.onCommand("左后")}>↙</Button>
            <Button onClick={() => props.onCommand("后退")}>
              <ArrowDownOutlined />
            </Button>
            <Button onClick={() => props.onCommand("右后")}>↘</Button>
          </div>
          <div class="direction-side">
            <Button onClick={() => props.onCommand("左转")}>
              <RotateLeftOutlined />左
            </Button>
            <Button onClick={() => props.onCommand("右转")}>
              <RotateRightOutlined />右
            </Button>
          </div>
        </div>
        <div class="robot-speed-panel">
          <div class="robot-speed-label">
            <span>速度系数</span>
            <strong>{props.speed.toFixed(1)}x</strong>
          </div>
          <input class="robot-speed-range" type="range" min="0.2" max="1.2" step="0.1" value={props.speed} onInput={updateSpeed} />
          <div class="robot-speed-presets">
            {[
              ["慢速", 0.4],
              ["中速", 0.8],
              ["全速", 1.2],
            ].map(([label, value]) => (
              <Button
                size="small"
                type={props.speed === value ? "primary" : "default"}
                onClick={() => emit("update:speed", value as number)}
                key={label as string}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div class="robot-hotkeys">
          <span>键盘：W A S D</span>
          <span>移动：Q E</span>
          <span>转向：Space</span>
          <span>停止</span>
        </div>
      </section>
    );
  },
});
