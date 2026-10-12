import { inject, provide, reactive } from 'vue'
import { getEnvironment } from "@ghcloud/cube-utils"
import type { WorkbenchTab } from '../components/main-content/components/workbench/workbench'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import type { CallMediaType } from '@ghcloud/cube-rtc/src/data/call-define'

export enum WindowAction{
  MINIMIZE = 'minimize-window',
  MAXIMIZE = 'maximize-window',
  CLOSE = 'close-window',
  SETTING = 'setting-window',
}

export enum SliderKey{
  AI = "ai",
  MESSAGE = "message",
  TODO = "todo",
  ADDRESS_BOOK = "addressBook",
  WORKBENCH = "workbench",
}


// 定义全局状态类型
interface ClientUIState {
  activeSliderKey: SliderKey;
  inDeskTopClient: boolean;
  workbenchTabs: WorkbenchTab[];
  userInfo?: UserInfo;
  messageNum: number;
  clientBaseUrl: string;
  clickCommunicationButton: (params: { type: CallMediaType; userInfo: UserInfo; }) => void;
}
// 提供全局状态的 Symbol
const ClientUIStateSymbol = Symbol('ClientUIState');

// 创建全局状态
const createClientUIState = (): ClientUIState => {
  const state = reactive({
    activeSliderKey: SliderKey.MESSAGE,
    inDeskTopClient: false,
    workbenchTabs: [],
    messageNum: 0,
    clientBaseUrl: '',
    clickCommunicationButton: (): void => {},
  });
  return state;
};

// 提供全局状态的 Hook
export const useClientUIStateProvider = (): ClientUIState => {
  const state = createClientUIState();
  provide(ClientUIStateSymbol, state);
  return state;
};

// 注入全局状态的 Hook
export const useClientUIState = (): ClientUIState => {
  const state = inject<ClientUIState>(ClientUIStateSymbol);
  if (!state) {
    throw new Error('Client UI state not provided');
  }
  state.inDeskTopClient = getEnvironment() === "cubeDesktopClient"
  return state;
};