import { defineStore } from "pinia";
import { reactive } from "vue";

import { createSpaceArchiveRepository } from "../mocks/space-archive.repository";
import { createSpaceArchiveSeed } from "../mocks/space-archive.seed";

export const useSpaceArchiveStore = defineStore("personnel-positioning-space-archive", () => {
  const state = reactive(createSpaceArchiveSeed());
  return createSpaceArchiveRepository(state);
});
