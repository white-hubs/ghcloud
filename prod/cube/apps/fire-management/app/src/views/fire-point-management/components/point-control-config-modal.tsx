import { computed, defineComponent, reactive, shallowRef, type PropType } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import type {
  FirePointControlConfigParam,
  FirePointControlPropertyRecord,
  FirePointRecord,
  FireHostIndicatorButtonRecord,
} from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listFirePointControlPropertyOptions, saveFirePointControlConfig } from "@ghcloud/cube-services-client/fire-management.client";
import { Form, FormItem, Select, Spin, message } from "@ghcloud/cube-ui";

import styles from "../fire-config-management.module.less";

interface CommandSelection {
  propertyCode: string;
  value: string;
}

interface SelectOption {
  label: string;
  value: string;
}

const DEFAULT_INDICATOR_BUTTONS: FireHostIndicatorButtonRecord[] = [
  { code: "", name: "启动" },
  { code: "", name: "停止" },
  { code: "", name: "运行" },
];

const stringifyValue = (value: unknown): string => String(value ?? "");
const optionLabel = (label: string | undefined, value: unknown): string => label?.trim() || stringifyValue(value);
const encodeSelection = (value: CommandSelection): string => JSON.stringify(value);

const parseSelection = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const buildSharedOptions = (properties: FirePointControlPropertyRecord[]): SelectOption[] =>
  properties.flatMap((property) =>
    (property.options || []).map((option) => ({
      label: optionLabel(option.label, option.value),
      value: encodeSelection({ propertyCode: property.propertyCode, value: stringifyValue(option.value) }),
    })),
  );

const findStoppedValue = (properties: FirePointControlPropertyRecord[], selection: CommandSelection): string | null => {
  const property = properties.find((item) => item.propertyCode === selection.propertyCode);
  const stoppedOption = property?.options?.find((option) => stringifyValue(option.value) !== selection.value);
  return stoppedOption ? stringifyValue(stoppedOption.value) : null;
};

export const PointControlConfigModal = defineComponent({
  name: "PointControlConfigModal",
  props: {
    hostId: { type: String, required: true },
    indicatorButtons: { type: Array as PropType<FireHostIndicatorButtonRecord[]>, default: () => DEFAULT_INDICATOR_BUTTONS },
  },
  emits: ["saved"],
  setup: (props, { emit, expose }) => {
    const currentPoint = shallowRef<FirePointRecord | null>(null);
    const properties = shallowRef<FirePointControlPropertyRecord[]>([]);
    const loading = shallowRef(false);
    const controlForm = reactive({ startSelection: "", stopSelection: "", statusSelection: "" });
    let requestVersion = 0;

    const sharedOptions = computed(() => buildSharedOptions(properties.value));
    const activeIndicatorButtons = computed(() => props.indicatorButtons.slice(0, 3));
    const hasFeedbackIndicator = computed(() => activeIndicatorButtons.value.length === 3);

    const resetState = (): void => {
      requestVersion += 1;
      currentPoint.value = null;
      properties.value = [];
      controlForm.startSelection = "";
      controlForm.stopSelection = "";
      controlForm.statusSelection = "";
      loading.value = false;
    };

    const [ControlConfigModal, modalApi] = useCubeModal({
      title: "控制参数",
      width: "520px",
      centered: true,
      closeOnClickModal: false,
      onConfirm: async () => {
        const point = currentPoint.value;
        const start = parseSelection<CommandSelection>(controlForm.startSelection);
        const stop = parseSelection<CommandSelection>(controlForm.stopSelection);
        const status = parseSelection<CommandSelection>(controlForm.statusSelection);
        if (!point || !start || !stop || (hasFeedbackIndicator.value && !status)) {
          message.warning("请选择全部控制参数");
          return;
        }
        const stoppedValue = status ? findStoppedValue(properties.value, status) : null;
        if (status && stoppedValue === null) {
          message.warning("所选运行状态属性缺少停止状态值");
          return;
        }
        const payload: FirePointControlConfigParam = {
          startPropCode: start.propertyCode,
          startPropValue: start.value,
          stopPropCode: stop.propertyCode,
          stopPropValue: stop.value,
          ...(status && stoppedValue !== null ? { runningPropCode: status.propertyCode, runningValue: status.value, stoppedValue } : {}),
        };
        modalApi.setConfirmLoading(true);
        try {
          await useAuthRequest(() => saveFirePointControlConfig(props.hostId, point.id, payload));
          message.success("控制参数已保存");
          emit("saved", point.id);
          modalApi.close();
        } catch (error) {
          message.error((error as Error).message || "保存控制参数失败");
        } finally {
          modalApi.setConfirmLoading(false);
        }
      },
      onClosed: resetState,
    });

    const openModal = async (point: FirePointRecord): Promise<void> => {
      resetState();
      const currentRequestVersion = requestVersion;
      currentPoint.value = point;
      loading.value = true;
      modalApi.setState({ title: `控制参数 — ${point.pointName || point.name || point.code || "消防点位"}` });
      modalApi.open();
      try {
        const records = await useAuthRequest(() => listFirePointControlPropertyOptions(props.hostId, point.id));
        if (currentRequestVersion !== requestVersion) return;
        properties.value = Array.isArray(records) ? records : [];
        if (properties.value.length === 0) message.warning("当前点位没有可配置的枚举属性");
      } catch (error) {
        if (currentRequestVersion === requestVersion) message.error((error as Error).message || "加载控制属性失败");
      } finally {
        if (currentRequestVersion === requestVersion) loading.value = false;
      }
    };

    expose({ openModal });

    const renderSelect = (value: string, options: SelectOption[], placeholder: string, onChange: (nextValue: string) => void) => (
      <Select
        value={value || undefined}
        options={options}
        placeholder={placeholder}
        showSearch
        optionFilterProp="label"
        style={{ width: "100%" }}
        onUpdate:value={(nextValue: unknown) => onChange(String(nextValue ?? ""))}
      />
    );

    const indicatorLabel = (index: number, fallback: string): string => activeIndicatorButtons.value[index]?.name?.trim() || fallback;

    return () => (
      <ControlConfigModal
        v-slots={{
          default: () => (
            <Spin spinning={loading.value}>
              <Form class={styles["control-config-form"]} model={controlForm} layout="vertical" style={{ width: "100%" }}>
                <FormItem name="startSelection" label={indicatorLabel(0, "启动")} required>
                  {renderSelect(controlForm.startSelection, sharedOptions.value, "请选择控制参数", (value) => {
                    controlForm.startSelection = value;
                  })}
                </FormItem>
                <FormItem name="stopSelection" label={indicatorLabel(1, "停止")} required>
                  {renderSelect(controlForm.stopSelection, sharedOptions.value, "请选择控制参数", (value) => {
                    controlForm.stopSelection = value;
                  })}
                </FormItem>
                {hasFeedbackIndicator.value && (
                  <FormItem name="statusSelection" label={indicatorLabel(2, "运行")} required>
                    {renderSelect(controlForm.statusSelection, sharedOptions.value, "请选择控制参数", (value) => {
                      controlForm.statusSelection = value;
                    })}
                  </FormItem>
                )}
              </Form>
            </Spin>
          ),
        }}
      />
    );
  },
});
