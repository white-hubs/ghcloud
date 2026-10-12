import { defineStore } from "pinia";
import { reactive } from "vue";

import { createRealtimeRepository } from "../mocks/realtime.repository";
import { createRealtimeSeed } from "../mocks/realtime.seed";
import { usePositioningStore } from "./positioning";

export const useRealtimeStore = defineStore("personnel-positioning-realtime", () => {
  const positioning = usePositioningStore();
  const state = reactive(createRealtimeSeed(positioning.state));
  return createRealtimeRepository(state);
});
