import { defineComponent, shallowRef } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Button, Descriptions, DescriptionsItem, Space, Tag } from "@ghcloud/cube-ui";

import { TRAJECTORY_EVENT_TYPES } from "@/constants/trajectory";
import type { TrajectoryEvent } from "@/models/trajectory";
import { formatDateTime } from "@/utils/positioning";

import "./trajectory-event-modal.less";

export function useTrajectoryEventModal(onSeek: (event: TrajectoryEvent) => void, onAlarm: (id: string) => void) {
  const event = shallowRef<TrajectoryEvent>();
  const [CubeModal, modal] = useCubeModal({ title: "轨迹事件详情", width: "620px", wrapperClass: "pp-trajectory-event-modal" });
  const TrajectoryEventModal = defineComponent({
    name: "TrajectoryEventModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: () =>
            event.value && (
              <div class="pp-trajectory-event-modal__content">
                <div class="pp-trajectory-event-modal__title">
                  <Tag color={TRAJECTORY_EVENT_TYPES[event.value.kind].color}>{TRAJECTORY_EVENT_TYPES[event.value.kind].label}</Tag>
                  <strong>{event.value.title}</strong>
                </div>
                <Descriptions column={1} bordered size="small">
                  <DescriptionsItem label="发生时间">{formatDateTime(event.value.at)}</DescriptionsItem>
                  {event.value.endAt && <DescriptionsItem label="结束时间">{formatDateTime(event.value.endAt)}</DescriptionsItem>}
                  <DescriptionsItem label="场景">{event.value.sceneName}</DescriptionsItem>
                  {event.value.regionName && <DescriptionsItem label="监控区域">{event.value.regionName}</DescriptionsItem>}
                  {event.value.coordinateText && <DescriptionsItem label="位置坐标">{event.value.coordinateText}</DescriptionsItem>}
                  <DescriptionsItem label="事件说明">{event.value.description || "—"}</DescriptionsItem>
                </Descriptions>
              </div>
            ),
          footer: () => (
            <Space>
              <Button onClick={() => modal.close()}>关闭</Button>
              {event.value?.alarmId && (
                <Button
                  onClick={() => {
                    if (event.value?.alarmId) {
                      onAlarm(event.value.alarmId);
                      modal.close();
                    }
                  }}
                >
                  查看告警详情
                </Button>
              )}
              <Button
                type="primary"
                onClick={() => {
                  if (event.value) {
                    onSeek(event.value);
                    modal.close();
                  }
                }}
              >
                跳转回放
              </Button>
            </Space>
          ),
        }}
      />
    ),
  });
  return {
    TrajectoryEventModal,
    open: (value: TrajectoryEvent) => {
      event.value = value;
      modal.setState({ title: value.kind === "position" ? "位置详情" : "轨迹事件详情" });
      modal.open();
    },
  };
}
