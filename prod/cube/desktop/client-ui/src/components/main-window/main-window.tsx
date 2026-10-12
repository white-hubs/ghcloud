import { defineComponent, provide, watch } from 'vue'
import { TitleBar } from '../title-bar/title-bar'
import { SliderBar } from '../slider-bar/slider-bar'
import { type SliderKey, useClientUIStateProvider, type WindowAction } from '../../hook/use-client'
import { MainContent } from '../main-content/main-content'
import { CubeMessageEvent, type CubeAuth } from '@ghcloud/cube-protocol'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import type { WorkbenchTab } from '../main-content/components/workbench/workbench'
import type { CallMediaType } from '@ghcloud/cube-rtc/src/data/call-define'

interface Props {
  windowTitle: string;
  windowLogo: string;
  baseUrl?: string;
  authInfo: CubeAuth;
  userInfo?: UserInfo;
  msgNum?: number;
  workbenchTabs?: WorkbenchTab[];
}

/** 主窗口 */
export const MainWindow = defineComponent({
  props: ['windowTitle', 'windowLogo', 'baseUrl', 'authInfo', 'msgNum', 'userInfo', 'workbenchTabs'],
  emits: ['windowSet', 'toBusinessPage', 'sliderChange', 'clickCommunicationButton'],
  setup (props: Props, { emit }) {
    const clientUIState = useClientUIStateProvider()
    clientUIState.clickCommunicationButton = (params: { type: CallMediaType; userInfo: UserInfo; }): void => {
      emit('clickCommunicationButton', params)
    }
    provide('CLIENT_BASE_URL', props.baseUrl ?? '')
    provide('CUBE_AUTH_INFO', props.authInfo)


    // 事件监听 主要是跳转
    window.addEventListener('message', (event)=>{
      if (event.data.type === CubeMessageEvent.TO_BUSINESS_PAGE){
        emit('toBusinessPage', event.data.data)
      }
    })
    watch(()=>props.workbenchTabs, ()=>{
      clientUIState.workbenchTabs = props.workbenchTabs ?? []
    })
    watch(()=>props.userInfo, ()=>{
      clientUIState.userInfo = props.userInfo
    }, { immediate: true })
    watch(()=>props.msgNum, ()=>{
      clientUIState.messageNum = props.msgNum ?? 0
    }, { immediate: true })
    watch(()=>props.baseUrl, ()=>{
      clientUIState.clientBaseUrl = props.baseUrl ?? ''
    }, { immediate: true })

    return (): JSX.Element => (
      <>
        <TitleBar
          title={props.windowTitle}
          logo={props.windowLogo}
          onWindowSet={(val: WindowAction)=>{
            emit('windowSet', val)
          }}
        />
        <SliderBar onChange={(val: SliderKey)=>{
          emit('sliderChange', val)
        }} />
        <MainContent />
      </>
    )
  },
})