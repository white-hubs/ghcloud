import type { MessageTargetModifyParams, NotifyConfigDetail } from "./components/model/notify-config-type";
import { NoticeConfigMessage } from "./components/notice-config-channel";
import { DeviceNotifyRuleConfig } from "./components/notice-config-condition";
import { NoticeConfigDetailInfo } from "./components/notice-config-detail-info";
import { cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { logger } from "@/logger";
import { Button, message } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

/** 设备通知配置页(配置详情) */
export const DeviceNoticeConfigDetail = defineComponent({
  setup: () => {
    const { deviceId } = useRoute().query as { deviceId: string };

    const loading = ref(false);
    const saveLoading = ref(false);
    const noticeConfigDetailInfoRef = ref<{ getData: () => Promise<unknown> }>();
    const noticeConfigRuleRef = ref<{ validateForm: () => Promise<unknown> }>();
    const noticeConfigDetailMessageRef = ref<{ validateForm: () => Promise<unknown> }>();
    const save = async (): Promise<void> => {
      try {
        saveLoading.value = true;
        const detailInfo = (await noticeConfigDetailInfoRef.value?.getData()) as NotifyConfigDetail;
        const messageNotice = (await noticeConfigDetailMessageRef.value?.validateForm()) as {
          messageNotifyConfig?: {
            channelTypes: string[];
            targets: MessageTargetModifyParams[];
          }[];
        };
        const ruleConditions = await noticeConfigRuleRef.value?.validateForm();
        const params = {
          enabled: detailInfo.enabled as boolean,
          deviceId,
          ruleConditions: ruleConditions || [],
          messageNotifies: messageNotice.messageNotifyConfig || [],
        };
        await cubeDeviceSuperviseService.updateDeviceNotifyConfig(params);
        message.success("操作成功");
        saveLoading.value = false;
        history.back();
      } catch {
      } finally {
        saveLoading.value = false;
      }
    };
    const baseInfo = ref<NotifyConfigDetail>();
    const finished = ref(false);
    onMounted(() => {
      cubeDeviceSuperviseService
        .getDeviceNotifyConfigDetail(deviceId)
        .then((res) => {
          loading.value = false;
          baseInfo.value = res as NotifyConfigDetail;
          finished.value = true;
        })
        .catch((err) => {
          logger.error(err);
          loading.value = false;
        });
    });
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          {finished.value && (
            <div style={{ paddingBottom: "60px", overflowX: "hidden" }}>
              <NoticeConfigDetailInfo notifyConigDetail={baseInfo.value || { enabled: false }} ref={noticeConfigDetailInfoRef} />
              <DeviceNotifyRuleConfig ruleConditions={baseInfo.value?.ruleConditions || []} ref={noticeConfigRuleRef} />
              <NoticeConfigMessage messageNotifyConfig={baseInfo.value?.messageNotifies || []} ref={noticeConfigDetailMessageRef} />
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
      </>
    );
  },
});
