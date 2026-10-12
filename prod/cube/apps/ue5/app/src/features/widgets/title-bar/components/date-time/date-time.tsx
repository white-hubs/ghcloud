import { defineComponent, onBeforeUnmount, onMounted, reactive } from "vue";

import { getNowDateTime } from "@/infrastructure/utils/common";

import styles from "./date-time.module.less";

export const DateTime = defineComponent({
  setup() {
    const state = reactive({
      date: "",
      time: "",
    });
    const nowTime = (): void => {
      const nowDateTime = getNowDateTime();
      state.date = nowDateTime.split(" ")[0];
      state.time = nowDateTime.split(" ")[1];
    };
    let timer = null;
    onMounted(() => {
      nowTime();
      timer = setInterval(() => {
        nowTime();
      }, 1000);
    });

    onBeforeUnmount(() => {
      timer && clearInterval(timer);
    });
    return (): JSX.Element => (
      <div class={styles["now-time"]}>
        <div class={styles.date}>{state.date}</div>
        <div class={styles.time}>{state.time}</div>
      </div>
    );
  },
});
