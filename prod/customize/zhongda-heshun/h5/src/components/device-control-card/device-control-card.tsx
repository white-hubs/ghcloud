import styles from "./device-control-card.module.less";
import { cubeZhongdaHeshunService } from "@/api/server";
import { getAssetsFile } from "@/utils";
import type { Command } from "@ghcloud/cube-zhongda-heshun-service";
import { Popup, Field, Button, Switch as VanSwitch, showToast, showLoadingToast, closeToast } from "vant";
import { defineComponent, onMounted, ref, type PropType } from "vue";

const COMMAND = {
  DEVICE_OFF: "DEVICE_OFF" as Command,
  DRIVE_MOSQUITO: "DRIVE_MOSQUITO" as Command,
  MIST_SPRAY: "MIST_SPRAY" as Command,
};

export const DeviceControlCard = defineComponent({
  name: "DeviceControlCard",
  props: {
    deviceId: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const selectedMode = ref<Command | null>(null);
    const showCustomDurationPopup = ref(false);
    const defaultDurationByMode = ref<Partial<Record<Command, number>>>({});
    const customDurationByMode = ref<Partial<Record<Command, number>>>({});
    const customDurationMinutes = ref("");
    const SECONDS_PER_MINUTE = 60;
    const durationOptions = [
      { label: "常开", value: 0 },
      { label: "5分钟", value: 5 },
      { label: "10分钟", value: 10 },
      { label: "15分钟", value: 15 },
      { label: "30分钟", value: 30 },
      { label: "60分钟", value: 60 },
    ];

    const toMinutes = (rawDuration: unknown): number | null => {
      const parsedDuration = Number(rawDuration);
      if (!Number.isFinite(parsedDuration) || parsedDuration < 0) {
        return null;
      }
      if (parsedDuration === 0) {
        return 0;
      }
      // 兼容接口可能返回秒或分钟：大于 60 时按秒转分钟，否则按分钟处理。
      const durationMinutes =
        parsedDuration > SECONDS_PER_MINUTE ? parsedDuration / SECONDS_PER_MINUTE : parsedDuration;
      return Math.max(1, Math.round(durationMinutes));
    };

    const parseDurationByMode = (response: any): Partial<Record<Command, number>> => {
      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : Array.isArray(response?.data?.list)
            ? response.data.list
            : [];

      const durations: Partial<Record<Command, number>> = {};
      for (const item of list) {
        const command = item?.command as Command | undefined;
        if (!command) continue;
        const durationMinutes = toMinutes(item?.duration);
        if (durationMinutes === null) continue;
        durations[command] = durationMinutes;
      }

      return durations;
    };

    const getCurrentDefaultDuration = (): number | null => {
      const displayMode = selectedMode.value ?? COMMAND.DRIVE_MOSQUITO;
      return defaultDurationByMode.value[displayMode] ?? null;
    };

    const getCurrentCustomDuration = (): number | null => {
      const displayMode = selectedMode.value ?? COMMAND.DRIVE_MOSQUITO;
      return customDurationByMode.value[displayMode] ?? null;
    };

    const getDisplayDuration = (): number | null => {
      const currentCustomDuration = getCurrentCustomDuration();
      if (currentCustomDuration !== null) {
        return currentCustomDuration;
      }
      return getCurrentDefaultDuration();
    };

    const getDurationByMode = (mode: Command): number | null => {
      const customDuration = customDurationByMode.value[mode] ?? null;
      if (customDuration !== null) {
        return customDuration;
      }
      return defaultDurationByMode.value[mode] ?? null;
    };

    const loadLatestDuration = async () => {
      try {
        const result = await cubeZhongdaHeshunService.getDeviceManualControlDuration({
          deviceId: props.deviceId,
        });
        defaultDurationByMode.value = parseDurationByMode(result);
      } catch {
        // 回显失败不影响控制流程
      }
    };

    const sendControl = async (command: Command, durationInSeconds = 0) => {
      if (props.readonly) {
        return;
      }
      showLoadingToast({
        forbidClick: true,
      });

      try {
        await cubeZhongdaHeshunService.deviceManualControl({
          deviceId: props.deviceId,
          deviceName: props.deviceName,
          command: command,
          duration: durationInSeconds,
        });
        showToast("指令已下发");
      } catch {
      } finally {
        closeToast();
      }
    };

    const onModeChange = async (checked: boolean, command: Command) => {
      if (props.readonly) {
        return;
      }
      if (!checked) {
        onStopWork();
        return;
      }

      selectedMode.value = command;
      const durationMinutes = getDurationByMode(command);
      const durationInSeconds = durationMinutes === null ? 0 : durationMinutes * SECONDS_PER_MINUTE;
      await sendControl(command, durationInSeconds);
    };

    const onCustomDurationOpen = () => {
      if (props.readonly) {
        return;
      }
      const displayDuration = getDisplayDuration();
      customDurationMinutes.value = displayDuration === null ? "" : String(displayDuration);
      showCustomDurationPopup.value = true;
    };

    const onCustomDurationConfirm = async () => {
      if (props.readonly) {
        return;
      }
      const raw = String(customDurationMinutes.value).trim();
      const parsedMinutes = raw === "" ? 0 : Number(raw);
      if (!Number.isFinite(parsedMinutes) || parsedMinutes < 0 || !Number.isInteger(parsedMinutes)) {
        showToast("请输入非负整数，留空为常开（0）");
        return;
      }
      const targetMode = selectedMode.value ?? COMMAND.DRIVE_MOSQUITO;
      customDurationByMode.value = {
        ...customDurationByMode.value,
        [targetMode]: parsedMinutes,
      };
      showCustomDurationPopup.value = false;

      if (!selectedMode.value) {
        showToast("已保存时长，开启模式后生效");
        return;
      }

      await sendControl(selectedMode.value, parsedMinutes * SECONDS_PER_MINUTE);
    };

    const onCustomDurationCancel = () => {
      showCustomDurationPopup.value = false;
    };

    const onDurationOptionSelect = (durationMinutes: number) => {
      if (props.readonly) {
        return;
      }
      customDurationMinutes.value = String(durationMinutes);
    };

    const onStopWork = async () => {
      if (props.readonly) {
        return;
      }
      selectedMode.value = null;
      customDurationMinutes.value = "";

      await sendControl(COMMAND.DEVICE_OFF);
    };

    onMounted(() => {
      void loadLatestDuration();
    });

    return () => (
      <div class={styles["device-control-card"]}>
        <div class={styles["title-row"]}>
          <div class={styles["card-title"]}>工作模式</div>
          <div class={[styles["stop-btn"], props.readonly ? styles.disabled : ""]} onClick={onStopWork}>
            终止任务
          </div>
        </div>
        <div class={styles["mode-row"]}>
          <div class={`${styles["mode-card"]} ${selectedMode.value === COMMAND.DRIVE_MOSQUITO ? styles.active : ""}`}>
            <div class={styles["mode-top"]}>
              <div class={styles["mode-icon"]}>
                <img src={getAssetsFile("mosquitoes.png")} alt="" />
              </div>
              <VanSwitch
                modelValue={selectedMode.value === COMMAND.DRIVE_MOSQUITO}
                onUpdate:modelValue={(value: boolean) => onModeChange(value, COMMAND.DRIVE_MOSQUITO)}
                active-color="#1578FF"
                inactive-color="#dcdde0"
                disabled={props.readonly}
              />
            </div>
            <div class={styles["mode-name"]}>驱蚊模式</div>
            <div class={styles["mode-status"]}>{selectedMode.value === COMMAND.DRIVE_MOSQUITO ? "ON" : "OFF"}</div>
          </div>

          <div class={`${styles["mode-card"]} ${selectedMode.value === COMMAND.MIST_SPRAY ? styles.active : ""}`}>
            <div class={styles["mode-top"]}>
              <div class={styles["mode-icon"]}>
                <img src={getAssetsFile("irrigation.png")} alt="" />
              </div>
              <VanSwitch
                modelValue={selectedMode.value === COMMAND.MIST_SPRAY}
                onUpdate:modelValue={(value: boolean) => onModeChange(value, COMMAND.MIST_SPRAY)}
                active-color="#1578FF"
                inactive-color="#dcdde0"
                disabled={props.readonly}
              />
            </div>
            <div class={styles["mode-name"]}>雾灌模式</div>
            <div class={styles["mode-status"]}>{selectedMode.value === COMMAND.MIST_SPRAY ? "ON" : "OFF"}</div>
          </div>
        </div>
        <div>
          <div class={styles["duration-header"]}>
            <span class={styles["duration-title"]}>定时设置</span>
            <span class={styles["duration-hint"]}>时间为 0 时为常开模式</span>
          </div>
          <div class={styles["duration-row"]}>
            <button
              type="button"
              class={[styles["duration-action"], props.readonly ? styles.disabled : ""]}
              disabled={props.readonly}
              onClick={() => {
                if (props.readonly) {
                  return;
                }
                const displayMode = selectedMode.value ?? COMMAND.DRIVE_MOSQUITO;
                const { [displayMode]: _removed, ...rest } = customDurationByMode.value;
                customDurationByMode.value = rest;
                customDurationMinutes.value = "";
              }}
            >
              -
            </button>
            <div class={styles["duration-value"]} onClick={onCustomDurationOpen}>
              {getDisplayDuration() === null
                ? "自定义时间"
                : getDisplayDuration() === 0
                  ? "常开模式"
                  : `${getDisplayDuration()}分钟`}
            </div>
            <button
              type="button"
              class={[styles["duration-action"], props.readonly ? styles.disabled : ""]}
              disabled={props.readonly}
              onClick={onCustomDurationOpen}
            >
              +
            </button>
          </div>
        </div>
        <Popup v-model:show={showCustomDurationPopup.value} position="bottom" round>
          <div class={styles["custom-popup"]}>
            <div class={styles["option-title"]}>选择时长</div>
            <div class={styles["duration-options"]}>
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  class={[
                    styles["duration-option"],
                    Number(customDurationMinutes.value || 0) === option.value ? styles.active : "",
                  ]}
                  onClick={() => onDurationOptionSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Field
              v-model={customDurationMinutes.value}
              type="digit"
              label="自定义时长"
              placeholder="分钟数；留空或 0 为常开"
              input-align="right"
              maxlength={6}
            />
            <div class={styles["custom-actions"]}>
              <Button block onClick={onCustomDurationCancel}>
                取消
              </Button>
              <Button block type="primary" onClick={onCustomDurationConfirm}>
                确定
              </Button>
            </div>
          </div>
        </Popup>
      </div>
    );
  },
});
