import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

import { AimOutlined, Button } from "@ghcloud/cube-ui";

import { DroneGisMap } from "../components/drone-gis-map";
import {
  alertStatusTextMap,
  alerts,
  droneStatusTextMap,
  drones,
  getAlertLevel,
  inspectionObjects,
  nests,
  todayInspectionTasks,
  trackDetail,
} from "../data";

import styles from "./overview.module.less";

const formatTime = (date: Date): string => {
  const pad = (value: number): string => `${value}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const progressWidth = (current: number, total: number): string => (total > 0 ? `${Math.round((current / total) * 100)}%` : "0%");

export const DroneInspectionOverview = defineComponent({
  name: "DroneInspectionOverview",
  setup: () => {
    const router = useRouter();
    const now = ref(formatTime(new Date()));
    const statusMode = ref<"standby" | "flying">("standby");
    const selectedDroneSn = ref(drones[0]?.droneSn ?? "");
    const selectedNestSn = ref(nests[0]?.nestSn ?? "");
    let timer: number | undefined;

    const onlineDrones = computed(() => drones.filter((item) => item.online));
    const standbyDrones = computed(() => drones.filter((item) => !item.online || item.status === "standby"));
    const selectedDrone = computed(() => drones.find((item) => item.droneSn === selectedDroneSn.value) ?? drones[0]);
    const selectedNest = computed(() => nests.find((item) => item.nestSn === selectedNestSn.value) ?? nests[0]);
    const isFlying = computed(() => statusMode.value === "flying");
    const standbyCount = computed(() => standbyDrones.value.length);
    const overviewAlerts = computed(() => alerts);
    const overviewTasks = computed(() => todayInspectionTasks);
    const mapFocusPoint = computed(() => {
      if (isFlying.value && selectedDrone.value) {
        return { lng: selectedDrone.value.longitude, lat: selectedDrone.value.latitude };
      }
      if (selectedNest.value) {
        return { lng: selectedNest.value.longitude, lat: selectedNest.value.latitude };
      }
      return null;
    });
    const normalObjectCount = computed(() => inspectionObjects.filter((item) => item.status === "normal").length);
    const warningObjectCount = computed(() => inspectionObjects.filter((item) => item.status !== "normal").length);
    const runningTaskCount = computed(() => overviewTasks.value.filter((item) => item.status === "running").length);
    const completedTaskCount = computed(() => overviewTasks.value.filter((item) => item.status === "completed").length);

    onMounted(() => {
      timer = window.setInterval(() => {
        now.value = formatTime(new Date());
      }, 1000);
    });

    onUnmounted(() => {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    const setMode = (mode: "standby" | "flying"): void => {
      statusMode.value = mode;
      if (mode === "flying" && !selectedDroneSn.value) {
        selectedDroneSn.value = drones[0]?.droneSn ?? "";
      }
      if (mode === "standby" && !selectedNestSn.value) {
        selectedNestSn.value = nests[0]?.nestSn ?? "";
      }
    };

    const renderNestCard = (): JSX.Element[] =>
      nests.map((nest) => (
        <button
          class={[styles.panelCard, styles.selectableCard, selectedNestSn.value === nest.nestSn ? styles.activeCard : ""]}
          key={nest.nestSn}
          onClick={() => {
            selectedNestSn.value = nest.nestSn;
          }}
        >
          <div class={styles.cardHeader}>
            <strong>{nest.nestName}</strong>
            <span class={[styles.statePill, nest.online ? styles.online : styles.offline]}>{nest.online ? "在线" : "离线"}</span>
          </div>
          <div class={styles.metricGrid}>
            <span>温度：{nest.temperature}°C</span>
            <span>湿度：{nest.humidity}%</span>
            <span>充电：{nest.chargeStatus ? "充电中" : "未充电"}</span>
            <span>舱门：{nest.doorStatus ? "开" : "关"}</span>
          </div>
          <div class={[styles.smoke, nest.smoke ? styles.alertText : ""]}>烟雾：{nest.smoke ? "异常" : "正常"}</div>
        </button>
      ));

    const renderDroneCard = (): JSX.Element[] =>
      drones.map((drone) => (
        <button
          class={[styles.panelCard, styles.droneCard, selectedDroneSn.value === drone.droneSn ? styles.activeCard : ""]}
          key={drone.droneSn}
          onClick={() => {
            selectedDroneSn.value = drone.droneSn;
          }}
        >
          <div class={styles.cardHeader}>
            <strong>{drone.name}</strong>
            <span class={[styles.statePill, drone.online ? styles.online : styles.standby]}>
              {drone.online ? droneStatusTextMap[drone.status] : "待命"}
            </span>
          </div>
          <div class={styles.metricGrid}>
            <span>电量：{drone.batteryCharge}%</span>
            <span>信号：{drone.signal}%</span>
            <span>GPS：{drone.gpsStars}星</span>
            <span>高度：{drone.altitude}m</span>
          </div>
          <div class={styles.progressTrack}>
            <span style={{ width: progressWidth(trackDetail.currentWaypoint, trackDetail.totalWaypoints) }} />
          </div>
          <div class={styles.progressText}>
            航点进度：{trackDetail.currentWaypoint}/{trackDetail.totalWaypoints}
          </div>
        </button>
      ));

    const renderSelectedInfo = (): JSX.Element => {
      if (isFlying.value && selectedDrone.value) {
        const drone = selectedDrone.value;
        return (
          <section>
            <h2>飞机信息</h2>
            <div class={styles.infoCard}>
              <div class={styles.cardHeader}>
                <strong>{drone.name}</strong>
                <span class={[styles.statePill, drone.online ? styles.online : styles.standby]}>
                  {drone.online ? droneStatusTextMap[drone.status] : "待命"}
                </span>
              </div>
              <div class={styles.metricGrid}>
                <span>所属机巢：{drone.nestName}</span>
                <span>电量：{drone.batteryCharge}%</span>
                <span>高度：{drone.altitude}m</span>
                <span>速度：{drone.speed}m/s</span>
                <span>GPS：{drone.gpsStars}星</span>
                <span>信号：{drone.signal}%</span>
              </div>
              <Button
                size="small"
                onClick={() => {
                  void router.push({
                    path: "/monitor",
                    query: {
                      droneSn: drone.droneSn,
                      nestSn: drone.nestSn,
                      taskLogId: trackDetail.taskLogId,
                    },
                  });
                }}
              >
                进入实时监控
              </Button>
            </div>
          </section>
        );
      }

      const nest = selectedNest.value;
      if (!nest) {
        return (
          <section>
            <h2>机巢信息</h2>
            <div class={styles.emptyRuntime}>暂无机巢数据</div>
          </section>
        );
      }
      return (
        <section>
          <h2>机巢信息</h2>
          <div class={styles.infoCard}>
            <div class={styles.cardHeader}>
              <strong>{nest.nestName}</strong>
              <span class={[styles.statePill, nest.online ? styles.online : styles.offline]}>{nest.online ? "在线" : "离线"}</span>
            </div>
            <div class={styles.metricGrid}>
              <span>温度：{nest.temperature}°C</span>
              <span>湿度：{nest.humidity}%</span>
              <span>充电：{nest.chargeStatus ? "充电中" : "未充电"}</span>
              <span>舱门：{nest.doorStatus ? "开" : "关"}</span>
            </div>
          </div>
        </section>
      );
    };

    const renderAlertList = (): JSX.Element => {
      const [primaryAlert, ...restAlerts] = overviewAlerts.value.slice(0, 10);

      return (
        <div class={styles.alertList}>
          {primaryAlert && (
            <div class={[styles.primaryAlertCard, styles[getAlertLevel(primaryAlert.confidence)]]}>
              <div class={styles.alertTop}>
                <strong>{primaryAlert.type}</strong>
                <span>{primaryAlert.time.slice(11)}</span>
              </div>
              <p>
                {primaryAlert.location} | 置信度{primaryAlert.confidence}%
              </p>
              <button
                class={styles.takeoverButton}
                onClick={() => {
                  const drone = selectedDrone.value?.online ? selectedDrone.value : (onlineDrones.value[0] ?? drones[0]);
                  if (!drone) {
                    return;
                  }
                  void router.push({
                    path: "/monitor",
                    query: {
                      droneSn: drone.droneSn,
                      nestSn: drone.nestSn,
                      taskLogId: trackDetail.taskLogId,
                      lat: primaryAlert.gps?.lat ?? "",
                      lng: primaryAlert.gps?.lng ?? "",
                      alertId: primaryAlert.id,
                    },
                  });
                }}
              >
                <AimOutlined />
                接管核实
              </button>
            </div>
          )}
          {!primaryAlert && <div class={styles.emptyRuntime}>暂无实时告警</div>}
          {restAlerts.map((alert) => (
            <button
              class={styles.alertRow}
              key={alert.id}
              onClick={() => {
                void router.push({ path: "/alerts", query: { id: alert.id } });
              }}
            >
              <span>
                {alert.type} {alert.confidence}%
              </span>
              <em>{alertStatusTextMap[alert.status]}</em>
            </button>
          ))}
        </div>
      );
    };

    const renderTaskCard = (task: (typeof todayInspectionTasks)[number]): JSX.Element => (
      <div class={styles.taskCard} key={task.id}>
        <div class={styles.taskHeader}>
          <strong>{task.name}</strong>
          <span class={[styles.statePill, task.status === "running" ? styles.online : styles.standby]}>
            {task.status === "running" ? "进行中" : "已完成"}
          </span>
        </div>
        <div class={styles.taskMeta}>
          <span>{task.time}</span>
          <span>
            航点 {task.currentWaypoint}/{task.totalWaypoints}
          </span>
        </div>
        {task.status === "completed" ? <Button size="small">查看报告</Button> : <em>巡检中...</em>}
      </div>
    );

    return (): JSX.Element => (
      <div class={styles.page}>
        <header class={styles.header}>
          <div>
            <h1>粮库无人机巡检系统</h1>
            <span class={[styles.statePill, isFlying.value ? styles.online : styles.standby]}>{isFlying.value ? "飞行态" : "待命态"}</span>
          </div>
          <div class={styles.headerStats}>
            <span>在线 {onlineDrones.value.length} 架</span>
            <span>待命 {standbyCount.value} 架</span>
            <span>{now.value}</span>
            <div class={styles.modeSwitch}>
              <Button type={!isFlying.value ? "primary" : "default"} size="small" onClick={() => setMode("standby")}>
                待命态
              </Button>
              <Button type={isFlying.value ? "primary" : "default"} size="small" onClick={() => setMode("flying")}>
                飞行态
              </Button>
            </div>
          </div>
        </header>
        <main class={styles.body}>
          <aside class={styles.leftPanel}>
            <h2>{isFlying.value ? "飞机状态" : "机巢状态"}</h2>
            <div class={styles.panelList}>
              {isFlying.value ? (
                drones.length > 0 ? (
                  renderDroneCard()
                ) : (
                  <div class={styles.emptyRuntime}>暂无飞机数据</div>
                )
              ) : nests.length > 0 ? (
                renderNestCard()
              ) : (
                <div class={styles.emptyRuntime}>暂无机巢数据</div>
              )}
            </div>
          </aside>
          <section class={styles.center}>
            <DroneGisMap
              drones={drones}
              nests={nests}
              objects={inspectionObjects}
              track={isFlying.value ? trackDetail : null}
              showObjects
              showTrack={isFlying.value}
              focus="drone"
              focusPoint={mapFocusPoint.value}
            />
            <div class={styles.mapTitle}>{isFlying.value ? "在线飞机实时位置与轨迹" : "机巢分布与巡检对象点位"}</div>
          </section>
          <aside class={styles.rightPanel}>
            {renderSelectedInfo()}
            <section>
              <h2>实时告警</h2>
              {renderAlertList()}
            </section>
            <section>
              <h2>今日巡检</h2>
              <div class={styles.taskList}>
                {overviewTasks.value.length > 0 ? (
                  overviewTasks.value.map(renderTaskCard)
                ) : (
                  <div class={styles.emptyRuntime}>暂无今日巡检</div>
                )}
              </div>
            </section>
            <section>
              <h2>关键指标</h2>
              <div class={styles.kpiGrid}>
                <div>
                  <strong>{normalObjectCount.value}</strong>
                  <span>正常对象</span>
                </div>
                <div>
                  <strong>{warningObjectCount.value}</strong>
                  <span>预警对象</span>
                </div>
                <div>
                  <strong>{runningTaskCount.value}</strong>
                  <span>进行中</span>
                </div>
                <div>
                  <strong>{completedTaskCount.value}</strong>
                  <span>已完成</span>
                </div>
              </div>
            </section>
          </aside>
        </main>
      </div>
    );
  },
});
