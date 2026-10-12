import { defineComponent, ref } from "vue";

import { appConfig } from "@/config/app-config";

import styles from "./layout.module.less";

export const Layout = defineComponent({
  setup(props, { slots }) {
    const loadContent = ref(false);
    const animationDuration = "1s";
    return (): JSX.Element => (
      <div class={styles["layout-container"]}>
        <div
          class={`${styles.header} animate__animated animate__slideInDown`}
          style={{ "animation-duration": animationDuration }}
          onAnimationend={() => {
            loadContent.value = true;
          }}
        >
          <img src="/apps/@ghcloud/higreen-data-viz/images/home/header.webp" style={{ width: "100%" }} />
          <div class={styles["title-value"]}>{appConfig.homeTitle}</div>
        </div>
        {loadContent.value && <div class={styles.contents}>{slots.default?.()}</div>}
        <img
          src="/apps/@ghcloud/higreen-data-viz/images/home/footer.webp"
          class={`${styles.footer} animate__animated animate__slideInUp`}
          style={{ "animation-duration": animationDuration }}
        />
        <video
          class={`${styles.gif}`}
          src="/apps/@ghcloud/higreen-data-viz/images/overview.mp4"
          style={{ display: loadContent.value ? "block" : "none", width: "100%", height: "100%", objectFit: "fill" }}
          autoplay
          muted
          loop
          playsinline
        />
      </div>
    );
  },
});
