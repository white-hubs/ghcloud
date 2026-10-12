import type { PendingGrant } from "@cube-ai/agent-sdk-client-vue";
import { Icon, Popup } from "vant";
import { defineComponent, onUnmounted, ref, watch, type PropType, type VNode } from "vue";

import { hasArgsPreview, isGrantExpired, mapScopeHintToChoice, remainingSeconds, type GrantScopeChoice } from "../assistant-consent";

import styles from "../chat.module.less";

const DEFAULT_GRANT_EXPIRES_MS = 60_000;

const scopeOptions: { value: GrantScopeChoice; label: string; desc: string }[] = [
  { value: "ONCE", label: "仅本次", desc: "只允许本次工具调用" },
  { value: "SESSION", label: "本次会话", desc: "本会话内自动允许" },
  { value: "PERSISTENT", label: "永久记住", desc: "后续同类调用自动通过" },
];

export const GrantConsentPopup = defineComponent({
  name: "GrantConsentPopup",
  props: {
    grant: {
      type: Object as PropType<PendingGrant | null>,
      default: null,
    },
    onApprove: {
      type: Function as PropType<(scopeChoice: GrantScopeChoice) => void>,
      required: true,
    },
    onDeny: {
      type: Function as PropType<(reason?: string) => void>,
      required: true,
    },
  },
  setup: (props): (() => VNode | null) => {
    const scopeChoice = ref<GrantScopeChoice>("SESSION");
    const countdown = ref(60);
    let timer: ReturnType<typeof setInterval> | null = null;

    const stopTimer = (): void => {
      if (timer == null) {
        return;
      }
      clearInterval(timer);
      timer = null;
    };

    const deny = (reason: string): void => {
      stopTimer();
      props.onDeny(reason);
    };

    watch(
      () => props.grant,
      (grant) => {
        stopTimer();
        if (grant == null) {
          return;
        }
        scopeChoice.value = mapScopeHintToChoice(grant.scopeHint);
        const expiresAt = grant.expiresTime ?? Date.now() + DEFAULT_GRANT_EXPIRES_MS;
        countdown.value = remainingSeconds(expiresAt, Date.now());
        timer = setInterval(() => {
          countdown.value = remainingSeconds(expiresAt, Date.now());
          if (isGrantExpired(expiresAt, Date.now())) {
            deny("expired");
          }
        }, 1000);
      },
      { immediate: true },
    );

    onUnmounted(stopTimer);

    const renderScopeOption = (item: (typeof scopeOptions)[number]): VNode => (
      <button
        key={item.value}
        class={[styles.grantScopeOption, scopeChoice.value === item.value ? styles.grantScopeOptionActive : ""]}
        type="button"
        onClick={() => {
          scopeChoice.value = item.value;
        }}
      >
        <span class={styles.grantScopeLabel}>{item.label}</span>
        <span class={styles.grantScopeDesc}>{item.desc}</span>
      </button>
    );

    return (): VNode | null => {
      const grant = props.grant;
      if (grant == null) {
        return null;
      }
      const previewContent = hasArgsPreview(grant.argsPreview) ? JSON.stringify(grant.argsPreview, null, 2) : "";
      return (
        <Popup show={true} position="bottom" class={styles.grantPopup} overlayClass={styles.grantOverlay} closeOnClickOverlay={false}>
          <div class={styles.grantPanel}>
            <div class={styles.grantHeader}>
              <div class={styles.grantTitleWrap}>
                <div class={styles.grantTitle}>工具授权请求</div>
                <div class={styles.grantToolName}>{grant.toolName ?? grant.grantRequestId}</div>
              </div>
              <div class={[styles.grantCountdown, countdown.value <= 10 ? styles.grantCountdownDanger : ""]}>{countdown.value}s</div>
              <button
                class={styles.grantCloseBtn}
                type="button"
                aria-label="关闭授权请求"
                onClick={() => {
                  deny("user_dismissed");
                }}
              >
                <Icon name="cross" size="18" />
              </button>
            </div>

            {grant.reason ? <div class={styles.grantReason}>{grant.reason}</div> : null}

            {previewContent ? (
              <div class={styles.grantPreview}>
                <div class={styles.grantPreviewTitle}>参数预览</div>
                <pre>{previewContent}</pre>
              </div>
            ) : null}

            <div class={styles.grantScopeBlock}>
              <div class={styles.grantScopeTitle}>授权范围</div>
              <div class={styles.grantScopeList}>{scopeOptions.map(renderScopeOption)}</div>
            </div>

            <div class={styles.grantActions}>
              <button
                class={styles.grantDenyBtn}
                type="button"
                onClick={() => {
                  deny("user_denied");
                }}
              >
                拒绝
              </button>
              <button
                class={styles.grantApproveBtn}
                type="button"
                onClick={() => {
                  stopTimer();
                  props.onApprove(scopeChoice.value);
                }}
              >
                同意
              </button>
            </div>
          </div>
        </Popup>
      );
    };
  },
});
