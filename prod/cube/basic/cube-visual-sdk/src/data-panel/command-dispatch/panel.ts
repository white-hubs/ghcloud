import type { PanelDescribe } from "../panel-definition";
import { command_dispatch_cards } from "./cards";

const commandDispatchLeftCards = [
  command_dispatch_cards.commandDispatch.cards.commandDispatchAlarmLevel,
  command_dispatch_cards.commandDispatch.cards.commandDispatchAlarmRank,
  command_dispatch_cards.commandDispatch.cards.commandDispatchAlarmAccuracy,
];

const commandDispatchRightCards = [
  command_dispatch_cards.commandDispatch.cards.commandDispatchDutyPerson,
  command_dispatch_cards.commandDispatch.cards.commandDispatchEmergencyBroadcast,
  command_dispatch_cards.commandDispatch.cards.commandDispatchAlarmEvent,
  command_dispatch_cards.commandDispatch.cards.commandDispatchAlarmAreaTop5,
];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const command_dispatch_panel: Record<string, PanelDescribe> = {
  commandDispatchLeft: {
    name: "指挥调度2.0-左面板",
    cards: commandDispatchLeftCards,
  },
  commandDispatchRight: {
    name: "指挥调度2.0-右面板",
    cards: commandDispatchRightCards,
  },
  // 配置端历史命名：CommandDispatchNew* → 与 commandDispatch* 同卡
  CommandDispatchNewLeft: {
    name: "指挥调度2.0-左面板",
    cards: commandDispatchLeftCards,
  },
  CommandDispatchNewRight: {
    name: "指挥调度2.0-右面板",
    cards: commandDispatchRightCards,
  },
};
