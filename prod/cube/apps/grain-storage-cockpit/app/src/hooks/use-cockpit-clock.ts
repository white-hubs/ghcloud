import { computed, onMounted, onUnmounted, shallowRef, type ComputedRef } from "vue";

const formatDateTime = (value: Date): string => {
  const date = value.toLocaleDateString("zh-CN");
  const time = value.toLocaleTimeString("zh-CN", { hour12: false });
  return `${date} ${time}`;
};

const formatUpdateTime = (value: Date): string => {
  return value.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

export const useCockpitClock = (): {
  clock: ComputedRef<string>;
  updateTime: ComputedRef<string>;
} => {
  const now = shallowRef(new Date());
  const updatedAt = shallowRef(new Date());
  let clockTimer: ReturnType<typeof globalThis.setInterval> | undefined;
  let refreshTimer: ReturnType<typeof globalThis.setInterval> | undefined;

  onMounted(() => {
    clockTimer = globalThis.setInterval(() => {
      now.value = new Date();
    }, 1000);
    refreshTimer = globalThis.setInterval(() => {
      updatedAt.value = new Date();
    }, 30_000);
  });

  onUnmounted(() => {
    if (clockTimer !== undefined) globalThis.clearInterval(clockTimer);
    if (refreshTimer !== undefined) globalThis.clearInterval(refreshTimer);
  });

  const clock = computed(() => formatDateTime(now.value));
  const updateTime = computed(() => formatUpdateTime(updatedAt.value));
  return { clock, updateTime };
};
