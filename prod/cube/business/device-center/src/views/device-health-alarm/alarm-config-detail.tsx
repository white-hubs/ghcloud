import { BatchHandleAlarmModal } from "./components/batch-handle-alarm-modal";
import { NoticeConfigAlarmInfo } from "./components/notice-config-alarm-info";
import { NoticeConfigAlarmMessage } from "./components/notice-config-alarm-message";
import { NoticeConfigAlarmNotice } from "./components/notice-config-alarm-notice";
import { NoticeConfigDeviceLink } from "./components/notice-config-device-link";
import { NoticeConfigMonitorLink } from "./components/notice-config-monitor-link";
import { cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { logger } from "@/logger";
import type { ActionConfig, AlarmRules } from "@/types/alarm-type";
import { Button, message } from "@ghcloud/cube-ui";
import { Switch } from "ant-design-vue/es";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

/** 设备通知配置页(配置详情) */
export const DeviceHealthAlarmConfigDetail = defineComponent({
  setup: () => {
    const { id, deviceId } = useRoute().query as { id: string; deviceId: string };

    const batchHandleAlarmModalRef = ref<{ openModal: () => void }>();
    const loading = ref(false);
    const saveLoading = ref(false);
    const noticeConfigAlarmInfoRef = ref<{ getData: () => Promise<unknown> }>();
    const noticeConfigMonitorLinkRef = ref<{ validateForm: () => Promise<unknown> }>();
    const noticeConfigDeviceLinkRef = ref<{ validateForm: () => Promise<unknown> }>();
    const noticeConfigAlarmNoticeRef = ref<{ validateForm: () => Promise<unknown> }>();
    const noticeConfigAlarmMessageRef = ref<{ validateForm: () => Promise<unknown> }>();
    const videoDeviceEnable = ref(false);
    const iotDeviceEnable = ref(false);
    const alarmNotifyEnable = ref(false);
    const messageNotifyEnable = ref(false);

    const save = async (): Promise<void> => {
      try {
        saveLoading.value = true;
        const alarmInfo = (await noticeConfigAlarmInfoRef.value?.getData()) as { enable: boolean; levelId: number; thresholdValue: number };
        const monitorLink = await noticeConfigMonitorLinkRef.value?.validateForm();
        const deviceLink = await noticeConfigDeviceLinkRef.value?.validateForm();
        const alarmNotice = await noticeConfigAlarmNoticeRef.value?.validateForm();
        const messageNotice = await noticeConfigAlarmMessageRef.value?.validateForm();
        logger.debug(monitorLink, "===monitorLink  ");
        logger.debug(deviceLink, "===deviceLink ");
        logger.debug(alarmNotice, "===alarmNotice");
        logger.debug(messageNotice, "===messageNotice");
        const params = {
          enable: alarmInfo?.enable,
          levelId: alarmInfo?.levelId,
          thresholdValue: alarmInfo?.thresholdValue,
          id,
          alarmTypeId: 0,
          linkageEmergencyActionModifies: [
            {
              actionType: "VIDEO_DEVICE_ACTION",
              enabled: videoDeviceEnable.value,
              actionConfig: (monitorLink as { actionConfig: unknown })?.actionConfig,
            },
            {
              actionType: "IOT_DEVICE_ACTION",
              enabled: iotDeviceEnable.value,
              actionConfig: (deviceLink as { actionConfig: unknown })?.actionConfig,
            },
            {
              actionType: "ALARM_NOTIFY_ACTION",
              enabled: alarmNotifyEnable.value,
              actionConfig: (alarmNotice as { actionConfig: unknown })?.actionConfig,
            },
            {
              actionType: "MESSAGE_NOTIFY_ACTION",
              enabled: messageNotifyEnable.value,
              actionConfig: (messageNotice as { actionConfig: unknown })?.actionConfig,
            },
          ],
        };
        logger.debug(params, "params");
        await cubeDeviceSuperviseService.updateAlarmConfig(deviceId, params);
        message.success("操作成功");
        saveLoading.value = false;
        history.back();
      } catch {
      } finally {
        saveLoading.value = false;
      }
    };
    const baseInfo = ref<AlarmRules>({});
    const finished = ref(false);
    onMounted(() => {
      loading.value = true;
      cubeDeviceSuperviseService
        .getAlarmConfigDetail(deviceId)
        .then((res) => {
          loading.value = false;
          baseInfo.value = res as AlarmRules;
          finished.value = true;
          if (baseInfo.value.ruleBasicDTOS && baseInfo.value.ruleBasicDTOS.length > 0) {
            baseInfo.value.ruleBasicDTOS.forEach((item) => {
              if (item.actionType === "VIDEO_DEVICE_ACTION") {
                videoDeviceEnable.value = item.enabled;
              } else if (item.actionType === "IOT_DEVICE_ACTION") {
                iotDeviceEnable.value = item.enabled;
              } else if (item.actionType === "ALARM_NOTIFY_ACTION") {
                alarmNotifyEnable.value = item.enabled;
              } else if (item.actionType === "MESSAGE_NOTIFY_ACTION") {
                messageNotifyEnable.value = item.enabled;
              }
            });
          }
        })
        .catch((err) => {
          logger.error(err);
          loading.value = false;
        });
    });
    const actionConfig = (key: string): ActionConfig[] => {
      try {
        if (!baseInfo.value.ruleBasicDTOS) {
          return [];
        }
        const params = baseInfo.value.ruleBasicDTOS?.find((item) => item.actionType === key);
        if (Array.isArray(params?.actionConfig)) {
          return params?.actionConfig || [];
        }
        return params?.actionConfig?.data || [];
      } catch {
        return [];
      }
    };
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          {finished.value && (
            <div style={{ paddingBottom: "60px", overflowX: "hidden" }}>
              <NoticeConfigAlarmInfo ref={noticeConfigAlarmInfoRef} />
              <NoticeConfigMonitorLink
                actionConfig={actionConfig("VIDEO_DEVICE_ACTION")}
                ref={noticeConfigMonitorLinkRef}
                v-slots={{
                  switch: () => (
                    <div style="margin:0 20px;">
                      <Switch v-model:checked={videoDeviceEnable.value} checked-children="开" un-checked-children="关" />
                    </div>
                  ),
                }}
              />
              <NoticeConfigDeviceLink
                actionConfig={actionConfig("IOT_DEVICE_ACTION")}
                ref={noticeConfigDeviceLinkRef}
                v-slots={{
                  switch: () => (
                    <div style="margin:0 20px;">
                      <Switch v-model:checked={iotDeviceEnable.value} checked-children="开" un-checked-children="关" />
                    </div>
                  ),
                }}
              />
              <NoticeConfigAlarmNotice
                actionConfig={actionConfig("ALARM_NOTIFY_ACTION")}
                ref={noticeConfigAlarmNoticeRef}
                v-slots={{
                  switch: () => (
                    <div style="margin:0 20px;">
                      <Switch v-model:checked={alarmNotifyEnable.value} checked-children="开" un-checked-children="关" />
                    </div>
                  ),
                }}
              />
              <NoticeConfigAlarmMessage
                actionConfig={actionConfig("MESSAGE_NOTIFY_ACTION")}
                ref={noticeConfigAlarmMessageRef}
                v-slots={{
                  switch: () => (
                    <div style="margin:0 20px;">
                      <Switch v-model:checked={messageNotifyEnable.value} checked-children="开" un-checked-children="关" />
                    </div>
                  ),
                }}
              />
            </div>
          )}
        </>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Button type="primary" loading={saveLoading.value} onClick={save}>
            保存
          </Button>
          <Button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>
        </>
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="设备通知详情" v-slots={layoutSlots} />
        <BatchHandleAlarmModal ref={batchHandleAlarmModalRef} />
      </>
    );
  },
});
