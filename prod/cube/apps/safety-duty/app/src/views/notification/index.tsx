import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { DutyDispatchOptionVO as DutySignatureReminderOptionVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getDutyDispatchOptions as getSignatureReminderOptions } from "@ghcloud/cube-services-client/safety-personnel.client";
import { Button, CheckboxGroup, Select, SelectOption, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeMessageCenterService } from "@/api/message-center-service";
import { showApiError } from "@/utils";
import {
  configuredNoticeWays,
  DUTY_DISPATCH_SIGN_MESSAGE_SCENE,
  findSceneConfig,
  normalizeNoticeWayOptions,
  type NoticeWayOption,
  SAFETY_DUTY_MESSAGE_BUSINESS_TYPE,
  toNoticeWaysDTO,
} from "@/utils/message-scene";

import styles from "./index.module.less";

export const DutyNotificationConfigPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const loading = ref(false);
    const saving = ref(false);
    const reminderOptions = ref<DutySignatureReminderOptionVO>({});
    const notifyWayOptions = ref<NoticeWayOption[]>([]);
    const dispatchSceneLabel = ref("签收到期提醒");
    const form = reactive({
      industryType: "INDUSTRY_TRADE",
      signDeadlineDays: undefined as number | undefined,
      notifyWays: [] as string[],
    });

    const normalizeDispatchOptions = (): void => {
      const deadlineOptions = reminderOptions.value.deadlineDayOptions ?? [];
      if (!form.signDeadlineDays || !deadlineOptions.includes(form.signDeadlineDays)) {
        form.signDeadlineDays = deadlineOptions[0];
      }
    };

    const loadNotificationConfig = async (): Promise<void> => {
      loading.value = true;
      try {
        const [sceneConfigs, sceneOptions] = await Promise.all([
          cubeMessageCenterService.getMessageConfig({ businessType: SAFETY_DUTY_MESSAGE_BUSINESS_TYPE }),
          cubeMessageCenterService.sceneNotificationMethod(DUTY_DISPATCH_SIGN_MESSAGE_SCENE),
        ]);
        notifyWayOptions.value = normalizeNoticeWayOptions(sceneOptions);
        const sceneConfig = findSceneConfig(sceneConfigs, DUTY_DISPATCH_SIGN_MESSAGE_SCENE);
        dispatchSceneLabel.value = sceneConfig?.label || dispatchSceneLabel.value;
        form.notifyWays = configuredNoticeWays(sceneConfigs, DUTY_DISPATCH_SIGN_MESSAGE_SCENE, notifyWayOptions.value);
        const configuredDeadlineDays = Number(sceneConfig?.value);
        if (Number.isFinite(configuredDeadlineDays) && configuredDeadlineDays > 0) {
          form.signDeadlineDays = configuredDeadlineDays;
        }
        reminderOptions.value = await useAuthRequest(() => getSignatureReminderOptions({ industryType: form.industryType }));
        normalizeDispatchOptions();
      } catch (e) {
        showApiError(e, "查询通知配置失败");
        notifyWayOptions.value = [];
        reminderOptions.value = {};
        form.notifyWays = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadNotificationConfig();
    });

    const saveNotificationConfig = async (): Promise<void> => {
      if (notifyWayOptions.value.length > 0 && form.notifyWays.length === 0) {
        message.warning("请选择通知方式");
        return;
      }
      saving.value = true;
      try {
        await cubeMessageCenterService.addMessageConfig({
          businessType: SAFETY_DUTY_MESSAGE_BUSINESS_TYPE,
          sceneConfigDTOS: [
            {
              label: dispatchSceneLabel.value,
              sceneCode: DUTY_DISPATCH_SIGN_MESSAGE_SCENE,
              value: form.signDeadlineDays ? String(form.signDeadlineDays) : "",
              config: "",
              noticeWays: toNoticeWaysDTO(form.notifyWays),
              noticeObjs: [],
            },
          ],
        });
        message.success("保存成功");
      } catch (e) {
        showApiError(e, "保存通知配置失败");
      } finally {
        saving.value = false;
      }
    };

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <div class={styles.dispatchPanel}>
            <h3 class="sectionTitle">签收到期提醒</h3>
            <div class={styles.dispatchSettings}>
              <div class={styles.settingRow}>
                <span class={styles.settingLabel}>提前提醒天数</span>
                <Select
                  style={{ width: "120px" }}
                  value={form.signDeadlineDays}
                  onUpdate:value={(value?: number) => (form.signDeadlineDays = value)}
                >
                  {(reminderOptions.value.deadlineDayOptions ?? []).map((day) => (
                    <SelectOption key={day} value={day}>
                      {day}天
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div class={styles.settingRow}>
                <span class={styles.settingLabel}>通知方式</span>
                {notifyWayOptions.value.length > 0 ? (
                  <CheckboxGroup v-model:value={form.notifyWays} options={notifyWayOptions.value} />
                ) : (
                  <span class={styles.muted}>当前场景未配置可用通知方式</span>
                )}
              </div>
            </div>
            <div class={styles.actions}>
              <Button type="primary" loading={saving.value} onClick={() => void saveNotificationConfig()}>
                保存
              </Button>
            </div>
          </div>
        </div>
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} showFooter={false} v-slots={layoutSlots} />;
  },
});
