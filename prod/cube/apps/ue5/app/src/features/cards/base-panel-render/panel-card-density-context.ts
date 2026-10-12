import type { InjectionKey, Ref } from "vue";

import type { CardSlotDensity } from "./card-slot-density";

export const panelCardDensityKey: InjectionKey<Ref<CardSlotDensity>> = Symbol("panelCardDensity");
