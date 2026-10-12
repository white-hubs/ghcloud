import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { USE_MOCK } from "@/constants/env";
import { ONLINE_STATES } from "@/constants/positioning";
import { usePositioningStore } from "@/stores/positioning";

export function objectListReturnTo(value: unknown): string {
  return typeof value === "string" && /^\/(?:objects(?:[/?#]|$)|realtime(?:[?#]|$))/.test(value) && !/[\\\r\n]/.test(value)
    ? value
    : "/objects";
}

export function usePersonContext() {
  const route = useRoute();
  const router = useRouter();
  const store = usePositioningStore();
  const personId = computed(() => String(route.params.id ?? ""));
  const person = computed(() => store.state.persons.find((item) => item.id === personId.value));
  const binding = computed(() => store.currentBinding(personId.value));
  const terminal = computed(() => {
    const current = binding.value;
    return current ? store.state.devices.find((item) => item.id === current.terminalId) : undefined;
  });
  const bindings = computed(() => store.history(personId.value));
  const points = computed(() => store.positionsFor(personId.value));
  const latestPoint = computed(() => {
    const current = binding.value;
    if (!current) return undefined;
    const realtime = store.state.realtimeLocations?.find(
      (point) =>
        point.personId === personId.value &&
        point.terminalId === current.terminalId &&
        Date.parse(point.at) >= Date.parse(current.startedAt),
    );
    if (realtime) return realtime;
    return points.value
      .filter((point) => point.terminalId === current.terminalId && Date.parse(point.at) >= Date.parse(current.startedAt))
      .at(-1);
  });
  const positionStatus = computed(() => {
    if (!binding.value && !person.value?.bound) return { label: "未绑定", color: "default" };
    if (!terminal.value) return { label: "终端信息不可用", color: "orange" };
    if (!terminal.value.enabled) return { label: "已停用", color: "default" };
    if (terminal.value.online !== "online") return ONLINE_STATES[terminal.value.online];
    return latestPoint.value ? { label: "在线", color: "green" } : { label: "暂无位置", color: "orange" };
  });
  const returnTo = computed(() => objectListReturnTo(route.query.returnTo));

  onMounted(async () => {
    await Promise.allSettled([
      store.loadPerson(personId.value).catch(() => undefined),
      store.refreshDevices("terminal"),
      store.refreshBindings(personId.value),
      ...(USE_MOCK ? [store.refreshRealtime()] : []),
    ]);
    if (binding.value || person.value?.bound) return;
    if (bindings.value.length) {
      await router.replace({
        name: "trajectory",
        params: { id: personId.value },
        query: { returnTo: returnTo.value },
      });
      return;
    }
    await router.replace(returnTo.value);
  });

  return { store, personId, person, binding, terminal, bindings, points, latestPoint, positionStatus, returnTo };
}
