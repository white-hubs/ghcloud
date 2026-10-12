import { computed, defineComponent, onMounted, onUnmounted, shallowRef, type PropType, type VNodeChild } from "vue";

import { Button } from "@ghcloud/cube-ui";

import { RobotDirectionPad } from "./robot-direction-pad";
import { RobotStatusCards, type RobotMetric } from "./robot-status-cards";

export type RobotTabKey = "quick" | "status" | "move" | "settings" | "safety";

export interface RobotSystemStatus {
  obstacleAvoidance: boolean;
  remoteCommand: boolean;
  joystick: boolean;
  autoRecovery: boolean;
  silentMode: boolean;
  vui: boolean;
  lidar: boolean;
  speedLevel: -1 | 0 | 1;
  volume: number;
  brightness: number;
  motionMode: string;
}

const tabs: Array<{ key: RobotTabKey; label: string }> = [
  { key: "quick", label: "快捷启动" },
  { key: "status", label: "机器人状态" },
  { key: "move", label: "方向移动" },
  { key: "settings", label: "系统设置" },
  { key: "safety", label: "安全控件" },
];

const quickActions: Array<{ label: string; key: string; modes: string[] }> = [
  { label: "站立", key: "1", modes: ["standing", "stand", "stand_up", "rise_sit", "balance_stand", "recovery_stand"] },
  { label: "卧倒", key: "2", modes: ["stand_down", "lying", "lie_down", "prone"] },
  { label: "坐下", key: "3", modes: ["sit", "sitting"] },
  { label: "起立", key: "4", modes: [] },
  { label: "平衡", key: "5", modes: [] },
  { label: "恢复站立", key: "6", modes: [] },
];

const switchRows: Array<{
  label: string;
  field: keyof Pick<
    RobotSystemStatus,
    "obstacleAvoidance" | "remoteCommand" | "joystick" | "autoRecovery" | "silentMode" | "vui" | "lidar"
  >;
  onCommand: string;
  offCommand: string;
}> = [
  { label: "避障", field: "obstacleAvoidance", onCommand: "开启避障", offCommand: "关闭避障" },
  { label: "遥控接管", field: "remoteCommand", onCommand: "接管速度控制", offCommand: "释放速度控制" },
  { label: "摇杆输入", field: "joystick", onCommand: "开启摇杆", offCommand: "关闭摇杆" },
  { label: "自动恢复", field: "autoRecovery", onCommand: "开启自动恢复", offCommand: "关闭自动恢复" },
  { label: "静音", field: "silentMode", onCommand: "开启静音", offCommand: "关闭静音" },
  { label: "VUI", field: "vui", onCommand: "开启VUI", offCommand: "关闭VUI" },
  { label: "LiDAR", field: "lidar", onCommand: "开启LiDAR", offCommand: "关闭LiDAR" },
];

export const RobotControlPanel = defineComponent({
  name: "RobotControlPanel",
  props: {
    activeTab: {
      type: String as PropType<RobotTabKey>,
      required: true,
    },
    metrics: {
      type: Array as PropType<RobotMetric[]>,
      required: true,
    },
    speed: {
      type: Number,
      required: true,
    },
    systemStatus: {
      type: Object as PropType<RobotSystemStatus>,
      required: true,
    },
    activeQuickMode: {
      type: String,
      default: "",
    },
    onCommand: {
      type: Function as PropType<(command: string) => void>,
      required: true,
    },
  },
  emits: {
    "update:activeTab": (_tab: RobotTabKey) => true,
    "update:speed": (_value: number) => true,
  },
  setup(props, { emit }) {
    const scrollRef = shallowRef<HTMLElement | null>(null);
    const sectionElements = new Map<RobotTabKey, HTMLElement>();
    let observer: IntersectionObserver | null = null;
    let tabScrollTimer: number | null = null;

    const speedLabel = computed(() => {
      if (props.systemStatus.speedLevel === -1) {
        return "低速";
      }
      if (props.systemStatus.speedLevel === 1) {
        return "高速";
      }
      return "正常";
    });

    const normalizedQuickMode = computed(() =>
      props.activeQuickMode
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_"),
    );

    const isQuickActionActive = (item: (typeof quickActions)[number]): boolean => {
      const mode = normalizedQuickMode.value;
      return Boolean(mode) && item.modes.includes(mode);
    };

    const setScrollRef = (el: Element | null): void => {
      scrollRef.value = el as HTMLElement | null;
    };

    const setSectionRef = (key: RobotTabKey, el: Element | null): void => {
      if (el) {
        sectionElements.set(key, el as HTMLElement);
        observer?.observe(el);
      } else {
        sectionElements.delete(key);
      }
    };

    const scrollToSection = (key: RobotTabKey): void => {
      const panel = scrollRef.value;
      const section = sectionElements.get(key);
      if (!panel || !section) {
        emit("update:activeTab", key);
        return;
      }

      emit("update:activeTab", key);
      if (tabScrollTimer !== null) {
        window.clearTimeout(tabScrollTimer);
      }
      tabScrollTimer = window.setTimeout(() => {
        tabScrollTimer = null;
      }, 450);

      const panelRect = panel.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const targetTop = panel.scrollTop + sectionRect.top - panelRect.top - 12;

      panel.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
    };

    const renderSwitchRow = (item: (typeof switchRows)[number]): VNodeChild => {
      const active = Boolean(props.systemStatus[item.field]);
      return (
        <div class="robot-toggle-row" key={item.label}>
          <span>{item.label}</span>
          <button class={{ active }} onClick={() => props.onCommand(item.onCommand)}>
            开
          </button>
          <button class={{ active: !active }} onClick={() => props.onCommand(item.offCommand)}>
            关
          </button>
        </div>
      );
    };

    const renderQuick = (): VNodeChild => (
      <section class="robot-section robot-anchor-section" id="robot-section-quick" ref={(el) => setSectionRef("quick", el)}>
        <div class="robot-section-title">
          <span class="robot-section-icon">↯</span>
          <strong>快捷启动</strong>
          <span>基础姿态 · 常用恢复动作</span>
        </div>
        <div class="robot-button-grid robot-quick-grid">
          {quickActions.map((item) => (
            <Button key={item.label} type={isQuickActionActive(item) ? "primary" : "default"} onClick={() => props.onCommand(item.label)}>
              {item.label}
              <span class="robot-key-badge">{item.key}</span>
            </Button>
          ))}
        </div>
        <div class="robot-helper-text">站起让机器人站立 · 卧倒趴下 · 坐下休息 · 起立从坐姿站起 · 恢复站立需开阔空间</div>
      </section>
    );

    const renderSettings = (): VNodeChild => (
      <section class="robot-section robot-anchor-section" id="robot-section-settings" ref={(el) => setSectionRef("settings", el)}>
        <div class="robot-section-title">
          <span class="robot-section-icon">◎</span>
          <strong>系统设置</strong>
          <span>功能开关 · 速度档位 · VUI</span>
        </div>
        <div class="robot-setting-grid">
          {switchRows.map(renderSwitchRow)}
          <div class="robot-toggle-row robot-toggle-row-wide">
            <span>速度档</span>
            <button class={{ active: props.systemStatus.speedLevel === -1 }} onClick={() => props.onCommand("速度低")}>
              低
            </button>
            <button class={{ active: props.systemStatus.speedLevel === 0 }} onClick={() => props.onCommand("速度正常")}>
              正常
            </button>
            <button class={{ active: props.systemStatus.speedLevel === 1 }} onClick={() => props.onCommand("速度高")}>
              高
            </button>
            <strong>{speedLabel.value}</strong>
          </div>
          <div class="robot-stepper">
            <span>音量</span>
            <button onClick={() => props.onCommand("音量减")}>-</button>
            <strong>{props.systemStatus.volume}</strong>
            <button onClick={() => props.onCommand("音量加")}>+</button>
          </div>
          <div class="robot-stepper">
            <span>亮度</span>
            <button onClick={() => props.onCommand("亮度减")}>-</button>
            <strong>{props.systemStatus.brightness}</strong>
            <button onClick={() => props.onCommand("亮度加")}>+</button>
          </div>
          <div class="robot-command-row">
            <span>运控</span>
            <div style={{ width: "100px", textAlign: "center" }}>
              <strong>{props.systemStatus.motionMode || "--"}</strong>
            </div>
            <Button size="small" onClick={() => props.onCommand("切MCF")}>
              切MCF
            </Button>
            <Button size="small" onClick={() => props.onCommand("释放运控")}>
              释放
            </Button>
          </div>
        </div>
      </section>
    );

    const renderSafety = (): VNodeChild => (
      <section class="robot-section robot-anchor-section" id="robot-section-safety" ref={(el) => setSectionRef("safety", el)}>
        <div class="robot-section-title">
          <span class="robot-section-icon">!</span>
          <strong>安全控件</strong>
          <span>急停后运动命令返回 HTTP 423</span>
        </div>
        <section class="robot-emergency-card">
          <div>
            <strong>安全操作</strong>
            <span>请确认现场空间安全后再解除或恢复站立</span>
          </div>
          <div class="robot-emergency-actions">
            <Button danger type="primary" onClick={() => props.onCommand("紧急停止")}>
              紧急停止
            </Button>
            <Button onClick={() => props.onCommand("解除急停")}>解除急停</Button>
            <Button danger onClick={() => props.onCommand("泄力")}>
              泄力瘫软
            </Button>
            <Button onClick={() => props.onCommand("恢复站立")}>恢复站立</Button>
          </div>
        </section>
        <div class="robot-danger-note">急停和泄力属于高风险操作。解除急停后，建议先确认机器人姿态与周边环境。</div>
      </section>
    );

    onMounted(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (tabScrollTimer !== null) {
            return;
          }
          if ((scrollRef.value?.scrollTop || 0) <= 1) {
            if (props.activeTab !== "quick") {
              emit("update:activeTab", "quick");
            }
            return;
          }
          const visibleEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          const key = tabs.find((item) => sectionElements.get(item.key) === visibleEntry?.target)?.key;
          if (key && key !== props.activeTab) {
            emit("update:activeTab", key);
          }
        },
        {
          root: scrollRef.value,
          rootMargin: "-52px 0px -45% 0px",
          threshold: [0.15, 0.35, 0.6],
        },
      );
      sectionElements.forEach((el) => observer?.observe(el));
    });

    onUnmounted(() => {
      observer?.disconnect();
      if (tabScrollTimer !== null) {
        window.clearTimeout(tabScrollTimer);
      }
    });

    return () => (
      <aside class="robot-control-panel">
        <nav class="robot-tabs">
          {tabs.map((tab) => (
            <button class={{ active: props.activeTab === tab.key }} key={tab.key} onClick={() => scrollToSection(tab.key)}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div class="robot-panel-scroll" ref={setScrollRef}>
          {renderQuick()}
          <section class="robot-section robot-anchor-section" id="robot-section-status" ref={(el) => setSectionRef("status", el)}>
            <RobotStatusCards metrics={props.metrics} />
          </section>
          <section class="robot-anchor-section" id="robot-section-move" ref={(el) => setSectionRef("move", el)}>
            <RobotDirectionPad
              speed={props.speed}
              onCommand={props.onCommand}
              onUpdate:speed={(value: number) => emit("update:speed", value)}
            />
          </section>
          {renderSettings()}
          {renderSafety()}
        </div>
      </aside>
    );
  },
});
