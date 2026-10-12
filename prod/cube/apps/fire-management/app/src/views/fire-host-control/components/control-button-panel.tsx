import { defineComponent, type PropType, type VNode } from "vue";

import {
  BellOutlined,
  BulbOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  SettingOutlined,
  StopOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  Button,
} from "@ghcloud/cube-ui";

import type { ControlAction } from "../models";

import styles from "../fire-host-control.module.less";

const renderButtonIcon = (action: ControlAction): VNode => {
  if (/^fas\s+fa-/u.test(action.icon)) return <i class={action.icon} aria-hidden="true" />;
  const descriptor = `${action.icon}${action.label}${action.methodCode}`.toLowerCase();
  if (/停止|stop/u.test(descriptor)) {
    return <StopOutlined />;
  }
  if (/启动|start/u.test(descriptor)) {
    return <PlayCircleOutlined />;
  }
  if (/报警|alarm|广播|broadcast/u.test(descriptor)) {
    return <BellOutlined />;
  }
  if (/风机|fan/u.test(descriptor)) {
    return <RocketOutlined />;
  }
  if (/水泵|pump/u.test(descriptor)) {
    return <ThunderboltOutlined />;
  }
  if (/照明|light/u.test(descriptor)) {
    return <BulbOutlined />;
  }
  if (/复位|reset|自检|test/u.test(descriptor)) {
    return <ToolOutlined />;
  }
  return <SettingOutlined />;
};

const buttonClass = (action: ControlAction): string[] => {
  if (action.style === "red") {
    return [styles.controlButton, styles.controlRed];
  }
  if (action.style === "blue") {
    return [styles.controlButton, styles.controlBlue];
  }
  return [styles.controlButton, styles.controlGray];
};

export const ControlButtonPanel = defineComponent({
  name: "ControlButtonPanel",
  props: {
    actions: { type: Array as PropType<ControlAction[]>, required: true },
    loading: { type: Boolean, required: true },
    pending: { type: Boolean, required: true },
  },
  emits: { control: (_action: ControlAction) => true },
  setup(props, { emit }) {
    return () => (
      <div class={styles.controlButtons}>
        {props.actions.map((button) => (
          <Button
            key={button.buttonId}
            class={buttonClass(button)}
            disabled={props.pending || !button.enabled}
            onClick={(event: MouseEvent) => {
              (event.currentTarget as HTMLButtonElement).blur();
              emit("control", button);
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>{renderButtonIcon(button)}</span>
            <span style={{ lineHeight: 1.1, textAlign: "center", whiteSpace: "nowrap" }}>{button.label}</span>
          </Button>
        ))}
        {props.loading ? <div class={styles.controlButtonEmpty}>正在加载按钮配置...</div> : undefined}
        {!props.loading && props.actions.length === 0 ? <div class={styles.controlButtonEmpty}>当前主机未配置控制按钮</div> : undefined}
      </div>
    );
  },
});
