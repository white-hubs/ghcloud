import { TabPane, Tabs } from "ant-design-vue";
import { computed, defineComponent, ref, shallowRef, watch, type PropType } from "vue";

import { confirmAlarmRecord, getAlarmRecordDetail } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { AntModal, Button, Empty, message, Space, Spin } from "@ghcloud/cube-ui";

import type { AlarmActionType, AlarmRecord } from "../../alarm-record-types";
import { AlarmActionModal } from "../alarm-action-modal";
import { AlarmDetailTab } from "./tabs/alarm-detail-tab";
import { LinkageActionTab } from "./tabs/linkage-action-tab";
import { NearbyEquipmentTab } from "./tabs/nearby-equipment-tab";
import { ProcessRecordTab } from "./tabs/process-record-tab";

import "./index.less";

type AlarmNotifyUser = AlarmRecord["alarmNotifyUsers"][number];

const normalizeNotifyUsers = (data: Partial<AlarmRecord> & { alarmNotifyUsername?: string }): AlarmNotifyUser[] => {
  if (data.alarmNotifyUsers?.length) {
    return data.alarmNotifyUsers;
  }
  if (!data.alarmNotifyUsername) {
    return [];
  }
  return data.alarmNotifyUsername
    .split(/[,，、]/)
    .filter(Boolean)
    .map((userName, index) => ({
      id: `${index}`,
      userId: "",
      userName,
    }));
};

export const AlarmRecordDetail = defineComponent({
  name: "AlarmRecordDetail",
  props: {
    alarmId: {
      type: String,
      required: true,
    },
    initialRecord: {
      type: Object as PropType<Partial<AlarmRecord> | null>,
      default: null,
    },
    detailExtra: {
      type: Function as PropType<() => JSX.Element | null>,
      default: null,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    actionPlacement: {
      type: String as PropType<"top" | "bottom">,
      default: "top",
    },
  },
  setup: (props) => {
    const activeTab = shallowRef("baseInfo");
    const loading = shallowRef(false);
    const record = ref<AlarmRecord | null>(null);
    const actionModal = ref<{ visible: boolean; action: AlarmActionType; record: AlarmRecord | null }>({
      visible: false,
      action: "transfer",
      record: null,
    });
    let requestSeq = 0;

    const normalizeRecord = (data: Partial<AlarmRecord> & { alarmNotifyUsername?: string }, alarmId: string): AlarmRecord => ({
      id: String(data.id ?? alarmId),
      applicationCode: data.applicationCode,
      alarmEventName: data.alarmEventName ?? "--",
      alarmLevelId: data.alarmLevelId,
      alarmLevelName: data.alarmLevelName ?? "三级",
      areaName: data.areaName ?? "--",
      alarmTargetAddress: data.alarmTargetAddress ?? "--",
      alarmTime: data.alarmTime ?? "--",
      alarmTargetId: data.alarmTargetId,
      alarmTargetName: data.alarmTargetName ?? "--",
      alarmTargetType: data.alarmTargetType ?? "--",
      timeoutProcessTimesName: data.timeoutProcessTimesName ?? "--",
      alarmHandlerTimeoutStatus: data.alarmHandlerTimeoutStatus ?? "NORMAL",
      alarmStatus: data.alarmStatus ?? "ALARM_UN_CONFIRMED",
      alarmHandlerResult: data.alarmHandlerResult,
      alarmHandlerName: data.alarmHandlerName,
      alarmHandlerBy: data.alarmHandlerBy,
      alarmNotifyUsers: normalizeNotifyUsers(data),
      businessKey: data.businessKey ?? "",
      processingTime: data.processingTime,
      handler: data.handler,
      suspend: data.suspend,
      followUps: data.followUps ?? [],
    });

    const loadDetail = async (): Promise<void> => {
      if (!props.alarmId) {
        record.value = null;
        return;
      }
      const seq = ++requestSeq;
      if (props.initialRecord) {
        record.value = normalizeRecord(props.initialRecord, props.alarmId);
        loading.value = false;
      } else {
        loading.value = true;
      }
      try {
        const data = await useAuthRequest(() => getAlarmRecordDetail(props.alarmId));
        if (seq === requestSeq) {
          record.value = normalizeRecord({ ...(props.initialRecord ?? {}), ...(data as Partial<AlarmRecord>) }, props.alarmId);
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
        }
      }
    };

    watch(() => [props.alarmId, props.initialRecord], loadDetail, { immediate: true });

    const refreshKey = computed(() =>
      [
        record.value?.alarmStatus ?? "",
        record.value?.alarmHandlerResult ?? "",
        record.value?.followUps.length ?? 0,
        record.value?.suspend?.createTime ?? "",
        record.value?.handler?.createTime ?? "",
      ].join("|"),
    );

    const canFollowUp = computed(() =>
      record.value ? ["ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(record.value.alarmStatus) : false,
    );
    const canConfirm = computed(() => record.value?.alarmStatus === "ALARM_UN_CONFIRMED");
    const canTransfer = computed(() =>
      record.value ? ["ALARM_UN_CONFIRMED", "ALARM_PROGRESS_CONFIRMED"].includes(record.value.alarmStatus) : false,
    );
    const canSuspend = computed(() => record.value?.alarmStatus === "ALARM_PROGRESS_CONFIRMED");
    const canHandle = computed(() =>
      record.value ? ["ALARM_UN_CONFIRMED", "ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(record.value.alarmStatus) : false,
    );

    const openAction = (type: AlarmActionType): void => {
      if (!record.value) {
        return;
      }
      actionModal.value = {
        visible: true,
        action: type,
        record: record.value,
      };
    };

    const closeAction = (visible: boolean): void => {
      actionModal.value = { ...actionModal.value, visible };
    };

    const handleActionSuccess = (): void => {
      void loadDetail();
    };

    const confirm = (): void => {
      if (!record.value) {
        return;
      }
      AntModal.confirm({
        centered: true,
        title: "接收确认",
        content: `确认接收 ${record.value.alarmEventName || "当前报警"}？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          const currentRecord = record.value;
          if (!currentRecord) {
            return;
          }
          await useAuthRequest(() => confirmAlarmRecord(currentRecord.id));
          message.success("接收成功");
          await loadDetail();
        },
      });
    };

    const actionBar = (): JSX.Element | null => {
      if (!props.showActions || !record.value) {
        return null;
      }
      return (
        <Space class="alarm-record-detail__actions">
          {canFollowUp.value && <Button onClick={() => openAction("followUp")}>跟进记录</Button>}
          <Button onClick={() => openAction("pushAgain")}>再次推送</Button>
          {canSuspend.value && <Button onClick={() => openAction("suspend")}>挂起</Button>}
          {canTransfer.value && <Button onClick={() => openAction("transfer")}>指派</Button>}
          {canConfirm.value && <Button onClick={confirm}>接收</Button>}
          {canHandle.value && (
            <Button type="primary" onClick={() => openAction("handle")}>
              处理
            </Button>
          )}
        </Space>
      );
    };

    return () => (
      <div class="alarm-record-detail">
        <Spin spinning={loading.value}>
          {record.value ? (
            <>
              {props.showActions && props.actionPlacement === "top" && <div class="alarm-record-detail__action-row">{actionBar()}</div>}
              <section class="alarm-record-detail__section">
                <Tabs v-model:activeKey={activeTab.value} destroyInactiveTabPane={false}>
                  <TabPane key="baseInfo" tab="报警详情">
                    <AlarmDetailTab
                      alarmId={props.alarmId}
                      refreshKey={refreshKey.value}
                      initialRecord={record.value}
                      detailExtra={props.detailExtra}
                    />
                  </TabPane>
                  <TabPane key="linkageAction" tab="联动动作" forceRender>
                    <LinkageActionTab eventId={record.value.businessKey} refreshKey={refreshKey.value} />
                  </TabPane>
                  <TabPane key="handelRecord" tab="处理记录" forceRender>
                    <ProcessRecordTab alarmRecordId={record.value.id} refreshKey={refreshKey.value} />
                  </TabPane>
                  <TabPane key="nearbyEquipment" tab="附近设备" forceRender>
                    <NearbyEquipmentTab alarmRecordId={record.value.id} refreshKey={refreshKey.value} />
                  </TabPane>
                </Tabs>
              </section>
            </>
          ) : (
            <Empty description="暂无报警详情" />
          )}
        </Spin>
        {props.showActions && props.actionPlacement === "bottom" && (
          <div class="alarm-record-detail__action-row alarm-record-detail__action-row--bottom">{actionBar()}</div>
        )}
        <AlarmActionModal
          visible={actionModal.value.visible}
          action={actionModal.value.action}
          record={actionModal.value.record}
          onUpdate:visible={closeAction}
          onSuccess={handleActionSuccess}
        />
      </div>
    );
  },
});
