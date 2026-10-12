import type { PendingGrant } from "@cube-ai/agent-sdk-client-assistant";
import RadioGroup from "ant-design-vue/es/radio/Group";
import Radio from "ant-design-vue/es/radio/Radio";
import { defineComponent, onUnmounted, ref, watch } from "vue";

import { AntModal, Button } from "@ghcloud/cube-ui";

/**
 * AI 授权确认弹框（Agentic Engine Consent Modal）。
 *
 * 当 SSE 流推送 `grant-request-v1` 事件后，父组件将 pendingGrant 传入；
 * 用户在 60 秒截止前选择授权范围并确认/拒绝，或直接关闭弹框（视为拒绝）。
 *
 * 关键设计：
 *   - scopeHint 预选但可改；三个选项 ONCE / SESSION / PERSISTENT。
 *   - 倒计时到 0 自动调用 onDeny('expired')。
 *   - argsPreview 为空对象时不展示（引擎当前版本占位符）。
 */
import { hasArgsPreview, isGrantExpired, mapScopeHintToChoice, remainingSeconds } from "./assistant-consent";

export const AssistantConsentModal = defineComponent({
  name: "AssistantConsentModal",
  props: {
    grant: {
      type: Object as () => PendingGrant | null,
      default: null,
    },
    onApprove: {
      type: Function as unknown as () => (scopeChoice: "ONCE" | "SESSION" | "PERSISTENT") => void,
      required: true,
    },
    onDeny: {
      type: Function as unknown as () => (reason?: string) => void,
      required: true,
    },
  },
  setup(props) {
    const scopeChoice = ref<"ONCE" | "SESSION" | "PERSISTENT">("SESSION");
    const countdown = ref(60);
    let timer: ReturnType<typeof setInterval> | null = null;

    function stopTimer(): void {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }

    watch(
      () => props.grant,
      (grant) => {
        stopTimer();
        if (!grant) {
          return;
        }

        scopeChoice.value = mapScopeHintToChoice(grant.scopeHint as "ONCE" | "PERSISTENT" | undefined);

        const expiresAt = grant.expiresTime ?? Date.now() + 60_000;
        countdown.value = remainingSeconds(expiresAt, Date.now());

        timer = setInterval(() => {
          const secs = remainingSeconds(expiresAt, Date.now());
          countdown.value = secs;
          if (isGrantExpired(expiresAt, Date.now())) {
            stopTimer();
            props.onDeny("expired");
          }
        }, 1000);
      },
      { immediate: true },
    );

    onUnmounted(stopTimer);

    const scopeOptions: { value: "ONCE" | "SESSION" | "PERSISTENT"; label: string; desc: string }[] = [
      { value: "ONCE", label: "仅本次", desc: "仅允许本次工具调用" },
      { value: "SESSION", label: "本次会话", desc: "本会话内始终允许" },
      { value: "PERSISTENT", label: "永久记住", desc: "写入授权记录，后续自动通过" },
    ];

    function handleApprove(): void {
      stopTimer();
      props.onApprove(scopeChoice.value);
    }

    function handleDeny(): void {
      stopTimer();
      props.onDeny("user_denied");
    }

    function handleClose(): void {
      stopTimer();
      props.onDeny("user_dismissed");
    }

    return () => {
      const { grant } = props;
      if (!grant) {
        return null;
      }

      const previewContent = hasArgsPreview(grant.argsPreview) ? JSON.stringify(grant.argsPreview, null, 2) : null;

      return (
        <AntModal
          open={true}
          title="工具授权请求"
          width={440}
          centered={true}
          maskClosable={false}
          closable={true}
          footer={null}
          getContainer={() => document.body}
          onCancel={handleClose}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* 工具名与截止倒计时 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>{grant.toolName ?? grant.grantRequestId}</span>
              <span
                style={{
                  fontSize: "12px",
                  color: countdown.value <= 10 ? "#ef4444" : "#6b7280",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {countdown.value}s
              </span>
            </div>

            {/* 说明文案 */}
            {grant.reason && <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>{grant.reason}</div>}

            {/* 参数预览（非空时展示） */}
            {previewContent && (
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>参数预览</div>
                <pre
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "6px",
                    padding: "8px",
                    fontSize: "11px",
                    overflowX: "auto",
                    maxHeight: "120px",
                    margin: 0,
                  }}
                >
                  {previewContent}
                </pre>
              </div>
            )}

            {/* 授权范围选择 */}
            <div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>授权范围</div>
              <RadioGroup
                value={scopeChoice.value}
                onChange={(e: { target: { value: "ONCE" | "SESSION" | "PERSISTENT" } }) => {
                  scopeChoice.value = e.target.value;
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {scopeOptions.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      <span style={{ fontWeight: 500 }}>{opt.label}</span>
                      <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "6px" }}>{opt.desc}</span>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "4px" }}>
              <Button onClick={handleDeny}>拒绝</Button>
              <Button type="primary" onClick={handleApprove}>
                同意
              </Button>
            </div>
          </div>
        </AntModal>
      );
    };
  },
});
