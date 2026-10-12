import dayjs from "dayjs";
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

const icon = "/resource/v1/ue5-migrate/components/businessPanel/security-overview/assets/security-days-icon.png";

export const SecurityDays = defineComponent({
  name: "SecurityDays",
  setup() {
    const startTime = window.config?.systemStartTime ?? "2021-01-01";
    const days = ref(dayjs().diff(startTime, "day").toString());
    let timer: ReturnType<typeof setInterval> | null = null;

    onMounted(() => {
      timer = setInterval(() => {
        days.value = dayjs().diff(startTime, "day").toString();
      }, 60_000);
    });

    onBeforeUnmount(() => {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    return (): JSX.Element => (
      <div class="container">
        <img src={icon} class="icon" />
        <span class="title">安全运营天数</span>
        <div class="days-area">
          {days.value.split("").map((i, index) => (
            <span key={`${i}-${index}`}>{i}</span>
          ))}
        </div>
      </div>
    );
  },
});

export default SecurityDays;
