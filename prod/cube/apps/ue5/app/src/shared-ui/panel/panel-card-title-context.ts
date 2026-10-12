import type { InjectionKey, Ref } from "vue";

export const panelCardTitleKey: InjectionKey<Readonly<Ref<string | undefined>>> = Symbol("panel-card-title");
