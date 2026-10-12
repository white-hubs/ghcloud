import dayjs from "dayjs";
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

import { appConfig } from "@/config/app-config";

import styles from "./layout.module.less";

export const Layout = defineComponent({
  emits: ["refresh"],
  props: {
    showRefresh: {
      type: Boolean,
      default: false,
    },
    refreshLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, emit }) {
    let dateCalcTimer: string | number | NodeJS.Timeout | null | undefined = null;
    const dateTime = ref({
      ymd: "",
      hms: "",
      week: "",
    });
    calcDateTime();
    const loadContent = ref(false);
    const animationDuration = "1s";

    onMounted(() => {
      dateCalcTimer = setInterval(() => {
        calcDateTime();
      }, 1000);
    });

    onBeforeUnmount(() => {
      dateCalcTimer && clearInterval(dateCalcTimer);
    });

    return (): JSX.Element => (
      <div class={styles["layout-container"]}>
        <div
          class={`${styles.header} animate__animated animate__slideInDown`}
          style={{ "animation-duration": animationDuration }}
          onAnimationend={() => {
            loadContent.value = true;
          }}
        >
          <img src="/apps/@ghcloud/higreen-data-viz/images/header.webp" style={{ width: "100%" }} />
          <div class={styles["date-time"]}>
            <span>{dateTime.value.ymd}</span>
            <span>{dateTime.value.week}</span>
            <span>{dateTime.value.hms}</span>
          </div>
          <div class={styles["title-value"]}>{appConfig.dataVizTitle}</div>
          <div
            class={`${styles["refresh-btn"]} ${props.refreshLoading ? styles.loading : ""}`}
            onClick={() => emit("refresh")}
            title="刷新数据"
          >
            <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
              <path
                d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
                opacity=".5"
              ></path>
              <path d="M744.4 522.4c-3.6-130-109.2-234.6-239.6-234.6-66.2 0-126.2 26.8-170.2 70.2l-47.8-47.8c-4.6-4.6-12.6-1.4-12.6 5.2v114c0 4.4 3.6 8 8 8h114c6.6 0 9.8-8 5.2-12.6l-48.4-48.4c34.8-34.6 82.6-56 135.2-56 104.2 0 188.8 83.4 191.8 187 0.2 6.6 5.6 11.8 12.2 11.8h36c6.8 0 12.4-5.6 12.2-12.4zM279.6 501.6c3.6 130 109.2 234.6 239.6 234.6 66.2 0 126.2-26.8 170.2-70.2l47.8 47.8c4.6 4.6 12.6 1.4 12.6-5.2v-114c0-4.4-3.6-8-8-8h-114c-6.6 0-9.8 8-5.2 12.6l48.4 48.4c-34.8 34.6-82.6 56-135.2 56-104.2 0-188.8-83.4-191.8-187-0.2-6.6-5.6-11.8-12.2-11.8h-36c-6.8 0-12.4 5.6-12.2 12.4z"></path>
            </svg>
            <span>刷新</span>
          </div>
        </div>
        {loadContent.value && <div class={styles.contents}>{slots.default?.()}</div>}
        <img
          src="/apps/@ghcloud/higreen-data-viz/images/slide-left.webp"
          class={`${styles.slide} animate__animated animate__slideInLeft`}
          style={{ "animation-duration": animationDuration }}
        />
        <img
          src="/apps/@ghcloud/higreen-data-viz/images/slide-right.webp"
          class={`${styles.slide} ${styles.right} animate__animated animate__slideInRight`}
          style={{ "animation-duration": animationDuration }}
        />
        <img
          src="/apps/@ghcloud/higreen-data-viz/images/footer.webp"
          class={`${styles.footer} animate__animated animate__slideInUp`}
          style={{ "animation-duration": animationDuration }}
        />
      </div>
    );

    function calcDateTime(): void {
      dateTime.value = {
        ymd: dayjs().format("YYYY-MM-DD"),
        hms: dayjs().format("HH:mm:ss"),
        week: `星期${["日", "一", "二", "三", "四", "五", "六"][dayjs().day()]}`,
      };
    }
  },
});
