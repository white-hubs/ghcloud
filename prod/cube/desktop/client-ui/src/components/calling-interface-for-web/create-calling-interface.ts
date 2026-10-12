import { type App, createApp, h, ref } from 'vue';
import { CallingInterFaceForWeb, type CallingInterfaceForWebProps } from './calling-interface-for-web'
import type { ExposeCallStateData } from '@ghcloud/cube-rtc/src/call/call-state'

let appInstance: App<Element> | null = null;

export function createCallInterfaceForWebApp (initialProps: CallingInterfaceForWebProps & {
  onHangup: () => void;
  changeLocalAudio: (open: boolean) => void;
  changeLocalCamera: (domId: string, visible: boolean) => void;
  changeRemoteCamera: (params: { userId: string;visible: boolean;domId: string; }) => void;
}): { changeCallState: (callState: ExposeCallStateData) => void; } {
  const root = document.createElement('div');
  root.id = 'cube-rtc-call-interface-for-web';
  document.body.append(root);

  const { avatar, name, callState, onHangup, changeLocalAudio, changeLocalCamera, changeRemoteCamera } = initialProps;
  const callStateRef = ref(callState);
  appInstance = createApp({
    setup () {
      return (): JSX.Element => h(CallingInterFaceForWeb, {
        avatar,
        name,
        callState: callStateRef.value,
        onHangup: () => {
          try {
            onHangup();
          } finally {
            unMountCallInterfaceForApp();
          }
        },
        onChangeLocalAudio: (open: boolean) => {
          changeLocalAudio(open);
        },
        onChangeLocalCamera: (domId: string, visible: boolean) => {
          changeLocalCamera(domId, visible);
        },
        onChangeRemoteCamera: (params: { userId: string; visible: boolean; domId: string; })=>{
          changeRemoteCamera(params);
        }
      });
    }
  });

  appInstance.mount(root);
  return {
    changeCallState: (newCallState: ExposeCallStateData): void => {
      callStateRef.value = newCallState;
    }
  };
}

export function unMountCallInterfaceForApp (): void {
  appInstance?.unmount();
  appInstance = null;
}