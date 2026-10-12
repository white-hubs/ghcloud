import { Modal } from "ant-design-vue";
import { defineComponent, onBeforeUnmount, onMounted } from "vue";

import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./fullscreen.less";

import styles from "./switch-fullscreen.module.less";

function isFullScreen(): boolean {
  return document.fullscreenElement !== null;
}

/**
 * 进入/退出全屏。
 * AI 异步回执里直接 requestFullscreen 会失败，可弹确认框获取用户手势。
 */
export async function toggleDocumentFullscreen(opts?: { allowPrompt?: boolean }): Promise<boolean> {
  const allowPrompt = opts?.allowPrompt !== false;
  try {
    if (isFullScreen()) {
      await document.exitFullscreen();
      return true;
    }
    await document.documentElement.requestFullscreen();
    return true;
  } catch {
    if (!allowPrompt || isFullScreen()) {
      return false;
    }
    return await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: "是否进入全屏模式",
        centered: true,
        okText: "进入全屏",
        cancelText: "取消",
        class: "fullscreen-modal",
        async onOk() {
          try {
            await document.documentElement.requestFullscreen();
            resolve(true);
          } catch {
            resolve(false);
          }
        },
        onCancel() {
          resolve(false);
        },
      });
    });
  }
}

/** 全屏、退出全屏 */
export const SwitchFullscreen = defineComponent({
  setup(_props, { expose }) {
    const { globalState, runtime } = useStateStore();

    async function handleClick(): Promise<boolean> {
      return toggleDocumentFullscreen({ allowPrompt: false });
    }

    async function handleFullScreenFromCommand(): Promise<boolean> {
      return toggleDocumentFullscreen({ allowPrompt: true });
    }

    const onFullscreenChange = (): void => {
      globalState.fullscreen = isFullScreen();
    };

    onMounted(() => {
      globalState.fullscreen = isFullScreen();
      document.addEventListener("fullscreenchange", onFullscreenChange);

      if (
        runtime === "cube-app" &&
        (navigator.userAgent.toLocaleLowerCase().includes("android") ||
          navigator.userAgent.toLocaleLowerCase().includes("ios") ||
          navigator.userAgent.toLocaleLowerCase().includes("linux"))
      ) {
        Modal.confirm({
          title: "检查到正在使用移动端访问，是否进入全屏模式",
          centered: true,
          okText: "进入全屏",
          onOk() {
            void handleClick();
          },
          onCancel() {},
          class: "fullscreen-modal",
        });
      }
    });
    onBeforeUnmount(() => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    });

    expose({
      handleFullScreen: handleClick,
      handleFullScreenFromCommand,
    });
    return (): JSX.Element => (
      <div
        class={styles.item}
        onClick={() => {
          void handleClick();
        }}
      >
        {globalState.fullscreen ? "退出" : "进入"}
        全屏
      </div>
    );
  },
});
