import { defineComponent, type PropType, ref, onMounted, onUnmounted, computed } from "vue";

import styles from "./time-count-down.module.less";

export const TimeCountDown = defineComponent({
  name: "TimeCountDown",
  props: {
    startTime: {
      type: Number as PropType<number>,
      default: new Date().getTime(),
    },
    title: {
      type: String as PropType<string>,
      default: "处理倒计时",
    },
    showStartTime: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  setup(props) {
    const timeText = ref("");
    let timer: number | NodeJS.Timeout | null | undefined = null;

    // 格式化开始时间
    const formattedStartTime = computed(() => {
      const date = new Date(props.startTime);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    });

    const updateTime = (): void => {
      const now = new Date().getTime();
      const diff = now - props.startTime;

      // 只计算分钟和秒
      const minutes = Math.floor(diff / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      // 格式化为 00:00 格式（分:秒）
      timeText.value = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    onMounted(() => {
      updateTime();
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => {
        updateTime();
      }, 1000);
    });

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    });

    return (): JSX.Element => (
      <div class={styles.timeCount}>
        {props.showStartTime && <div class={styles.startTime}>开始时间: {formattedStartTime.value}</div>}
        {/* <div class={styles.timeCountTitle}>{props.title}</div> */}
        <div class={styles.timeCountValue}>{timeText.value}</div>
      </div>
    );
  },
});
