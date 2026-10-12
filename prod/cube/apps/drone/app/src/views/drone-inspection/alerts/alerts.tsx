import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, DateRangePicker, Empty, Input, Modal, Select, TabPane, Tabs } from "@ghcloud/cube-ui";

import {
  AlertSource,
  AlertStatus,
  DroneAlert,
  alertSourceOptions,
  alertSourceTextMap,
  alertStatusOptions,
  alertStatusTextMap,
  alertTypeOptions,
  alerts,
  getAlertLevel,
  handleRecords,
  trackDetail,
} from "../data";

import styles from "./alerts.module.less";

interface SearchState {
  timeRange: string[];
  type: string;
  source: AlertSource | "";
  status: AlertStatus | "";
  keyword: string;
}

const contains = (value: string, keyword: string): boolean => value.toLowerCase().includes(keyword.toLowerCase());

export const DroneInspectionAlerts = defineComponent({
  name: "DroneInspectionAlerts",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const activeTab = ref("alerts");
    const detailVisible = ref(false);
    const selectedAlert = ref<DroneAlert>();
    const search = reactive<SearchState>({
      timeRange: [],
      type: "",
      source: "",
      status: "",
      keyword: "",
    });

    const filteredAlerts = computed(() =>
      alerts.filter((item) => {
        const keyword = search.keyword.trim();
        const keywordMatched = !keyword || contains(item.type, keyword) || contains(item.location, keyword);
        return (
          keywordMatched &&
          (!search.type || item.type === search.type) &&
          (!search.source || item.source === search.source) &&
          (!search.status || item.status === search.status)
        );
      }),
    );

    onMounted(() => {
      const id = String(route.query.id ?? "");
      const alert = alerts.find((item) => item.id === id);
      if (alert) {
        selectedAlert.value = alert;
        detailVisible.value = true;
      }
    });

    const reset = (): void => {
      search.timeRange = [];
      search.type = "";
      search.source = "";
      search.status = "";
      search.keyword = "";
    };

    const openDetail = (alert: DroneAlert): void => {
      selectedAlert.value = alert;
      detailVisible.value = true;
    };

    const takeover = (alert: DroneAlert): void => {
      void router.push({
        path: "/monitor",
        query: {
          droneSn: "DRONE001",
          nestSn: "NEST001",
          taskLogId: trackDetail.taskLogId,
          lat: alert.gps?.lat ?? "",
          lng: alert.gps?.lng ?? "",
          alertId: alert.id,
        },
      });
    };

    const renderAlertCard = (alert: DroneAlert): JSX.Element => (
      <div class={[styles.alertCard, styles[getAlertLevel(alert.confidence)]]} key={alert.id}>
        <div class={styles.cardMain}>
          <div class={styles.snapshot}>{alert.image}</div>
          <div class={styles.cardInfo}>
            <div class={styles.cardTitle}>
              <strong>{alert.type}</strong>
              <span>{alert.confidence}%</span>
              <em>{alertSourceTextMap[alert.source]}</em>
            </div>
            <p>位置：{alert.location}</p>
            <p>时间：{alert.time}</p>
            {alert.handleRecord && <p>处置：{alert.handleRecord}</p>}
          </div>
        </div>
        <div class={styles.cardActions}>
          <span class={[styles.status, styles[alert.status]]}>{alertStatusTextMap[alert.status]}</span>
          {alert.source === "cruise" && alert.status === "pending" && (
            <Button
              type="primary"
              onClick={() => {
                takeover(alert);
              }}
            >
              接管核实
            </Button>
          )}
          <Button
            onClick={() => {
              openDetail(alert);
            }}
          >
            查看详情
          </Button>
        </div>
      </div>
    );

    const renderHandleRecord = (): JSX.Element[] =>
      handleRecords.map((item) => (
        <div class={styles.recordCard} key={item.id}>
          <div>
            <strong>
              {item.time} {item.type}
            </strong>
            <span>{item.location}</span>
          </div>
          <p>{item.flow}</p>
          <em class={item.status === "已闭环" ? styles.resolved : styles.processing}>{item.status}</em>
        </div>
      ));

    const renderDetailModal = (): JSX.Element => (
      <Modal
        visible={detailVisible.value}
        title="告警详情"
        width="760px"
        footer=""
        onCancel={() => {
          detailVisible.value = false;
        }}
      >
        {selectedAlert.value && (
          <div class={styles.detail}>
            <div class={styles.detailImage}>
              <span>{selectedAlert.value.image}</span>
              <i />
            </div>
            <div class={styles.detailInfo}>
              <h3>基本信息</h3>
              <p>
                <span>类型：</span>
                {selectedAlert.value.type}
              </p>
              <p>
                <span>置信度：</span>
                {selectedAlert.value.confidence}%
              </p>
              <p>
                <span>来源：</span>
                {alertSourceTextMap[selectedAlert.value.source]}
                {selectedAlert.value.source === "cruise" ? " ★" : ""}
              </p>
              <p>
                <span>位置：</span>
                {selectedAlert.value.location}
              </p>
              <p>
                <span>时间：</span>
                {selectedAlert.value.time}
              </p>
              <p>
                <span>状态：</span>
                {alertStatusTextMap[selectedAlert.value.status]}
              </p>
            </div>
            <div class={styles.detailMap}>
              <span>地图打点位置</span>
              <em>
                {selectedAlert.value.gps ? `${selectedAlert.value.gps.lat}, ${selectedAlert.value.gps.lng}` : selectedAlert.value.location}
              </em>
            </div>
            <div class={styles.detailFooter}>
              {selectedAlert.value.source === "cruise" && selectedAlert.value.status === "pending" && (
                <Button
                  type="primary"
                  onClick={() => {
                    takeover(selectedAlert.value as DroneAlert);
                  }}
                >
                  接管核实
                </Button>
              )}
              <Button
                onClick={() => {
                  detailVisible.value = false;
                }}
              >
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>
    );

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <div class={styles.filterBar}>
            <label>
              时间范围：
              <DateRangePicker v-model:value={search.timeRange} />
            </label>
            <label>
              告警类型：
              <Select options={alertTypeOptions} v-model:value={search.type} placeholder="请选择告警类型" />
            </label>
            <label>
              来源类型：
              <Select options={alertSourceOptions} v-model:value={search.source} placeholder="请选择来源类型" />
            </label>
            <label>
              处理状态：
              <Select options={alertStatusOptions} v-model:value={search.status} placeholder="请选择处理状态" />
            </label>
            <Input class={styles.keyword} v-model:value={search.keyword} placeholder="告警类型/位置" />
            <Button type="primary">查询</Button>
            <Button onClick={reset}>重置</Button>
          </div>
          <Tabs
            activeKey={activeTab.value}
            onTabChange={(key: string | number) => {
              activeTab.value = String(key);
            }}
          >
            <TabPane key="alerts" tab="告警列表">
              <div class={styles.listPanel}>{filteredAlerts.value.length > 0 ? filteredAlerts.value.map(renderAlertCard) : <Empty />}</div>
            </TabPane>
            <TabPane key="records" tab="处置记录">
              <div class={styles.recordPanel}>{renderHandleRecord()}</div>
            </TabPane>
          </Tabs>
          {renderDetailModal()}
        </div>
      ),
    };

    return (): JSX.Element => <CubeLayout class={styles.container} title="告警与处置" v-slots={slots} />;
  },
});
