import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { ArrowLeftOutlined, Button, Descriptions, DescriptionsItem, Empty, Space, TabPane, Tabs, Tag } from "@ghcloud/cube-ui";

import { useAlarmOperationModal } from "../alarm-operation-modal/alarm-operation-modal";
import { RealtimeMap } from "../realtime-map/realtime-map";
import { ALARM_ACTIONS, ALARM_LEVELS, ALARM_STATES, ALARM_TYPES, OUTDOOR_SCENE_ID } from "@/constants/realtime";
import { isPlanImage } from "@/constants/space-archive";
import { useRealtimeStore } from "@/stores/realtime";
import { useSpaceArchiveStore } from "@/stores/space-archive";
import { formatDateTime } from "@/utils/positioning";
import { alarmDuration, availableAlarmActions } from "@/utils/realtime";

import "./alarm-detail.less";

const outdoorMap = new URL("../../../assets/outdoor-map-demo.svg", import.meta.url).href;

export const PositionAlarmDetail = defineComponent({
  name: "PositionAlarmDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useRealtimeStore();
    const spaces = useSpaceArchiveStore();
    const alarm = computed(() => store.findAlarm(String(route.params.id ?? "")));
    const activeTab = ref("detail");
    const imageFailed = ref(false);
    const now = ref(Date.now());
    const timer = setInterval(() => {
      now.value = Date.now();
    }, 60000);
    onBeforeUnmount(() => clearInterval(timer));
    const operations = useAlarmOperationModal(() => {
      now.value = Date.now();
    });
    const background = computed(() => {
      if (alarm.value?.sceneId === OUTDOOR_SCENE_ID) {
        return outdoorMap;
      }
      const plan = spaces.currentPlan(alarm.value?.sceneId ?? "");
      return plan && isPlanImage(plan.fileName) ? plan.url : "";
    });
    watch(
      () => route.params.id,
      () => {
        activeTab.value = "detail";
        imageFailed.value = false;
      },
    );
    const returnTo = computed(() => {
      const target = route.query.returnTo;
      return typeof target === "string" && /^\/(?:realtime|trajectory(?:\/[^/?#]+)?)(?:[?#]|$)/.test(target) && !/[\\\r\n]/.test(target)
        ? target
        : "/realtime";
    });
    const returnLabel = computed(() => (returnTo.value.startsWith("/trajectory") ? "返回历史轨迹" : "返回实时定位"));
    function back(): void {
      void router.push(returnTo.value);
    }
    return () => (
      <>
        <CubeLayout
          title="告警详情"
          showFooter={false}
          v-slots={{
            "layout-header": () => (
              <Button onClick={back}>
                <ArrowLeftOutlined />
                {returnLabel.value}
              </Button>
            ),
            "layout-content": () =>
              alarm.value ? (
                <div class="pp-alarm-detail">
                  <div class={["pp-alarm-detail__summary", { "is-critical": alarm.value.level === 1 }]}>
                    <div>
                      <Tag color={ALARM_LEVELS[alarm.value.level].color}>{ALARM_LEVELS[alarm.value.level].label}告警</Tag>
                      <strong>{ALARM_TYPES[alarm.value.type]}</strong>
                      <Tag color={ALARM_STATES[alarm.value.state].color}>{ALARM_STATES[alarm.value.state].label}</Tag>
                    </div>
                    <p>
                      {alarm.value.personName || alarm.value.regionName} · {alarm.value.regionName || alarm.value.sceneName}
                    </p>
                    <span class="pp-muted">
                      {alarm.value.id} · 发生于 {formatDateTime(alarm.value.occurredAt)} · 告警持续 {alarmDuration(alarm.value, now.value)}
                    </span>
                  </div>
                  <Tabs
                    activeKey={activeTab.value}
                    onTabChange={(key: string) => {
                      activeTab.value = key;
                    }}
                  >
                    <TabPane key="detail" tab="告警详情" />
                    <TabPane key="records" tab={`处理记录（${alarm.value.operations.length}）`} />
                  </Tabs>
                  <div class="pp-alarm-detail__content">
                    {activeTab.value === "detail" ? (
                      <>
                        <section>
                          <h3>告警基本信息</h3>
                          <Descriptions column={3} size="small">
                            <DescriptionsItem label="告警类型">{ALARM_TYPES[alarm.value.type]}</DescriptionsItem>
                            <DescriptionsItem label="告警等级">{ALARM_LEVELS[alarm.value.level].label}</DescriptionsItem>
                            <DescriptionsItem label="处置状态">{ALARM_STATES[alarm.value.state].label}</DescriptionsItem>
                            <DescriptionsItem label="发生时间">{formatDateTime(alarm.value.occurredAt)}</DescriptionsItem>
                            <DescriptionsItem label="接收时间">{formatDateTime(alarm.value.receivedAt)}</DescriptionsItem>
                            <DescriptionsItem label="告警持续时间">{alarmDuration(alarm.value, now.value)}</DescriptionsItem>
                            <DescriptionsItem label="恢复时间">{formatDateTime(alarm.value.recoveredAt)}</DescriptionsItem>
                            <DescriptionsItem label="关闭时间">{formatDateTime(alarm.value.closedAt)}</DescriptionsItem>
                            <DescriptionsItem label="当前处置人">{alarm.value.assignee || "未指派"}</DescriptionsItem>
                          </Descriptions>
                        </section>
                        <section>
                          <h3>告警对象</h3>
                          <Descriptions column={3} size="small">
                            <DescriptionsItem label="告警对象">{alarm.value.personName || alarm.value.regionName}</DescriptionsItem>
                            {alarm.value.personId ? (
                              <>
                                <DescriptionsItem label="人员编号">{alarm.value.personId}</DescriptionsItem>
                                <DescriptionsItem label="上报终端">{alarm.value.terminalId || "—"}</DescriptionsItem>
                              </>
                            ) : (
                              <DescriptionsItem label="事件发生时当前人数">
                                {alarm.value.currentCount === null ? "—" : `${alarm.value.currentCount} 人`}
                              </DescriptionsItem>
                            )}
                            <DescriptionsItem label="监控区域">{alarm.value.regionName || "—"}</DescriptionsItem>
                            <DescriptionsItem label="定位规则">{alarm.value.ruleName || "—"}</DescriptionsItem>
                            <DescriptionsItem label="发生场景">{alarm.value.sceneName}</DescriptionsItem>
                          </Descriptions>
                        </section>
                        <section>
                          <h3>触发详情</h3>
                          <Descriptions column={2} size="small">
                            <DescriptionsItem label={alarm.value.type === "sos" ? "触发方式" : "触发条件"}>
                              {alarm.value.trigger || "—"}
                            </DescriptionsItem>
                            <DescriptionsItem label="事件数据">{alarm.value.actualValue || "—"}</DescriptionsItem>
                            {alarm.value.type === "sos" && (
                              <DescriptionsItem label="响应状态">{ALARM_STATES[alarm.value.state].label}</DescriptionsItem>
                            )}
                          </Descriptions>
                        </section>
                        <section>
                          <h3>告警发生位置</h3>
                          <div class="pp-alarm-detail__location">
                            <span>{alarm.value.sceneName}</span>
                            <span>{alarm.value.coordinateText}</span>
                            <span>位置数据时间：{formatDateTime(alarm.value.positionAt)}</span>
                          </div>
                          <div class="pp-alarm-detail__map">
                            {background.value && !imageFailed.value ? (
                              <RealtimeMap
                                sceneName={alarm.value.sceneName}
                                backgroundUrl={background.value}
                                eventPoint={alarm.value.coordinate}
                                eventLabel={alarm.value.positionAt ? "最近位置，仅供参考" : "监控区域参考位置"}
                                onImageError={() => {
                                  imageFailed.value = true;
                                }}
                              />
                            ) : (
                              <Empty description="当前场景暂无可显示的地图，事件位置见上方记录" />
                            )}
                          </div>
                        </section>
                      </>
                    ) : (
                      <section class="pp-alarm-detail__records">
                        <div class="pp-alarm-detail__progress">
                          <strong>当前进度</strong>
                          <Tag color={ALARM_STATES[alarm.value.state].color}>{ALARM_STATES[alarm.value.state].label}</Tag>
                          <span>处置人：{alarm.value.assignee || "未指派"}</span>
                        </div>
                        {alarm.value.operations.length ? (
                          <ol>
                            {alarm.value.operations.toReversed().map((item) => (
                              <li key={item.id}>
                                <div>
                                  <strong>{ALARM_ACTIONS[item.action]}</strong>
                                  <time>{formatDateTime(item.at)}</time>
                                </div>
                                <p>
                                  {item.operator}
                                  {item.assignee ? ` → ${item.assignee}` : ""}
                                </p>
                                <p class="pp-alarm-detail__opinion">{item.opinion}</p>
                                {item.attachments?.map((file) => (
                                  <a key={file.id} href={file.url} download={file.name}>
                                    {file.name}
                                  </a>
                                ))}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <Empty description="暂无处理记录，请通过底部操作处理告警" />
                        )}
                      </section>
                    )}
                  </div>
                  <footer class="pp-alarm-detail__footer">
                    <span class="pp-muted">处置结果仅保留在当前演示会话</span>
                    <Space>
                      <Button onClick={back}>返回</Button>
                      {availableAlarmActions(alarm.value).map((action, index) => (
                        <Button
                          key={action}
                          type={index === 0 ? "primary" : "default"}
                          danger={action === "falseAlarm" || action === "close"}
                          onClick={() => operations.open(alarm.value!.id, action)}
                        >
                          {ALARM_ACTIONS[action]}
                        </Button>
                      ))}
                    </Space>
                  </footer>
                </div>
              ) : (
                <Empty description="告警不存在或已移除">
                  <Button onClick={back}>{returnLabel.value}</Button>
                </Empty>
              ),
          }}
        />
        <operations.AlarmOperationModal />
      </>
    );
  },
});
