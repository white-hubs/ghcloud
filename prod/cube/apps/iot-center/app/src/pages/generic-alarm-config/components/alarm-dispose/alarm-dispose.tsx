import type { EmergencyActionBefore } from "../basic-info/basic-info.model";
import { EmergencyActionBeforeType } from "../basic-info/basic-info.model";
import { InfoCircleOutlined } from "@ant-design/icons";
import "../components.less";
import { Form, InputNumber, Switch, Tooltip } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { BooleanTag, ReadonlyDescriptions } from "../common/read-only/read-only";

const JUDGMENT_TIMEOUT_DEFAULT = 30;

interface AlarmDisposeLabelProps {
  label: string;
  tooltip: string;
}

const LabelWithTooltip: React.FC<AlarmDisposeLabelProps> = ({ label, tooltip }) => (
  <span>
    {label}
    <Tooltip title={tooltip}>
      <InfoCircleOutlined style={{ marginLeft: 4, color: "#999" }} />
    </Tooltip>
  </span>
);

export const AlarmDisposeConfig = forwardRef<AlarmDisposeConfigRef, { info?: EmergencyActionBefore; readonly?: boolean }>(({ info, readonly }, ref) => {
  const urlParams = new URLSearchParams(location.search);
  const isDetailMode = readonly ?? urlParams.get("type") === "detail";

  const buildState = useMemo(
    () =>
      (value?: EmergencyActionBefore): EmergencyActionBefore => ({
        actionBeforeType: EmergencyActionBeforeType.ALARM_JUDGMENT,
        enabled: value?.enabled ?? false,
        actionBeforeConfig: {
          systemProcess: value?.actionBeforeConfig?.systemProcess ?? false,
          judgmentTimeoutSeconds: value?.actionBeforeConfig?.judgmentTimeoutSeconds ?? JUDGMENT_TIMEOUT_DEFAULT,
        },
      }),
    [],
  );

  const [state, setState] = useState<EmergencyActionBefore>(() => buildState(info));

  useEffect(() => {
    setState(buildState(info));
  }, [buildState, info]);

  const updateConfig = <K extends keyof EmergencyActionBefore["actionBeforeConfig"]>(
    key: K,
    value: EmergencyActionBefore["actionBeforeConfig"][K],
  ): void => {
    setState((prev) => ({
      ...prev,
      actionBeforeConfig: {
        ...prev.actionBeforeConfig,
        [key]: value,
      },
    }));
  };

  const changeEnabled = (enabled: boolean): void => {
    setState((prev) => ({
      ...prev,
      enabled,
    }));
  };

  const getValue = (): EmergencyActionBefore => state;

  useImperativeHandle(ref, () => ({
    getValue,
    changeEnabled,
  }));

  if (isDetailMode) {
    return (
      <ReadonlyDescriptions
        items={[
          { label: "报警处置", value: <BooleanTag value={state.enabled} trueText="开启" falseText="关闭" /> },
          { label: "研判时限", value: `${state.actionBeforeConfig.judgmentTimeoutSeconds} 秒` },
        ]}
      />
    );
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <Form layout="vertical">
        {/* <Form.Item
          label={<LabelWithTooltip
            label='疑似报警自动处置'
            tooltip='开启后，当报警研判结果为疑似报警时，系统将自动将该报警标记为“已处理”状态，无需人工再确认。'
          />}
        >
          <Switch
            checkedChildren='是'
            unCheckedChildren='否'
            disabled={isDetailMode}
            checked={state.actionBeforeConfig.systemProcess}
            onChange={(checked) => {
              updateConfig('systemProcess', checked)
            }}
          />
        </Form.Item> */}
        <Form.Item label={<LabelWithTooltip label="研判时限（秒）" tooltip="事件报警后，经过AI二次研判时限超过**秒上报至报警记录。" />}>
          <InputNumber
            style={{ width: "100%" }}
            min={5}
            addonAfter="秒"
            disabled={isDetailMode}
            value={state.actionBeforeConfig.judgmentTimeoutSeconds}
            onChange={(value) => {
              const next = Number(value ?? JUDGMENT_TIMEOUT_DEFAULT);
              updateConfig("judgmentTimeoutSeconds", next > 0 ? next : JUDGMENT_TIMEOUT_DEFAULT);
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
});

export interface AlarmDisposeConfigRef {
  getValue: () => EmergencyActionBefore;
  changeEnabled: (enabled: boolean) => void;
}
