import type { InjectionKey } from "vue";

export type EmbeddedFlowDetailBackHandler = () => void;

export const embeddedFlowDetailBackKey: InjectionKey<EmbeddedFlowDetailBackHandler> = Symbol("embedded-flow-detail-back");

interface HistoryApi {
  back: () => void;
  go: (delta: number) => void;
}

interface FlowDetailBackOptions {
  onEmbeddedBack?: EmbeddedFlowDetailBackHandler;
  repeat: boolean;
  historyApi: HistoryApi;
  removeRepeatData: () => void;
}

export function performFlowDetailBack({ onEmbeddedBack, repeat, historyApi, removeRepeatData }: FlowDetailBackOptions): void {
  if (onEmbeddedBack) {
    onEmbeddedBack();
    return;
  }
  if (repeat) {
    removeRepeatData();
    historyApi.go(-3);
    return;
  }
  historyApi.back();
}
