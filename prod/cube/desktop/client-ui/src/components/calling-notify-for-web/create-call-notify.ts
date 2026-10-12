import { type App, createApp, h } from 'vue';
import { CallingNotifyForWeb, type NotifyBoxProps } from './calling-notify-for-web';

let appInstance: App<Element> | null = null;

export function createCallNotifyForWebApp ({
  avatar,
  name,
  type,
  onHangup,
  onPickup
}: NotifyBoxProps & {
  onHangup: () => void;
  onPickup: () => void;
}): void {
  if (appInstance) {
    return;
  }

  // 创建根元素
  const root = document.createElement('div');
  root.id = 'cube-rtc-call-notify-for-web';
  document.body.append(root);

  // 创建 Vue 应用实例
  appInstance = createApp({
    setup () {
      return (): JSX.Element => h(CallingNotifyForWeb, {
        avatar,
        name,
        type,
        onHangup: ()=>{
          try {
            onHangup()
          } finally {
            unMountCallNotifyForApp()
          }
        },
        onPickup: ()=>{
          try {
            onPickup()
          } finally {
            unMountCallNotifyForApp()
          }
        }
      })
    }
  });

  // 挂载应用
  appInstance.mount(root);
}

export function unMountCallNotifyForApp (): void{
  appInstance?.unmount()
  appInstance = null
}
