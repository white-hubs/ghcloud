import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  AudioOutlined,
  BorderOutlined,
  CameraOutlined,
  CaretRightOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  HomeOutlined,
  MinusOutlined,
  PlusOutlined,
  PoweroffOutlined,
  RedoOutlined,
  SettingOutlined,
  Slider,
  Select,
  TabPane,
  Tabs,
  Textarea,
  ThunderboltOutlined,
  UndoOutlined,
  VideoCameraOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  Button,
  message,
} from "@ghcloud/cube-ui";

import { DroneGisMap } from "../components/drone-gis-map";
import { droneStatusTextMap, drones, inspectionObjects, nests, trackDetail } from "../data";
import { cubeDroneService } from "@/api/server";

import styles from "./monitor.module.less";

const permissionErrorText: Record<string, string> = {
  "148102": "权限已拥有，可继续操控",
  "148103": "其他用户正在操控，请等待",
  "148107": "飞机正在起飞，请稍后再试",
  "148207": "飞机低电量返航中，禁止操控",
};

const monitorScrollLockClass = "drone-monitor-scroll-locked";

const getErrorMessage = (error: unknown): string => {
  const code = String(
    (error as { code?: string | number; errorCode?: string | number }).code ?? (error as { errorCode?: string | number }).errorCode ?? "",
  );
  return permissionErrorText[code] ?? "指令已提交";
};

const directionControls = [
  { label: "前", type: 0, className: "forward", icon: ArrowUpOutlined },
  { label: "左", type: 2, className: "left", icon: ArrowLeftOutlined },
  { label: "悬停", type: 3, className: "hover", icon: BorderOutlined },
  { label: "右", type: 5, className: "right", icon: ArrowRightOutlined },
  { label: "后", type: 1, className: "backward", icon: ArrowDownOutlined },
];

const verticalControls = [
  { label: "上升", type: 6, icon: ArrowUpOutlined },
  { label: "下降", type: 7, icon: ArrowDownOutlined },
];

const rotateControls = [
  { label: "左旋", type: 4, icon: UndoOutlined },
  { label: "右旋", type: 8, icon: RedoOutlined },
];

const gimbalDirectionControls = [
  { label: "上", type: "up", className: "forward", icon: ArrowUpOutlined },
  { label: "左", type: "left", className: "left", icon: ArrowLeftOutlined },
  { label: "回中", type: "backhome", className: "hover", icon: BorderOutlined },
  { label: "右", type: "right", className: "right", icon: ArrowRightOutlined },
  { label: "下", type: "down", className: "backward", icon: ArrowDownOutlined },
];

const gimbalActionControls = [
  { label: "下视", type: "lookdown", icon: EyeOutlined },
  { label: "拍照", type: "photograph", icon: CameraOutlined },
  { label: "录像", type: "video_start", icon: VideoCameraOutlined },
  { label: "停止录像", type: "video_stop", icon: CloseOutlined },
];

const cameraModeControls = [
  { label: "红外光", value: 0, icon: EyeOutlined },
  { label: "广角可见光", value: 5, icon: CameraOutlined },
  { label: "变焦可见光", value: 6, icon: PlusOutlined },
  { label: "分屏展示", value: 7, icon: BorderOutlined },
];

const nestActionControls = [
  { label: "开舱", command: "hatch-open", icon: ArrowUpOutlined },
  { label: "关舱", command: "hatch-close", icon: ArrowDownOutlined },
  { label: "展开", command: "putter-withdraw", icon: PlusOutlined },
  { label: "合拢", command: "putter-rellout", icon: MinusOutlined },
  { label: "开始充电", command: "charge-start", icon: ThunderboltOutlined },
  { label: "停止充电", command: "charge-stop", icon: CloseOutlined },
  { label: "开机", command: "power-on", icon: PoweroffOutlined },
  { label: "备降", command: "backup-land", icon: HomeOutlined },
];

export const DroneInspectionMonitor = defineComponent({
  name: "DroneInspectionMonitor",
  setup: () => {
    const route = useRoute();
    const mainView = ref<"video" | "map">("video");
    const activeTab = ref("flight");
    const hasControl = ref(false);
    const controlledDroneSn = ref("");
    const selectedDroneSn = ref(String(route.query.droneSn ?? drones[0]?.droneSn ?? ""));
    const shouterText = ref("");
    const shouterOpen = ref(false);
    const zoomValue = ref(12);
    const leftCollapsed = ref(false);
    const rightCollapsed = ref(false);
    let releaseTimer: number | undefined;

    const selectedDrone = computed(() => drones.find((item) => item.droneSn === selectedDroneSn.value) ?? drones[0]);
    const nestSn = computed(() => selectedDrone.value.nestSn);
    const isManualControl = computed(() => hasControl.value && controlledDroneSn.value === selectedDrone.value.droneSn);
    const displayStatusText = computed(() => (isManualControl.value ? "手动接管中" : droneStatusTextMap[selectedDrone.value.status]));
    const droneOptions = computed(() => drones.map((drone) => ({ label: drone.name, value: drone.droneSn })));

    const clearReleaseTimer = (): void => {
      if (releaseTimer) {
        window.clearTimeout(releaseTimer);
        releaseTimer = undefined;
      }
    };

    const scheduleAutoRelease = (): void => {
      clearReleaseTimer();
      releaseTimer = window.setTimeout(() => {
        hasControl.value = false;
        controlledDroneSn.value = "";
        message.warning("180秒无操作，权限已自动释放");
      }, 180000);
    };

    onMounted(() => {
      document.documentElement.classList.add(monitorScrollLockClass);
      document.body.classList.add(monitorScrollLockClass);
      scheduleAutoRelease();
    });

    onUnmounted(() => {
      document.documentElement.classList.remove(monitorScrollLockClass);
      document.body.classList.remove(monitorScrollLockClass);
      clearReleaseTimer();
    });

    const runCommand = async (command: () => Promise<unknown>, successText: string): Promise<void> => {
      scheduleAutoRelease();
      try {
        await command();
        message.success(successText);
      } catch (error) {
        message.warning(getErrorMessage(error));
      }
    };

    const applyControl = async (): Promise<void> => {
      await runCommand(async () => cubeDroneService.applyControl("Drone", nestSn.value), "已申请飞机操控权限");
      hasControl.value = true;
      controlledDroneSn.value = selectedDrone.value.droneSn;
    };

    const releaseControl = async (): Promise<void> => {
      await runCommand(async () => cubeDroneService.releaseControl(nestSn.value, "DRONE"), "已释放飞机操控权限");
      hasControl.value = false;
      controlledDroneSn.value = "";
    };

    const switchDrone = (droneSn: string): void => {
      selectedDroneSn.value = droneSn;
      if (controlledDroneSn.value !== droneSn) {
        hasControl.value = false;
      }
    };

    const renderSmallMap = (): JSX.Element => (
      <div class={styles.smallMap}>
        <DroneGisMap
          drones={[selectedDrone.value]}
          nests={nests}
          objects={[]}
          track={trackDetail}
          showObjects={false}
          showTrack
          compact
          focus="drone"
        />
      </div>
    );

    const renderVideo = (mini = false): JSX.Element => (
      <div class={[styles.videoView, mini ? styles.miniVideoView : ""]}>
        <div class={styles.videoNoise} />
        <div class={styles.recording}>REC</div>
        <div class={styles.crosshair} />
        <div class={styles.osd}>
          <span>
            GPS {selectedDrone.value.latitude.toFixed(4)}, {selectedDrone.value.longitude.toFixed(4)}
          </span>
          <span>高度 {selectedDrone.value.altitude}m</span>
          <span>速度 {selectedDrone.value.speed}m/s</span>
          <span>电量 {selectedDrone.value.batteryCharge}%</span>
          <span>信号 {selectedDrone.value.signal}%</span>
        </div>
        <div class={styles.cameraMode}>广角可见光</div>
      </div>
    );

    const renderMainMap = (): JSX.Element => (
      <div class={styles.mapView}>
        <DroneGisMap
          drones={[selectedDrone.value]}
          nests={nests}
          objects={inspectionObjects}
          track={trackDetail}
          showObjects
          showTrack
          focus="drone"
        />
      </div>
    );

    const renderFlightTab = (): JSX.Element => (
      <div class={styles.controlTab}>
        <div class={[styles.permissionBar, hasControl.value ? styles.allow : styles.deny]}>
          {!hasControl.value && <CloseOutlined />}
          {hasControl.value ? "手动接管中" : "未获取权限，请先申请"}
        </div>
        <section class={styles.controlSection}>
          <h3>方向控制</h3>
          <div class={styles.directionPad}>
            {directionControls.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  class={styles[item.className]}
                  key={item.type}
                  onClick={() => {
                    void runCommand(async () => cubeDroneService.flyAction(nestSn.value, item.type), `${item.label}指令已发送`);
                  }}
                >
                  <Icon />
                </button>
              );
            })}
          </div>
        </section>
        <div class={styles.assistControls}>
          <section class={styles.inlineControlSection}>
            <h3>升降</h3>
            <div class={styles.iconPairGrid}>
              {verticalControls.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      void runCommand(async () => cubeDroneService.flyAction(nestSn.value, item.type), `${item.label}指令已发送`);
                    }}
                  >
                    <Icon />
                  </button>
                );
              })}
            </div>
          </section>
          <section class={styles.inlineControlSection}>
            <h3>旋转</h3>
            <div class={styles.iconPairGrid}>
              {rotateControls.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      void runCommand(async () => cubeDroneService.flyAction(nestSn.value, item.type), `${item.label}指令已发送`);
                    }}
                  >
                    <Icon />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
        <section class={styles.controlSection}>
          <div class={styles.flightActionGrid}>
            <button
              class={[styles.flightActionButton, styles.takeoffAction]}
              onClick={() => {
                void runCommand(async () => cubeDroneService.flyAction(nestSn.value, 6), "起飞指令已发送");
              }}
            >
              <CaretRightOutlined />
              起飞
            </button>
            <button
              class={[styles.flightActionButton, styles.returnAction]}
              onClick={() => {
                void runCommand(async () => cubeDroneService.precisionReturn(nestSn.value), "返航指令已发送");
              }}
            >
              <HomeOutlined />
              返航
            </button>
            <button
              class={[styles.flightActionButton, styles.pointAction]}
              onClick={() => {
                void runCommand(
                  async () =>
                    cubeDroneService.giveDirectionsFlight({
                      sn: nestSn.value,
                      latitude: selectedDrone.value.latitude,
                      longitude: selectedDrone.value.longitude,
                      height: 45,
                      levelSpeed: 3,
                      flyType: "point",
                    }),
                  "指点飞行已发送",
                );
              }}
            >
              <EnvironmentOutlined />
              指点飞行
            </button>
            <button
              class={[styles.flightActionButton, styles.landAction]}
              onClick={() => {
                void runCommand(async () => cubeDroneService.flyAction(nestSn.value, 1), "迫降指令已发送");
              }}
            >
              <ExclamationCircleOutlined />
              迫降
            </button>
          </div>
        </section>
      </div>
    );

    const renderGimbalTab = (): JSX.Element => (
      <div class={styles.controlTab}>
        <section class={styles.controlSection}>
          <h3>云台方向</h3>
          <div class={styles.directionPad}>
            {gimbalDirectionControls.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  class={styles[item.className]}
                  key={item.type}
                  onClick={() => {
                    void runCommand(async () => cubeDroneService.cameraControl(nestSn.value, 31, item.type, 1), `${item.label}指令已发送`);
                  }}
                >
                  <Icon />
                </button>
              );
            })}
          </div>
        </section>
        <section class={styles.controlSection}>
          <h3>拍摄控制</h3>
          <div class={styles.panelActionGrid}>
            {gimbalActionControls.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  class={styles.panelActionButton}
                  key={item.type}
                  onClick={() => {
                    void runCommand(async () => cubeDroneService.cameraControl(nestSn.value, 31, item.type, 1), `${item.label}指令已发送`);
                  }}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>
        <section class={styles.controlSection}>
          <h3>云台变焦</h3>
          <div class={styles.iconPairGrid}>
            <button
              onClick={() => {
                void runCommand(async () => cubeDroneService.cameraControl(nestSn.value, 31, "zoom1_add", 1), "放大指令已发送");
              }}
            >
              <PlusOutlined />
            </button>
            <button
              onClick={() => {
                void runCommand(async () => cubeDroneService.cameraControl(nestSn.value, 31, "zoom1_reduce", 1), "缩小指令已发送");
              }}
            >
              <MinusOutlined />
            </button>
          </div>
        </section>
      </div>
    );

    const renderCameraTab = (): JSX.Element => (
      <div class={styles.controlTab}>
        <section class={styles.controlSection}>
          <h3>镜头模式</h3>
          <div class={styles.panelActionGrid}>
            {cameraModeControls.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  class={styles.panelActionButton}
                  key={item.value}
                  onClick={() => {
                    void runCommand(async () => cubeDroneService.setCameraModel(nestSn.value, 31, item.value), `已切换${item.label}`);
                  }}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>
        <div class={styles.sliderBlock}>
          <div class={styles.sliderTitle}>
            <span>变倍设置</span>
            <strong>{zoomValue.value}</strong>
          </div>
          <Slider
            min={0}
            max={35}
            value={zoomValue.value}
            onChange={(value: number) => {
              zoomValue.value = value;
            }}
            onAfterChange={(value: number) => {
              void runCommand(async () => cubeDroneService.cloudZoom(nestSn.value, 31, 1, value), "变倍指令已发送");
            }}
          />
        </div>
        <section class={styles.controlSection}>
          <h3>变焦控制</h3>
          <div class={styles.iconPairGrid}>
            <button
              onClick={() => {
                void runCommand(
                  async () => cubeDroneService.cloudZoom(nestSn.value, 31, 1, Math.min(35, zoomValue.value + 1)),
                  "变焦放大指令已发送",
                );
              }}
            >
              <ZoomInOutlined />
            </button>
            <button
              onClick={() => {
                void runCommand(
                  async () => cubeDroneService.cloudZoom(nestSn.value, 31, 1, Math.max(0, zoomValue.value - 1)),
                  "变焦缩小指令已发送",
                );
              }}
            >
              <ZoomOutOutlined />
            </button>
          </div>
        </section>
      </div>
    );

    const renderNestTab = (): JSX.Element => (
      <div class={styles.controlTab}>
        <section class={styles.controlSection}>
          <h3>机库控制</h3>
          <div class={styles.panelActionGrid}>
            {nestActionControls.map((item) => {
              const Icon = item.icon;
              const onClick = (): void => {
                if (item.command === "hatch-open") {
                  void runCommand(async () => cubeDroneService.hatchControl(nestSn.value, "open"), "开舱指令已发送");
                  return;
                }
                if (item.command === "hatch-close") {
                  void runCommand(async () => cubeDroneService.hatchControl(nestSn.value, "close"), "关舱指令已发送");
                  return;
                }
                if (item.command === "putter-withdraw") {
                  void runCommand(async () => cubeDroneService.putterControl(nestSn.value, "withdraw"), "展开指令已发送");
                  return;
                }
                if (item.command === "putter-rellout") {
                  void runCommand(async () => cubeDroneService.putterControl(nestSn.value, "rellout"), "合拢指令已发送");
                  return;
                }
                if (item.command === "charge-start") {
                  void runCommand(async () => cubeDroneService.chargeControl(nestSn.value, "start"), "开始充电");
                  return;
                }
                if (item.command === "charge-stop") {
                  void runCommand(async () => cubeDroneService.chargeControl(nestSn.value, "stop"), "停止充电");
                  return;
                }
                message.warning(`${item.label}接口待后端提供`);
              };
              return (
                <button class={styles.panelActionButton} key={item.command} onClick={onClick}>
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );

    const renderShouter = (): JSX.Element => (
      <div class={[styles.shouter, shouterOpen.value ? styles.shouterOpen : ""]}>
        {!shouterOpen.value ? (
          <button
            class={styles.shouterMainButton}
            onClick={() => {
              shouterOpen.value = true;
            }}
          >
            <AudioOutlined />
            喊话
          </button>
        ) : (
          <>
            <div class={styles.shouterHeader}>
              <span>喊话器</span>
              <button
                onClick={() => {
                  shouterOpen.value = false;
                }}
              >
                <CloseOutlined />
              </button>
            </div>
            <Textarea v-model:value={shouterText.value} placeholder="输入喊话文本..." />
            <div class={styles.shouterActions}>
              <button
                class={styles.shouterPlayButton}
                onClick={() => {
                  void runCommand(
                    async () => cubeDroneService.transferShouterText({ nestSn: nestSn.value, text: shouterText.value }),
                    "喊话内容已下发",
                  );
                }}
              >
                <AudioOutlined />
                播放
              </button>
              <button
                class={styles.shouterSettingButton}
                onClick={() => {
                  message.info("喊话器设置待接入");
                }}
              >
                <SettingOutlined />
                设置
              </button>
            </div>
          </>
        )}
      </div>
    );

    return (): JSX.Element => {
      if (!selectedDrone.value) {
        return (
          <div class={styles.page}>
            <header class={styles.topBar}>
              <strong>实时监控</strong>
              <Select
                class={styles.droneSwitch}
                value={selectedDroneSn.value}
                options={droneOptions.value}
                placeholder="请选择巡检机"
                onChange={(value: string) => switchDrone(value)}
              />
            </header>
            <main class={styles.stage}>
              <section class={styles.mainView}>
                <div class={styles.emptyState}>暂无可监控无人机</div>
              </section>
            </main>
          </div>
        );
      }

      return (
        <div class={styles.page}>
          <header class={styles.topBar}>
            <strong>实时监控</strong>
            <Select
              class={styles.droneSwitch}
              value={selectedDrone.value.droneSn}
              options={droneOptions.value}
              placeholder="请选择巡检机"
              onChange={(value: string) => switchDrone(value)}
            />
            <strong>{selectedDrone.value.name}</strong>
            <span>{selectedDrone.value.nestName}</span>
            <span>电量 {selectedDrone.value.batteryCharge}%</span>
            <span>信号 {selectedDrone.value.signal}%</span>
            <span>{selectedDrone.value.online ? "在线" : "离线"}</span>
            <span>高度 {selectedDrone.value.altitude}m</span>
            <span>速度 {selectedDrone.value.speed}m/s</span>
            <span>GPS {selectedDrone.value.gpsStars}星</span>
            <span>
              姿态 Y:{selectedDrone.value.yaw} P:{selectedDrone.value.pitch} R:{selectedDrone.value.roll}
            </span>
            <div class={styles.takeoverControls}>
              <span class={[styles.statusPill, isManualControl.value ? styles.manualStatus : styles.autoStatus]}>
                {displayStatusText.value}
              </span>
              <button
                class={[styles.takeoverButton, hasControl.value ? styles.releaseButton : styles.applyButton]}
                onClick={() => {
                  void (hasControl.value ? releaseControl() : applyControl());
                }}
              >
                <span class={[styles.lockIcon, hasControl.value ? styles.unlockIcon : ""]} />
                {hasControl.value ? "释放权限" : "申请接管"}
              </button>
            </div>
          </header>
          <main class={styles.stage}>
            <aside class={[styles.leftPanel, leftCollapsed.value ? styles.collapsed : ""]}>
              <button
                class={styles.collapseButton}
                onClick={() => {
                  leftCollapsed.value = !leftCollapsed.value;
                }}
              >
                {leftCollapsed.value ? ">" : "<"}
              </button>
              {!leftCollapsed.value && (
                <>
                  <h2>飞行数据</h2>
                  <div class={styles.dataList}>
                    <span>
                      高度 <strong>{selectedDrone.value.altitude}m</strong>
                    </span>
                    <span>
                      地速 <strong>{selectedDrone.value.speed}m/s</strong>
                    </span>
                    <span>
                      经度 <strong>{selectedDrone.value.longitude.toFixed(4)}</strong>
                    </span>
                    <span>
                      纬度 <strong>{selectedDrone.value.latitude.toFixed(4)}</strong>
                    </span>
                    <span>
                      航向 <strong>{selectedDrone.value.yaw}°</strong>
                    </span>
                    <span>
                      俯仰 <strong>{selectedDrone.value.pitch}°</strong>
                    </span>
                    <span>
                      横滚 <strong>{selectedDrone.value.roll}°</strong>
                    </span>
                  </div>
                  <h2>任务进度</h2>
                  <div class={styles.taskProgress}>
                    <strong>{trackDetail.trackName}</strong>
                    <div>
                      <span
                        style={{
                          width: `${trackDetail.totalWaypoints > 0 ? Math.round((trackDetail.currentWaypoint / trackDetail.totalWaypoints) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <p>
                      {trackDetail.currentWaypoint}/{trackDetail.totalWaypoints}
                    </p>
                    <ol>
                      {trackDetail.points.map((item, index) => (
                        <li
                          class={
                            index + 1 < trackDetail.currentWaypoint
                              ? styles.done
                              : index + 1 === trackDetail.currentWaypoint
                                ? styles.current
                                : ""
                          }
                          key={item.id}
                        >
                          航点 {index + 1}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </aside>
            <section class={styles.mainView}>
              {mainView.value === "video" ? renderVideo() : renderMainMap()}
              <div class={styles.miniWindow}>
                <div class={styles.miniHeader}>
                  <span>{mainView.value === "video" ? "飞行地图" : "视频画面"}</span>
                  <Button
                    size="small"
                    onClick={() => {
                      mainView.value = mainView.value === "video" ? "map" : "video";
                    }}
                  >
                    {mainView.value === "video" ? "切地图" : "切视频"}
                  </Button>
                </div>
                {mainView.value === "video" ? renderSmallMap() : renderVideo(true)}
              </div>
            </section>
            <aside class={[styles.rightPanel, rightCollapsed.value ? styles.collapsed : ""]}>
              <button
                class={styles.collapseButton}
                onClick={() => {
                  rightCollapsed.value = !rightCollapsed.value;
                }}
              >
                {rightCollapsed.value ? "<" : ">"}
              </button>
              {!rightCollapsed.value && (
                <>
                  <div class={styles.controlPanelBody}>
                    <Tabs
                      activeKey={activeTab.value}
                      onTabChange={(key: string | number) => {
                        activeTab.value = String(key);
                      }}
                    >
                      <TabPane key="flight" tab="飞行">
                        {renderFlightTab()}
                      </TabPane>
                      <TabPane key="gimbal" tab="云台">
                        {renderGimbalTab()}
                      </TabPane>
                      <TabPane key="camera" tab="相机">
                        {renderCameraTab()}
                      </TabPane>
                      <TabPane key="nest" tab="机库">
                        {renderNestTab()}
                      </TabPane>
                    </Tabs>
                  </div>
                  {renderShouter()}
                </>
              )}
            </aside>
          </main>
        </div>
      );
    };
  },
});
